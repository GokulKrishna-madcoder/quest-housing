import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import OpenAI from "https://esm.sh/openai@4.28.0";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are the Quest Housing Concierge AI. Your goal is to help users find properties in Bangalore, answer their FAQs, and collect their contact info (Name and WhatsApp number). 
Be extremely concise, polite, and use a premium tone. 
If they ask for properties, tell them to browse the "Portfolio" section or use the "Find My Home" form.
If they give you their contact info, politely acknowledge it and tell them a representative will reach out shortly.`
        },
        ...messages
      ],
    });

    return new Response(JSON.stringify(response.choices[0].message), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
