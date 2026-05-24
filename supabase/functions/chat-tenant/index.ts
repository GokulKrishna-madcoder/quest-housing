import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { GoogleGenerativeAI, SchemaType } from "https://esm.sh/@google/generative-ai@0.24.1";
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

    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') as string);
    
    // Define Tool
    const captureLeadTool = {
      functionDeclarations: [
        {
          name: "capture_lead",
          description: "Captures a user's lead information when they provide their contact details and requirements.",
          parameters: {
            type: SchemaType.OBJECT,
            properties: {
              name: { type: SchemaType.STRING, description: "The full name of the user" },
              phone: { type: SchemaType.STRING, description: "The WhatsApp or phone number of the user" },
              requirement: { type: SchemaType.STRING, description: "What the user is looking for (e.g. 2 BHK in Koramangala)" },
            },
            required: ["name", "phone"],
          },
        },
      ],
    };

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      tools: [captureLeadTool],
      systemInstruction: `You are the Quest Housing Concierge AI. Your goal is to help users find properties in Bangalore, answer their FAQs, and collect their contact info (Name and WhatsApp number). 
Be extremely concise, polite, and use a premium tone. 
Here are the currently available properties:
${propertiesContext}
If they ask for properties, recommend 1-2 from the list above that match their criteria.
If they give you their contact info, ALWAYS call the 'capture_lead' function to save it, then politely acknowledge it and tell them a representative will reach out shortly.`
    });

    let formattedHistory = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    while (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
      formattedHistory.shift();
    }

    const chat = model.startChat({
      history: formattedHistory,
    });

    const latestMessage = messages[messages.length - 1].content;
    let result = await chat.sendMessage(latestMessage);
    
    // Check if the model decided to call a function safely
    const calls = typeof result.response.functionCalls === 'function' 
      ? result.response.functionCalls() 
      : result.response.functionCalls;
    const call = calls?.[0];
    
    if (call && call.name === "capture_lead") {
       const args = call.args;
       
       // Insert into Supabase
       await supabase.from('chatbot_leads').insert({
         name: args.name,
         phone: args.phone,
         requirement: args.requirement || "General Inquiry"
       });
       
       // Send result back to model to get the final text response
       result = await chat.sendMessage([{
         functionResponse: {
           name: "capture_lead",
           response: { success: true }
         }
       }]);
    }

    let text = "";
    try {
      text = result.response.text();
    } catch (e) {
      // If the model response contains only function calls or is blocked, .text() throws.
      text = "Thank you. Your request has been recorded.";
    }

    // Log the conversation asynchronously
    supabase.from('chatbot_conversations').insert({
      session_id: sessionId,
      user_message: latestMessage,
      bot_response: text
    }).then(() => console.log("Logged conversation"));

    return new Response(JSON.stringify({ content: text, role: 'assistant' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
