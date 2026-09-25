-- Phase 4: Operational Analytics RPC Functions
-- Run this in Supabase SQL Editor

-- Average lead response time (hours between lead creation and first timeline event)
CREATE OR REPLACE FUNCTION get_avg_response_time()
RETURNS float8 AS $$
  SELECT COALESCE(
    AVG(EXTRACT(EPOCH FROM (t.created_at - l.created_at)) / 3600),
    0
  )
  FROM (
    SELECT lead_id, lead_type, MIN(created_at) AS created_at
    FROM crm_timeline
    GROUP BY lead_id, lead_type
  ) t
  JOIN (
    SELECT id AS lead_id, 'owner' AS lead_type, created_at FROM owner_leads
    UNION ALL
    SELECT id AS lead_id, 'tenant' AS lead_type, created_at FROM instagram_leads
  ) l ON t.lead_id = l.lead_id AND t.lead_type = l.lead_type;
$$ LANGUAGE sql STABLE;

-- Lead velocity (new leads per day, last 30 days)
CREATE OR REPLACE FUNCTION get_lead_velocity()
RETURNS TABLE(day date, count bigint) AS $$
  SELECT d::date AS day, COALESCE(c.cnt, 0) AS count
  FROM generate_series(
    CURRENT_DATE - INTERVAL '29 days',
    CURRENT_DATE,
    '1 day'
  ) d
  LEFT JOIN (
    SELECT DATE(created_at) AS dt, COUNT(*) AS cnt
    FROM (
      SELECT created_at FROM owner_leads
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      UNION ALL
      SELECT created_at FROM instagram_leads
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    ) combined
    GROUP BY DATE(created_at)
  ) c ON c.dt = d::date
  ORDER BY day;
$$ LANGUAGE sql STABLE;

-- Visit conversion rate
CREATE OR REPLACE FUNCTION get_visit_conversion_rate()
RETURNS json AS $$
  SELECT json_build_object(
    'total_leads', (SELECT COUNT(*) FROM owner_leads) + (SELECT COUNT(*) FROM instagram_leads),
    'visits_requested', (SELECT COUNT(*) FROM user_events WHERE event_name = 'visit_requested'),
    'whatsapp_opened', (SELECT COUNT(*) FROM user_events WHERE event_name = 'whatsapp_opened')
  );
$$ LANGUAGE sql STABLE;
