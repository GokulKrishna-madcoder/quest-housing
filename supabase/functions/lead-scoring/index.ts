import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

    const { record } = await req.json();
    if (!record) {
      return new Response(JSON.stringify({ error: 'No record' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const sessionId = record.session_id;
    const eventName = record.event_name;

    // Score mapping
    const scoreMap: Record<string, number> = {
      property_view: 5,
      whatsapp_opened: 20,
      visit_requested: 30,
      lead_created: 15,
      funnel_started: 3,
      funnel_completed: 10,
    };

    const points = scoreMap[eventName] ?? 2;

    // Get all events for this session to calculate cumulative score
    const { data: events } = await supabase
      .from('user_events')
      .select('event_name')
      .eq('session_id', sessionId);

    let totalScore = 0;
    for (const evt of events || []) {
      totalScore += scoreMap[evt.event_name] ?? 2;
    }
    totalScore = Math.min(totalScore, 100);

    // Determine temperature
    const temperature = totalScore >= 70 ? 'HOT' : totalScore >= 40 ? 'WARM' : 'COLD';

    // Try to find and update matching leads created in this session
    const { data: sessionEvents } = await supabase
      .from('user_events')
      .select('event_data')
      .eq('session_id', sessionId)
      .eq('event_name', 'lead_created');

    if (sessionEvents && sessionEvents.length > 0) {
      const eventData = sessionEvents[0].event_data;
      if (eventData?.source === 'tenant_funnel' && eventData?.whatsapp) {
        await supabase
          .from('instagram_leads')
          .update({ lead_score: totalScore, lead_temperature: temperature })
          .eq('whatsapp_number', eventData.whatsapp);
      } else if (eventData?.source === 'owner_funnel' && eventData?.phone) {
        await supabase
          .from('owner_leads')
          .update({ lead_score: totalScore, lead_temperature: temperature })
          .eq('phone', eventData.phone);
      }
    }

    return new Response(
      JSON.stringify({ score: totalScore, temperature, points_added: points }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
