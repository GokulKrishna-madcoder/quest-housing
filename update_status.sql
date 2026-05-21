-- 1. Add status column to existing tables
ALTER TABLE public.owner_leads ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending';
ALTER TABLE public.tenant_leads ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending';

-- 2. Drop any previous update/delete policies if they exist to prevent duplicates
DROP POLICY IF EXISTS "Allow authenticated update owner_leads" ON public.owner_leads;
DROP POLICY IF EXISTS "Allow authenticated delete owner_leads" ON public.owner_leads;
DROP POLICY IF EXISTS "Allow authenticated update tenant_leads" ON public.tenant_leads;
DROP POLICY IF EXISTS "Allow authenticated delete tenant_leads" ON public.tenant_leads;

-- 3. Add update and delete policies for admins
CREATE POLICY "Allow authenticated update owner_leads" ON public.owner_leads FOR UPDATE TO authenticated USING (auth.email() = 'questhousingblr@gmail.com');
CREATE POLICY "Allow authenticated delete owner_leads" ON public.owner_leads FOR DELETE TO authenticated USING (auth.email() = 'questhousingblr@gmail.com');

CREATE POLICY "Allow authenticated update tenant_leads" ON public.tenant_leads FOR UPDATE TO authenticated USING (auth.email() = 'questhousingblr@gmail.com');
CREATE POLICY "Allow authenticated delete tenant_leads" ON public.tenant_leads FOR DELETE TO authenticated USING (auth.email() = 'questhousingblr@gmail.com');
