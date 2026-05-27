-- Phase 5: AI Intelligence Layer — Vector Embeddings
-- Run this in Supabase SQL Editor

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to properties
ALTER TABLE properties ADD COLUMN IF NOT EXISTS embedding vector(768);

-- Create index for fast similarity search (only works if you have > 100 rows, otherwise skip)
-- CREATE INDEX IF NOT EXISTS idx_properties_embedding ON properties USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create ai_matches table for caching recommendations
CREATE TABLE IF NOT EXISTS ai_matches (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid NOT NULL,
  lead_type text NOT NULL,
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  similarity_score float NOT NULL,
  match_reason text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth full access ai_matches" ON ai_matches FOR ALL TO authenticated USING (true) WITH CHECK (true);
