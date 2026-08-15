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
    if (type !== 'INSERT' || !record || record.phone) {
      return new Response(JSON.stringify({ status: 'ignored' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const leadId = record.id;
    const name = record.full_name || 'there';
    const propertyType = record.property_type || 'property';
    const location = record.preferred_location || '';
    const budget = record.budget_type || '';
    const furnishing = record.furnishing_type || '';

    const requirementText = `Looking for ${propertyType} in ${location}. Budget is ${budget}. Needs to be ${furnishing}`;

    const apiKey = Deno.env.get('NVIDIA_API_KEY');
    if (!apiKey) throw new Error('NVIDIA_API_KEY is not set');

    const openai = new OpenAI({
      apiKey,
      baseURL: 'https://integrate.api.nvidia.com/v1',
    });

    const embedResponse = await openai.embeddings.create({
      model: 'nvidia/nv-embedqa-mistral-7b-v2',
      input: requirementText,
    });

    const embedding = embedResponse.data[0]?.embedding;

    if (!embedding) {
      return new Response(JSON.stringify({ error: 'No embedding generated' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const { data: matches, error: matchError } = await supabase.rpc('match_properties', {
      query_embedding: embedding,
      match_threshold: 0.3,
      match_count: 3,
    });

    if (matchError) throw matchError;

    if (matches && matches.length > 0) {
      const matchRows = matches.map((m: any) => ({
        lead_id: leadId,
        lead_type: 'tenant',
        property_id: m.id,
        similarity_score: m.similarity,
        match_reason: `Matched based on ${propertyType} requirements in ${location}`,
      }));

      const { error: insertError } = await supabase.from('ai_matches').insert(matchRows);
      if (insertError) throw insertError;

      const matchNames = matches.map((m: any) => m.title).join(', ');
      const draftPrompt = `Generate a warm, professional WhatsApp message for a new lead named ${name}. They are looking for a ${propertyType} in ${location} with a budget of ${budget}. Recommend these matching properties: ${matchNames}. Keep it under 80 words. Never use the word brokerage, use "Fee for Services" instead.`;

      const draftResponse = await openai.chat.completions.create({
        model: 'meta/llama-3.1-70b-instruct',
        messages: [
          { role: 'system', content: 'You are a friendly WhatsApp real estate assistant for Quest Housing Bangalore.' },
          { role: 'user', content: draftPrompt },
        ],
        max_tokens: 200,
      });

      const draftMessage = draftResponse.choices[0]?.message?.content || 'Hi! We found some great matches for you.';

      await supabase.from('ai_drafts').insert({
        lead_id: leadId,
        lead_type: 'tenant',
        draft_message: draftMessage.trim(),
        status: 'ai_matched',
      });
    }

    return new Response(
      JSON.stringify({ success: true, matches_found: matches?.length || 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
