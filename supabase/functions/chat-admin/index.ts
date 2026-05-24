import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import OpenAI from "https://esm.sh/openai@4.28.0";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages, analyticsContext } = await req.json();

    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are the Quest Housing Admin AI Analyst. 
You are an expert real estate business analyst.
Use the following real-time platform analytics to answer the admin's questions, provide insights, and suggest strategies.
Format your responses using clean markdown (bolding, bullet points) for readability.

--- CURRENT PLATFORM ANALYTICS ---
${analyticsContext}
----------------------------------`
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
