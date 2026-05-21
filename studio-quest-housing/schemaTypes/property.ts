import { defineField, defineType } from "sanity";

export default defineType({
  name: "property",
  title: "Property",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: "id",
      title: "ID / Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: "price",
      title: "Price/Rent",
      type: "string",
    }),
    defineField({
      name: "specs",
      title: "Property Specifications",
      type: "object",
      fields: [
        defineField({
          name: "propertyType",
          title: "Property Type",
          type: "string",
          options: {
            list: ["Apartment", "Villa", "Studio", "PG", "Commercial"],
          },
        }),
        defineField({
          name: "bedrooms",
          title: "Bedrooms",
          type: "number",
        }),
        defineField({
          name: "bathrooms",
          title: "Bathrooms",
          type: "number",
        }),
        defineField({
          name: "area",
          title: "Area (sqft)",
          type: "string",
        }),
        defineField({
          name: "furnishing",
          title: "Furnishing Status",
          type: "string",
          options: {
            list: ["Fully Furnished", "Semi-Furnished", "Unfurnished"],
          },
        }),
      ],
    }),
    defineField({
      name: "image",
      title: "Image 1 — Main Cover URL",
      type: "string",
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: "image2",
      title: "Image 2 URL",
      type: "string",
    }),
    defineField({
      name: "image3",
      title: "Image 3 URL",
      type: "string",
    }),
    defineField({
      name: "featured",
      title: "Featured Property",
      type: "boolean",
      initialValue: false,
    }),
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
    }),
  ],
});
