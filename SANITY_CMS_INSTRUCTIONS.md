# Quest Housing: Sanity CMS Setup & Architecture

## 1. Architecture Overview
- **Frontend**: Next.js (currently prototyped with React/Vite, migrate to Next.js for ISR/SSR).
- **CMS (Content)**: **Sanity CMS**. Manages Properties, Blogs, Testimonials, Hero, FAQs, Team, Locations, and Media.
- **Lead Storage**: **Google Sheets**. Maintains a scalable, no-SQL spreadsheet database for Leads.
- **Form Backend**: **Google Apps Script Web App**. Handles API `fetch` directly from the frontend to Google Sheets.

## 2. Environment Variables (.env / .env.local)

Add these to your Next.js root folder:

```env
# Forms Backend
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_ACTUAL_ID_HERE/exec

# Sanity CMS config (Prefix with NEXT_PUBLIC_ for Next.js)
NEXT_PUBLIC_SANITY_PROJECT_ID="your_project_id"
NEXT_PUBLIC_SANITY_DATASET="production"
NEXT_PUBLIC_SANITY_API_VERSION="2024-05-20"

# Optional: Server-side token if reading drafts or performing writes
SANITY_API_TOKEN="your_token_here"
```

## 3. Initializing Sanity CMS

1. In your root folder, initialize a Sanity studio.
```bash
npm create sanity@latest -- --projectId YOUR_PROJECT_ID --dataset production
```
2. Choose a clean, minimal "Clean Project" template.
3. Install dependencies inside the `sanity-studio` folder.

## 4. Sanity Schemas

Add the following schemas to your Sanity `schemas` folder:

### A. schemaTypes/property.ts
```typescript
import { defineField, defineType } from "sanity";

export default defineType({
  name: "property",
  title: "Property",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
    }),
    defineField({
      name: "propertyType",
      title: "Property Type",
      type: "string",
      options: {
        list: [
          { title: "Apartment", value: "Apartment" },
          { title: "Villa", value: "Villa" },
          { title: "Studio", value: "Studio" },
          { title: "Penthouse", value: "Penthouse" },
        ],
      },
    }),
    defineField({ name: "location", title: "Location", type: "string" }),
    defineField({ name: "city", title: "City", type: "string", initialValue: "Bangalore" }),
    defineField({ name: "rent", title: "Monthly Rent", type: "string" }),
    defineField({ name: "deposit", title: "Security Deposit", type: "string" }),
    defineField({ name: "bedrooms", title: "Bedrooms", type: "number" }),
    defineField({ name: "bathrooms", title: "Bathrooms", type: "number" }),
    defineField({
      name: "furnishing",
      title: "Furnishing Status",
      type: "string",
      options: {
        list: [
          { title: "Fully Furnished", value: "Fully Furnished" },
          { title: "Semi Furnished", value: "Semi Furnished" },
          { title: "Unfurnished", value: "Unfurnished" },
        ],
      },
    }),
    defineField({ name: "area", title: "Area Details", type: "string", description: "e.g., 2,500 sq ft" }),
    defineField({
      name: "availabilityStatus",
      title: "Availability Status",
      type: "string",
      options: {
        list: [
          { title: "Available", value: "Available" },
          { title: "Rented", value: "Rented" },
          { title: "Off-Market", value: "Off-Market" },
        ],
      },
      initialValue: "Available",
    }),
    defineField({ name: "featuredProperty", title: "Featured Property", type: "boolean", initialValue: false }),
    defineField({ name: "description", title: "Description", type: "text" }),
    defineField({
      name: "amenities",
      title: "Premium Amenities",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "highlights",
      title: "Highlights",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({ name: "thumbnailImage", title: "Thumbnail Image", type: "image", options: { hotspot: true } }),
    defineField({
      name: "galleryImages",
      title: "Gallery Images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    defineField({ name: "seoTitle", title: "SEO Title", type: "string" }),
    defineField({ name: "seoDescription", title: "SEO Description", type: "text" }),
  ],
});
```

### B. schemaTypes/testimonial.ts
```typescript
import { defineField, defineType } from "sanity";

export default defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  fields: [
    defineField({ name: "clientName", title: "Client Name", type: "string" }),
    defineField({
      name: "clientType",
      title: "Client Type",
      type: "string",
      options: { list: ["Tenant", "Property Owner", "Investor"] },
    }),
    defineField({ name: "review", title: "Review", type: "text" }),
    defineField({ name: "rating", title: "Rating (1-5)", type: "number", validation: (Rule) => Rule.min(1).max(5) }),
    defineField({ name: "clientImage", title: "Client Image", type: "image", options: { hotspot: true } }),
  ],
});
```

*Create additional schema files (`blog.ts`, `heroSection.ts`, `faq.ts`, `teamMember.ts`, `location.ts`) following standard Sanity practices.*

### C. Update `schemaTypes/index.ts`
```typescript
import property from "./property";
import testimonial from "./testimonial";
// import others...

export const schemaTypes = [property, testimonial];
```

## 5. Next.js Integration

### A. Install Client
```bash
npm install next-sanity @sanity/image-url @sanity/client
```

### B. `src/lib/sanityAPI.ts`
```typescript
import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-05-20",
  useCdn: false, // Ensures fresh data
});

const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
  return builder.image(source);
}

// GROQ Queries
export async function fetchFeaturedProperties() {
  const query = `*[_type == "property" && featuredProperty == true]{
    _id,
    title,
    "slug": slug.current,
    location,
    city,
    rent,
    bedrooms,
    bathrooms,
    thumbnailImage,
    propertyType
  }`;
  return client.fetch(query);
}
```

## 6. How is Google Sheets Preserved?

The file `/src/pages/Registration.tsx` is kept untouched via Payload or Sanity logic. Next.js (or Vite) triggers the `fetch()` with the payload referencing `VITE_APPS_SCRIPT_URL` straight to Google Sheets APIs via Apps Script `doPost(e)`. **Lead data completely skips Sanity CMS**, preventing database lock-in for form data.

## 7. Migration from Payload to Sanity

1. Stop the Payload CMS instance.
2. Ensure you have the Payload CMS content backed up (if any).
3. Push to `Vercel` via standard Next.js setups utilizing `@sanity/client`.
4. Replace `# PAYLOAD_URL` in `.env` with `NEXT_PUBLIC_SANITY_PROJECT_ID`.
5. Your Google Sheets structure remains completely untouched and functional because no backend database changes were made to forms.
