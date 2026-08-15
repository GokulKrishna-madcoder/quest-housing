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
    if (!['INSERT', 'UPDATE'].includes(type) || !record) {
       return new Response(JSON.stringify({ status: 'ignored' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const text = `${record.title} ${record.description} ${record.type} ${record.location} ${record.amenities?.join(' ')} ${record.furnishing} rent is ${record.price}`;

    const apiKey = Deno.env.get('NVIDIA_API_KEY');
    if (!apiKey) throw new Error('NVIDIA_API_KEY is not set');

    const openai = new OpenAI({
      apiKey,
      baseURL: 'https://integrate.api.nvidia.com/v1',
    });

    const embedResponse = await openai.embeddings.create({
      model: 'nvidia/nv-embedqa-mistral-7b-v2',
      input: text,
    });

    const embedding = embedResponse.data[0]?.embedding;

    if (embedding) {
      await supabase
        .from('properties')
        .update({ embedding })
        .eq('id', record.id);
    }

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
