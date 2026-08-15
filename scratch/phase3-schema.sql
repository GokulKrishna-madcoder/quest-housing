-- Phase 3: Premium Marketplace Schema
-- Run this in Supabase SQL Editor

-- Add coordinates to properties for Google Maps
ALTER TABLE properties ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS longitude double precision;

-- Add verification columns
ALTER TABLE properties ADD COLUMN IF NOT EXISTS verification_type text DEFAULT 'unverified';

-- Visit slots table
CREATE TABLE IF NOT EXISTS visit_slots (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  lead_id uuid,
  lead_type text,
  lead_name text NOT NULL,
  lead_phone text NOT NULL,
  preferred_date_1 date NOT NULL,
  preferred_date_2 date,
  preferred_date_3 date,
  preferred_time text DEFAULT 'morning',
  status text DEFAULT 'pending',
  admin_notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE visit_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon insert visits" ON visit_slots FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Auth insert visits" ON visit_slots FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth manage visits" ON visit_slots FOR ALL TO authenticated USING (true) WITH CHECK (true);
