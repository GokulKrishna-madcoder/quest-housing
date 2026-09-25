-- Fix RLS for instagram_leads
CREATE POLICY "Allow auth insert instagram" ON public.instagram_leads FOR INSERT TO authenticated WITH CHECK (true);

-- Fix RLS for owner_leads
CREATE POLICY "Allow auth insert owner" ON public.owner_leads FOR INSERT TO authenticated WITH CHECK (true);
