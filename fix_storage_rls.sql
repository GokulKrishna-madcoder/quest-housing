-- Fix for Storage RLS "violates row-level security policy" error on image upload

-- 1. Drop existing storage policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;

-- 2. Create the new permissive policies allowing inserts and reads for everyone (public)
CREATE POLICY "Allow public uploads" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'owner-property-images');
CREATE POLICY "Allow public read" ON storage.objects FOR SELECT TO public USING (bucket_id = 'owner-property-images');
CREATE POLICY "Allow public update" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'owner-property-images');
CREATE POLICY "Allow public delete" ON storage.objects FOR DELETE TO public USING (bucket_id = 'owner-property-images');
