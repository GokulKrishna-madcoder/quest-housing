import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import OpenAI from 'https://esm.sh/openai@4.28.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { type, record } = await req.json();

    if (type !== 'INSERT') {
       return new Response(JSON.stringify({ status: 'ignored' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const isOwner = !!record.phone;
    const name = record.full_name;
    const budget = record.budget_type || 'unspecified budget';
    const location = record.preferred_location || record.location || 'unspecified location';
    const propType = record.property_type || 'unspecified property type';

    const prompt = `You are a friendly real estate assistant for Quest Housing Bangalore. Generate a warm, professional WhatsApp message for a new lead named ${name}. They are looking for a ${propType} in ${location} with a budget of ${budget}. Keep it under 60 words. Never use the word brokerage, use "Fee for Services" instead.`;

    const apiKey = Deno.env.get('NVIDIA_API_KEY');
    if (!apiKey) throw new Error('NVIDIA_API_KEY is not set');

    const openai = new OpenAI({
      apiKey,
      baseURL: 'https://integrate.api.nvidia.com/v1',
    });

    const response = await openai.chat.completions.create({
      model: 'meta/llama-3.1-70b-instruct',
      messages: [
        { role: 'system', content: 'You are a friendly WhatsApp real estate assistant. Keep responses concise and warm.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 150,
    });

    const draftMessage = response.choices[0]?.message?.content || 'Hi! We received your inquiry. How can we help you today?';

    const { error } = await supabase.from('ai_drafts').insert({
      lead_id: record.id,
      lead_type: isOwner ? 'owner' : 'tenant',
      draft_message: draftMessage.trim(),
    });

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
