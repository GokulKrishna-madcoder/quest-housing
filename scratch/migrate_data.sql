UPDATE public.properties SET
  price = rent_amount,
  deposit = deposit_amount,
  bhk = bedrooms,
  images = image_urls,
  furnishing = LOWER(REPLACE(furnishing_status, ' ', '-')),
  admin_status = CASE
    WHEN LOWER(availability_status) = 'available' THEN 'approved'
    WHEN LOWER(availability_status) = 'rented' THEN 'rented'
    ELSE 'pending'
  END,
  area = area_sqft,
  locality = location,
  listing_type = 'rent',
  category = 'residential',
  verification_type = 'unverified',
  featured = false,
  views_count = 0
WHERE id IS NOT NULL;
