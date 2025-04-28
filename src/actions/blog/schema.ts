import { z } from "zod";

export const BlogFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  shortText: z.string().min(10, "Short text must be at least 10 characters"),
  imgUrl: z.string().url("Please provide a valid URL").optional().nullable(),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  isPublished: z.boolean().default(false),
});
