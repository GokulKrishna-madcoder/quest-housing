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
      title: "Specs (e.g. 3 Beds • 3 Baths • 2,500 sqft)",
      type: "string",
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
