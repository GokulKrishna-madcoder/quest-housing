CREATE OR REPLACE FUNCTION public.get_avg_response_time()
RETURNS json
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN json_build_object('avg_response_time_hours', 2.5);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_lead_velocity()
RETURNS json
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN json_build_object(
    'current_week', (SELECT count(*) FROM public.user_events WHERE created_at >= now() - interval '7 days'),
    'previous_week', (SELECT count(*) FROM public.user_events WHERE created_at >= now() - interval '14 days' AND created_at < now() - interval '7 days')
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_visit_conversion_rate()
RETURNS json
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN json_build_object('conversion_rate', 0.0, 'total_visits', 0, 'total_leads', 0);
END;
$$;

CREATE OR REPLACE FUNCTION public.match_properties(p_lead_id text, p_lead_source text)
RETURNS TABLE(
  property_id uuid,
  title text,
  score real,
  reason text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.title, 0.5::real as score, 'matching property'::text as reason
  FROM public.properties p
  WHERE p.admin_status = 'approved'
  LIMIT 5;
END;
$$;
