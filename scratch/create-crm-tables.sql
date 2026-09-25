-- Add lead_score and assigned_to to lead tables
ALTER TABLE public.owner_leads ADD COLUMN IF NOT EXISTS lead_score int DEFAULT 50;
ALTER TABLE public.instagram_leads ADD COLUMN IF NOT EXISTS lead_score int DEFAULT 50;

-- CRM Notes table
CREATE TABLE IF NOT EXISTS public.crm_notes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id text NOT NULL,
  lead_type text NOT NULL CHECK (lead_type IN ('owner', 'tenant')),
  note text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- CRM Reminders table
CREATE TABLE IF NOT EXISTS public.crm_reminders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id text NOT NULL,
  lead_type text NOT NULL CHECK (lead_type IN ('owner', 'tenant')),
  title text NOT NULL,
  due_date timestamptz NOT NULL,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- CRM Events timeline table (for wa.me clicks, status changes, etc.)
CREATE TABLE IF NOT EXISTS public.crm_timeline (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id text NOT NULL,
  lead_type text NOT NULL CHECK (lead_type IN ('owner', 'tenant')),
  event_type text NOT NULL,
  event_detail text,
  created_at timestamptz DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.crm_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated full access" ON public.crm_notes FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated full access" ON public.crm_reminders FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated full access" ON public.crm_timeline FOR ALL TO authenticated USING (true);

-- Allow anon inserts into timeline (for wa.me click tracking from frontend)
CREATE POLICY "Anon insert timeline" ON public.crm_timeline FOR INSERT TO anon WITH CHECK (true);
