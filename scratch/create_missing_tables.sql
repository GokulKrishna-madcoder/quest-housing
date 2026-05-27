CREATE TABLE IF NOT EXISTS public.ai_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id text,
  lead_source text,
  matched_property_id uuid REFERENCES public.properties(id),
  score real,
  match_reason text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.visit_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES public.properties(id),
  lead_name text NOT NULL,
  lead_phone text NOT NULL,
  preferred_date_1 date,
  preferred_date_2 date,
  preferred_date_3 date,
  preferred_time text DEFAULT 'morning',
  confirmed_date date,
  confirmed_time text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
