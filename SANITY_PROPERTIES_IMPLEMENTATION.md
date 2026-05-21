# Step-by-Step Guide: Implementing Properties with Sanity CMS

This guide outlines exactly how to transition the "Properties" section of the Quest Housing website from static mock data to a dynamic Sanity CMS backend, allowing you to easily add, edit, and manage property listings.

## Phase 1: Set Up Sanity Studio

1. **Initialize Sanity Studio**
   Open a new terminal window in your project root and run:
   ```bash
   npm create sanity@latest
   ```
   - Respond to the prompts to create or log in to your Sanity account.
   - Choose a project name (e.g., `quest-housing-cms`).
   - Select the default dataset (`production`).
   - For the project template, choose **Clean project with no sample data**.
   - Select **TypeScript** if asked.

2. **Create the Property Schema**
   Navigate to the newly created `sanity-studio` directory (or your chosen path) and navigate to `schemas`.
   Create a new file named `property.ts` (or `.js`):
   
   ```typescript
   import { defineField, defineType } from "sanity";

   export default defineType({
     name: "property",
     title: "Property",
     type: "document",
     fields: [
       defineField({ name: "title", title: "Title", type: "string", validation: Rule => Rule.required() }),
       defineField({
         name: "id",
         title: "ID / Slug",
         type: "slug",
         options: { source: "title", maxLength: 96 },
       }),
       defineField({ name: "location", title: "Location", type: "string", validation: Rule => Rule.required() }),
       defineField({ name: "price", title: "Price/Rent", type: "string" }),
       defineField({ name: "specs", title: "Specs (e.g. 3 Beds • 3 Baths • 2,500 sqft)", type: "string" }),
       defineField({ name: "image", title: "Main Image URL (or use image type)", type: "string" }),
       defineField({ name: "featured", title: "Featured Property", type: "boolean", initialValue: false }),
       defineField({
         name: "description",
         title: "Description",
         type: "text",
       }),
       defineField({
         name: "amenities",
         title: "Amenities",
         type: "array",
         of: [{ type: "string" }],
       })
     ],
   });
   ```

3. **Register the Schema**
   In the Sanity Studio folder, open `schemaTypes/index.ts` (or `schemas/schema.js`) and add the property schema:
   
   ```typescript
   import property from './property';
   
   export const schemaTypes = [property]
   ```

4. **Deploy Studio (Optional)**
   Run `npm run deploy` inside your Sanity folder to host your CMS on a live Sanity URL.

## Phase 2: Integrate Sanity into the React Frontend

1. **Install Dependencies**
   In the root of your primary app folder, install the Sanity client packages:
   ```bash
   npm install @sanity/client @sanity/image-url
   ```

2. **Set up Environment Variables**
   Create or edit your `.env` (or `.env.local`) in your React project root:
   ```env
   VITE_SANITY_PROJECT_ID="your_project_id_here"
   VITE_SANITY_DATASET="production"
   ```

3. **Create the Sanity Client Utility**
   Create a new file `src/lib/sanityAPI.ts`:
   
   ```typescript
   import { createClient } from "@sanity/client";
   import imageUrlBuilder from "@sanity/image-url";

   export const client = createClient({
     projectId: import.meta.env.VITE_SANITY_PROJECT_ID || "your_project_id_here",
     dataset: import.meta.env.VITE_SANITY_DATASET || "production",
     apiVersion: "2024-05-20", 
     useCdn: false, // Ensures fresh data
   });

   const builder = imageUrlBuilder(client);

   export function urlFor(source: any) {
     return builder.image(source);
   }

   // Fetch functions
   export async function fetchProperties() {
     return client.fetch(`*[_type == "property"]{
       _id, title, "id": id.current, location, price, specs, image, featured, description, amenities
     }`);
   }
   
   export async function fetchFeaturedProperties() {
     return client.fetch(`*[_type == "property" && featured == true][0...4]{
        _id, title, "id": id.current, location, price, specs, image, featured
     }`);
   }

   export async function fetchPropertyById(slug: string) {
     return client.fetch(`*[_type == "property" && id.current == $slug][0]`, { slug });
   }
   ```

## Phase 3: Wire Data to Components

1. **Update `src/pages/Properties.tsx`**
   Change the component to fetch from Sanity instead of `data.ts`.
   
   ```tsx
   import { useEffect, useState } from 'react';
   import { fetchProperties } from '../lib/sanityAPI';
   // import other icons and motion components...
   
   export default function Properties() {
     const [properties, setProperties] = useState([]);
     const [loading, setLoading] = useState(true);
     
     useEffect(() => {
       fetchProperties().then((data) => {
         setProperties(data);
         setLoading(false);
       });
     }, []);

     if (loading) return <div className="min-h-screen flex items-center justify-center">Loading properties...</div>;

     // Render the Properties list using the `properties` state variable
     // ...
   }
   ```

2. **Update `src/pages/Home.tsx`**
   Similarly, apply `useEffect` to grab featured properties from `fetchFeaturedProperties()` and map through the state to render the horizontal property scroll area.

3. **Update `src/pages/PropertyDetails.tsx`**
   Replace the `properties.find()` logic with a dynamic fetch using the `id` from the URL parameters.
   
   ```tsx
   import { useEffect, useState } from 'react';
   import { useParams } from 'react-router-dom';
   import { fetchPropertyById } from '../lib/sanityAPI';
   
   export default function PropertyDetails() {
     const { id } = useParams();
     const [property, setProperty] = useState(null);
     
     useEffect(() => {
       if(id) {
         fetchPropertyById(id).then(setProperty);
       }
     }, [id]);

     if (!property) return <div>Loading...</div>;

     // ... render your layout
   }
   ```

## Final Steps
1. Push some dummy data to your Sanity Studio at localhost:3333 (or your deployed URL).
2. Start up your Vite development server using `npm run dev`.
3. Test your `Properties`, `Home` and `PropertyDetails` pages to map correctly. 

You can now fully manage all property listings globally via the CMS!
