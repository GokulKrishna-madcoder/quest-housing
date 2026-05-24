import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import OpenAI from "https://esm.sh/openai@4.28.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages, sessionId = 'unknown-session' } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch properties
    const { data: properties } = await supabase
      .from('properties')
      .select('title, type, location, rent_amount, furnishing_status')
      .eq('availability_status', 'Available')
      .limit(10);
      
    const propertiesContext = properties && properties.length > 0
      ? JSON.stringify(properties) 
      : "No properties available at the moment.";

    const apiKey = Deno.env.get('NVIDIA_API_KEY') || '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';
    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://integrate.api.nvidia.com/v1",
    });

    const systemPrompt = `You are the Quest Housing Concierge AI. Your goal is to help users find properties in Bangalore, answer their FAQs, and collect their contact info (Name and WhatsApp number). 
Be extremely concise, polite, and use a premium tone. 
Here are the currently available properties:
${propertiesContext}
If they ask for properties, recommend 1-2 from the list above that match their criteria.
If they give you their contact info, ALWAYS call the 'capture_lead' function to save it, then politely acknowledge it and tell them a representative will reach out shortly.`;

    // Filter out previous system messages just in case, though the frontend sends user/assistant
    const formattedMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.content
    }));

    const tools = [{
      type: "function",
      function: {
        name: "capture_lead",
        description: "Captures a user's lead information when they provide their contact details and requirements.",
        parameters: {
          type: "object",
          properties: {
            name: { type: "string", description: "The full name of the user" },
            phone: { type: "string", description: "The WhatsApp or phone number of the user" },
            requirement: { type: "string", description: "What the user is looking for (e.g. 2 BHK in Koramangala)" },
          },
          required: ["name", "phone"],
        }
      }
    }];

    let response = await openai.chat.completions.create({
      model: "meta/llama-3.1-70b-instruct",
      messages: [
        { role: "system", content: systemPrompt },
        ...formattedMessages
      ],
      tools: tools as any,
      max_tokens: 500,
    });

    let message = response.choices[0].message;
    let finalContent = message.content;

    // Check if the model decided to call a function
    if (message.tool_calls && message.tool_calls.length > 0) {
      const call = message.tool_calls[0];
      if (call.function.name === "capture_lead") {
         const args = JSON.parse(call.function.arguments);
         
         // Insert into Supabase
         await supabase.from('chatbot_leads').insert({
           name: args.name,
           phone: args.phone,
           requirement: args.requirement || "General Inquiry"
         });
         
         // Send result back to model to get the final text response
         const toolMessages = [
           { role: "system", content: systemPrompt },
           ...formattedMessages,
           message,
           {
             role: "tool",
             tool_call_id: call.id,
             content: JSON.stringify({ success: true })
           }
         ];

         const secondResponse = await openai.chat.completions.create({
           model: "meta/llama-3.1-70b-instruct",
           messages: toolMessages as any,
           max_tokens: 500,
         });

         finalContent = secondResponse.choices[0].message.content;
      }
    }

    if (!finalContent) {
      finalContent = "Thank you. Your request has been recorded.";
    }

    const latestMessage = messages[messages.length - 1].content;
    
    // Log the conversation asynchronously
    supabase.from('chatbot_conversations').insert({
      session_id: sessionId,
      user_message: latestMessage,
      bot_response: finalContent
    }).then(() => console.log("Logged conversation"));

    return new Response(JSON.stringify({ content: finalContent, role: 'assistant' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
