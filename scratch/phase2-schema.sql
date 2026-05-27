-- Phase 2: AI Automation & Smart CRM Schema
-- Run this in Supabase SQL Editor

-- Add lead temperature to both lead tables
ALTER TABLE owner_leads ADD COLUMN IF NOT EXISTS lead_temperature text DEFAULT 'WARM';
ALTER TABLE instagram_leads ADD COLUMN IF NOT EXISTS lead_temperature text DEFAULT 'WARM';

-- AI Drafts table — stores AI-generated first-response messages
CREATE TABLE IF NOT EXISTS ai_drafts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid NOT NULL,
  lead_type text NOT NULL,
  draft_message text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth full access ai_drafts" ON ai_drafts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Overdue alerts table — auto-generated alerts for missed followups
CREATE TABLE IF NOT EXISTS overdue_alerts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid NOT NULL,
  lead_type text NOT NULL,
  alert_type text NOT NULL,
  alert_message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE overdue_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth full access overdue_alerts" ON overdue_alerts FOR ALL TO authenticated USING (true) WITH CHECK (true);
