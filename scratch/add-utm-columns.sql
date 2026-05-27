ALTER TABLE public.instagram_leads ADD COLUMN IF NOT EXISTS utm_medium text;
ALTER TABLE public.instagram_leads ADD COLUMN IF NOT EXISTS utm_campaign text;

ALTER TABLE public.owner_leads ADD COLUMN IF NOT EXISTS utm_medium text;
ALTER TABLE public.owner_leads ADD COLUMN IF NOT EXISTS utm_campaign text;
