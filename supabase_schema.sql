-- Run this SQL in your Supabase SQL Editor

-- Create owner_leads table
CREATE TABLE IF NOT EXISTS public.owner_leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    city TEXT DEFAULT 'Bangalore',
    property_type TEXT,
    location TEXT,
    description TEXT,
    highlights TEXT,
    image_urls TEXT[],
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create tenant_leads table
CREATE TABLE IF NOT EXISTS public.tenant_leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    city TEXT DEFAULT 'Bangalore',
    looking_for TEXT,
    property_type TEXT,
    preferred_location TEXT,
    preferences TEXT,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Analytics events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL,
    page TEXT,
    interaction TEXT,
    session_id TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS standard (allow inserts from anon, limit reads to authenticated)
ALTER TABLE public.owner_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for the public website form)
CREATE POLICY "Allow public insert to owner_leads" ON public.owner_leads FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public insert to tenant_leads" ON public.tenant_leads FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public insert to analytics_events" ON public.analytics_events FOR INSERT TO public WITH CHECK (true);

-- Allow admins to select/update/delete 
CREATE POLICY "Allow authenticated read owner_leads" ON public.owner_leads FOR SELECT TO authenticated USING (auth.email() = 'questhousingblr@gmail.com');
CREATE POLICY "Allow authenticated read tenant_leads" ON public.tenant_leads FOR SELECT TO authenticated USING (auth.email() = 'questhousingblr@gmail.com');
CREATE POLICY "Allow authenticated read analytics_events" ON public.analytics_events FOR SELECT TO authenticated USING (auth.email() = 'questhousingblr@gmail.com');

CREATE POLICY "Allow authenticated update owner_leads" ON public.owner_leads FOR UPDATE TO authenticated USING (auth.email() = 'questhousingblr@gmail.com');
CREATE POLICY "Allow authenticated delete owner_leads" ON public.owner_leads FOR DELETE TO authenticated USING (auth.email() = 'questhousingblr@gmail.com');
CREATE POLICY "Allow authenticated update tenant_leads" ON public.tenant_leads FOR UPDATE TO authenticated USING (auth.email() = 'questhousingblr@gmail.com');
CREATE POLICY "Allow authenticated delete tenant_leads" ON public.tenant_leads FOR DELETE TO authenticated USING (auth.email() = 'questhousingblr@gmail.com');
CREATE POLICY "Allow authenticated update analytics_events" ON public.analytics_events FOR UPDATE TO authenticated USING (auth.email() = 'questhousingblr@gmail.com');
CREATE POLICY "Allow authenticated delete analytics_events" ON public.analytics_events FOR DELETE TO authenticated USING (auth.email() = 'questhousingblr@gmail.com');

-- Create Storage Bucket for owner images
INSERT INTO storage.buckets (id, name, public) VALUES ('owner-property-images', 'owner-property-images', true) ON CONFLICT DO NOTHING;

-- Allows public uploads to the bucket
CREATE POLICY "Allow public uploads" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'owner-property-images');

-- Allows anyone to read images
CREATE POLICY "Allow public read" ON storage.objects FOR SELECT TO public USING (bucket_id = 'owner-property-images');
