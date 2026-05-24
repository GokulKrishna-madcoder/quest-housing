import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import OpenAI from "https://esm.sh/openai@4.28.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch analytics data
    const [leadsResponse, ownersResponse, propertiesResponse] = await Promise.all([
      supabase.from('instagram_leads').select('id', { count: 'exact' }),
      supabase.from('owner_leads').select('id', { count: 'exact' }),
      supabase.from('properties').select('availability_status'),
    ]);

    const totalTenantLeads = leadsResponse.count || 0;
    const totalOwnerLeads = ownersResponse.count || 0;
    
    const availableProperties = propertiesResponse.data?.filter(p => p.availability_status === 'Available').length || 0;
    const rentedProperties = propertiesResponse.data?.filter(p => p.availability_status === 'Rented').length || 0;

    const apiKey = Deno.env.get('NVIDIA_API_KEY') || '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';
    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://integrate.api.nvidia.com/v1",
    });

    const systemPrompt = `You are the Quest Housing Admin AI Analyst. 
You are an expert real estate business analyst.
Use the following real-time platform analytics to answer the admin's questions, provide insights, and suggest strategies.
If they ask for data you don't have, politely let them know.

CURRENT ANALYTICS:
- Total Tenant Leads in Funnel: ${totalTenantLeads}
- Total Owner Leads: ${totalOwnerLeads}
- Available Properties to Rent: ${availableProperties}
- Currently Rented Properties: ${rentedProperties}

Tone: Professional, highly analytical, concise, and structured. Use Markdown bullet points where necessary.`;

    const formattedMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.content
    }));

    const response = await openai.chat.completions.create({
      model: "meta/llama-3.1-70b-instruct",
      messages: [
        { role: "system", content: systemPrompt },
        ...formattedMessages
      ],
      max_tokens: 1000,
    });

    const text = response.choices[0].message.content || "I couldn't generate a response.";

    return new Response(JSON.stringify({ content: text, role: 'assistant' }), {
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
