CREATE TABLE IF NOT EXISTS public.user_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text,
  event_name text NOT NULL,
  event_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon insert" ON public.user_events FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow service role full access" ON public.user_events FOR ALL TO service_role USING (true);
CREATE INDEX IF NOT EXISTS user_events_event_name_idx ON public.user_events(event_name);
CREATE INDEX IF NOT EXISTS user_events_session_idx ON public.user_events(session_id);
CREATE INDEX IF NOT EXISTS user_events_created_at_idx ON public.user_events(created_at DESC);
