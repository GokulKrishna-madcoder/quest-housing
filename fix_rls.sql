-- Fix for RLS "violates row-level security policy" error

-- 1. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public insert to owner_leads" ON public.owner_leads;
DROP POLICY IF EXISTS "Allow public insert to tenant_leads" ON public.tenant_leads;
DROP POLICY IF EXISTS "Allow public insert to analytics_events" ON public.analytics_events;

-- 2. Create the new permissive policies allowing inserts for everyone (public)
CREATE POLICY "Allow public insert to owner_leads" ON public.owner_leads FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public insert to tenant_leads" ON public.tenant_leads FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public insert to analytics_events" ON public.analytics_events FOR INSERT TO public WITH CHECK (true);
