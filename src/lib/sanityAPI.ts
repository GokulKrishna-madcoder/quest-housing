import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

export const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID || "plwm0dhf",
  dataset: import.meta.env.VITE_SANITY_DATASET || "production",
  apiVersion: "2024-05-20",
  useCdn: false, // Ensures fresh data
});

const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
  return builder.image(source);
}

// Keep backward-compat alias
export const sanityClient = client;

// Fetch all properties
export async function fetchProperties() {
  return client.fetch(`*[_type == "property"]{
    _id,
    title,
    "id": id.current,
    location,
    price,
    specs,
    image,
    image2,
    image3,
    featured,
    description,
    amenities
  }`);
}

// Fetch first 4 featured properties for the Home page
export async function fetchFeaturedProperties() {
  return client.fetch(`*[_type == "property" && featured == true][0...4]{
    _id,
    title,
    "id": id.current,
    location,
    price,
    specs,
    image,
    image2,
    image3,
    featured
  }`);
}

// Fetch a single property by its slug (id field)
export async function fetchPropertyById(slug: string) {
  return client.fetch(
    `*[_type == "property" && id.current == $slug][0]{
      _id,
      title,
      "id": id.current,
      location,
      price,
      specs,
      image,
      image2,
      image3,
      featured,
      description,
      amenities
    }`,
    { slug }
  );
}

// Fetch testimonials (unchanged from original)
export async function fetchTestimonials() {
  const query = `*[_type == "testimonial"]{
    _id,
    clientName,
    clientType,
    rating,
    review,
    clientImage
  }`;
  return client.fetch(query);
}
