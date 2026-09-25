import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const ADMIN_EMAIL = 'questhousingblr@gmail.com';
const FROM_EMAIL = 'onboarding@resend.dev'; // Resend test sender

// ─── HTML Email Builder ───
function buildEmail(subject: string, leadType: string, leadTypeColor: string, rows: { label: string; value: string }[]): string {
  const rowsHtml = rows
    .filter(r => r.value && r.value !== '-' && r.value !== 'null' && r.value !== 'undefined')
    .map(r => `
      <tr>
        <td style="padding:12px 16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#8b8fa3;border-bottom:1px dashed rgba(22,27,64,0.1);width:160px;vertical-align:top;">${r.label}</td>
        <td style="padding:12px 16px;font-size:14px;color:#161B40;font-weight:500;border-bottom:1px dashed rgba(22,27,64,0.1);">${r.value}</td>
      </tr>
    `).join('');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#F8F8F6;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    
    <!-- Header -->
    <div style="background-color:#161B40;padding:32px;text-align:center;">
      <h1 style="margin:0;font-size:20px;font-weight:700;letter-spacing:3px;color:#F7D112;text-transform:uppercase;">QUEST HOUSING</h1>
      <p style="margin:6px 0 0;font-size:11px;letter-spacing:4px;color:rgba(255,255,255,0.4);text-transform:uppercase;">Bangalore</p>
    </div>

    <!-- Badge -->
    <div style="background-color:${leadTypeColor};padding:10px 24px;text-align:center;">
      <span style="font-size:11px;font-weight:800;letter-spacing:3px;color:#161B40;text-transform:uppercase;">🔔 New ${leadType}</span>
    </div>

    <!-- Body -->
    <div style="background-color:#ffffff;border:1px dashed rgba(22,27,64,0.15);border-top:none;">
      <div style="padding:24px 16px 8px;">
        <p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:3px;color:rgba(22,27,64,0.35);">Lead Details</p>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        ${rowsHtml}
      </table>
      <div style="padding:20px 16px;">
        <p style="margin:0;font-size:11px;color:rgba(22,27,64,0.35);text-align:center;letter-spacing:1px;">
          Submitted on ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>

    <!-- CTA -->
    <div style="padding:24px 0;text-align:center;">
      <a href="https://questhousing.com/admin" style="display:inline-block;background-color:#161B40;color:#ffffff;font-size:11px;font-weight:800;letter-spacing:3px;text-transform:uppercase;text-decoration:none;padding:16px 40px;">
        Open Admin Panel →
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:16px;">
      <p style="margin:0;font-size:10px;color:rgba(22,27,64,0.25);letter-spacing:2px;text-transform:uppercase;">Quest Housing • Trusted Partner • Bangalore</p>
    </div>

  </div>
</body>
</html>`;
}

// ─── Template Generators ───

function tenantLeadEmail(r: any) {
  const budget = r.budget_type || `₹${r.budget_min || '?'} – ₹${r.budget_max || '?'}`;
  const propertyTypes = Array.isArray(r.property_type) ? r.property_type.join(', ') : r.property_type || '-';
  const furnishing = Array.isArray(r.furnishing_type) ? r.furnishing_type.join(', ') : r.furnishing_type || '-';
  const utm = [r.utm_source, r.utm_medium, r.utm_campaign].filter(Boolean).join(' / ') || 'Direct';

  return buildEmail(
    `🏠 New Tenant Lead: ${r.full_name}`,
    'Tenant Lead',
    '#F7D112',
    [
      { label: 'Name', value: r.full_name },
      { label: 'WhatsApp', value: r.whatsapp_number },
      { label: 'Budget', value: budget },
      { label: 'Location', value: r.preferred_location },
      { label: 'Pincode', value: r.preferred_pincode },
      { label: 'Move-in', value: r.move_in_type || r.move_in_date },
      { label: 'Property Type', value: propertyTypes },
      { label: 'Furnishing', value: furnishing },
      { label: 'Source', value: utm },
    ]
  );
}

function ownerLeadEmail(r: any) {
  const highlights = Array.isArray(r.highlights) ? r.highlights.join(', ') : r.highlights || '-';
  const utm = [r.utm_source, r.utm_medium, r.utm_campaign].filter(Boolean).join(' / ') || 'Direct';

  return buildEmail(
    `🏢 New Owner Lead: ${r.full_name}`,
    'Owner Lead',
    '#ABB9DD',
    [
      { label: 'Name', value: r.full_name },
      { label: 'Email', value: r.email },
      { label: 'Phone', value: r.phone },
      { label: 'WhatsApp', value: r.whatsapp },
      { label: 'City', value: r.city },
      { label: 'Property Type', value: r.property_type },
      { label: 'Location', value: r.location },
      { label: 'Description', value: r.description },
      { label: 'Highlights', value: highlights },
      { label: 'Source', value: utm },
    ]
  );
}

function visitSlotEmail(r: any, propertyTitle: string) {
  const dates = [r.preferred_date_1, r.preferred_date_2, r.preferred_date_3]
    .filter(Boolean)
    .map((d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }))
    .join('  ·  ');

  return buildEmail(
    `📅 New Visit Request: ${r.lead_name}`,
    'Visit Request',
    '#34d399',
    [
      { label: 'Name', value: r.lead_name },
      { label: 'Phone', value: r.lead_phone },
      { label: 'Preferred Dates', value: dates },
      { label: 'Preferred Time', value: r.preferred_time },
      { label: 'Property', value: propertyTitle },
    ]
  );
}

// ─── Send Email via Resend ───
async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `Quest Housing <${FROM_EMAIL}>`,
      to: [to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend API error: ${res.status} – ${err}`);
  }

  return await res.json();
}

// ─── Main Handler ───
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const record = payload.record;
    const table = payload.table;

    if (!record) {
      return new Response(JSON.stringify({ error: 'No record in payload' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    let subject = '';
    let html = '';

    if (table === 'instagram_leads') {
      subject = `🏠 New Tenant Lead: ${record.full_name || 'Unknown'}`;
      html = tenantLeadEmail(record);
    } else if (table === 'owner_leads') {
      subject = `🏢 New Owner Lead: ${record.full_name || 'Unknown'}`;
      html = ownerLeadEmail(record);
    } else if (table === 'visit_slots') {
      // Fetch property title for context
      let propertyTitle = 'Unknown Property';
      if (record.property_id) {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );
        const { data } = await supabase
          .from('properties')
          .select('title, locality')
          .eq('id', record.property_id)
          .single();
        if (data) {
          propertyTitle = `${data.title}${data.locality ? ` — ${data.locality}` : ''}`;
        }
      }
      subject = `📅 New Visit Request: ${record.lead_name || 'Unknown'}`;
      html = visitSlotEmail(record, propertyTitle);
    } else {
      return new Response(JSON.stringify({ error: `Unknown table: ${table}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const result = await sendEmail(ADMIN_EMAIL, subject, html);

    return new Response(JSON.stringify({ success: true, resend_id: result.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Email notification error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
