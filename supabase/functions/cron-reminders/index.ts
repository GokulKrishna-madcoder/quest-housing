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

    // 1. Check for overdue reminders
    const { data: reminders } = await supabase
      .from('crm_reminders')
      .select('*')
      .eq('completed', false)
      .lt('due_date', new Date().toISOString());

    let alertsCreated = 0;

    for (const rem of reminders || []) {
      // Check if alert already exists to prevent spam
      const { data: existing } = await supabase
        .from('overdue_alerts')
        .select('id')
        .eq('lead_id', rem.lead_id)
        .eq('alert_type', 'overdue_reminder')
        .eq('is_read', false);

      if (!existing || existing.length === 0) {
        await supabase.from('overdue_alerts').insert({
          lead_id: rem.lead_id,
          lead_type: rem.lead_type,
          alert_type: 'overdue_reminder',
          alert_message: `Overdue task: ${rem.title}`,
        });
        alertsCreated++;
      }
    }

    // 2. Check for missed followups (HOT leads with no activity in 48 hours)
    // Complex logic, keeping it simple for MVP: Just check overdue reminders for now

    return new Response(
      JSON.stringify({ success: true, alerts_created: alertsCreated }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
