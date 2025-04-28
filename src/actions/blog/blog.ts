"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { BlogFormSchema } from "./schema";

export type BlogFormValues = z.infer<typeof BlogFormSchema>;

/**
 * Retrieves a paginated list of all blogs
 */
export const getAllBlogs = async (page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;

    const [blogs, totalCount] = await Promise.all([
      db.blog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: {
              name: true,
            },
          },
        },
      }),
      db.blog.count(),
    ]);

    return {
      blogs,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    };
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return { error: "Failed to fetch blogs" };
  }
};

/**
 * Retrieves a list of published blogs for the public site
 */
export const getPublishedBlogs = async (limit?: number) => {
  try {
    const blogs = await db.blog.findMany({
      where: {
        isPublished: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      ...(limit ? { take: limit } : {}),
      select: {
        id: true,
        title: true,
        shortText: true,
        imgUrl: true,
        slug: true,
        createdAt: true,
        authorId: true,
        author: {
          select: {
            name: true,
          },
        },
      },
    });

    return blogs;
  } catch (error) {
    console.error("Error fetching published blogs:", error);
    return [];
  }
};

/**
 * Retrieves a single blog by its ID
 */
export const getBlogById = async (id: string) => {
  if (!id) return { error: "Blog ID is required" };

  try {
    const blog = await db.blog.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!blog) return { error: "Blog not found" };
    return { blog };
  } catch (error) {
    console.error("Error fetching blog:", error);
    return { error: "Failed to fetch blog" };
  }
};

/**
 * Retrieves a single blog by its slug
 */
export const getBlogBySlug = async (slug: string) => {
  if (!slug) return { error: "Blog slug is required" };

  try {
    const blog = await db.blog.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!blog) return { error: "Blog not found" };
    return { blog };
  } catch (error) {
    console.error("Error fetching blog by slug:", error);
    return { error: "Failed to fetch blog" };
  }
};

/**
 * Creates a new blog post
 */
export const createBlog = async (data: BlogFormValues, authorId?: string) => {
  const validation = BlogFormSchema.safeParse(data);

  if (!validation.success) {
    return { error: "Invalid blog data" };
  }

  try {
    const blog = await db.blog.create({
      data: {
        ...validation.data,
        // Only add authorId if it exists, otherwise let it be null
        ...(authorId ? { authorId } : {}),
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/blogs");
    revalidatePath("/blog");

    return { blog };
  } catch (error) {
    console.error("Error creating blog:", error);
    if ((error as any).code === "P2002") {
      return { error: "A blog with this slug already exists" };
    }
    return { error: "Failed to create blog" };
  }
};

/**
 * Updates an existing blog post
 */
export const updateBlog = async (id: string, data: BlogFormValues) => {
  const validation = BlogFormSchema.safeParse(data);

  if (!validation.success) {
    return { error: "Invalid blog data" };
  }

  try {
    const blog = await db.blog.update({
      where: { id },
      data: validation.data,
    });

    revalidatePath("/");
    revalidatePath("/admin/blogs");
    revalidatePath(`/blog/${blog.slug}`);

    return { blog };
  } catch (error) {
    console.error("Error updating blog:", error);
    if ((error as any).code === "P2002") {
      return { error: "A blog with this slug already exists" };
    }
    return { error: "Failed to update blog" };
  }
};

/**
 * Deletes a blog post
 */
export const deleteBlog = async (id: string) => {
  if (!id) return { error: "Blog ID is required" };

  try {
    await db.blog.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/admin/blogs");
    revalidatePath("/blog");

    return { success: true };
  } catch (error) {
    console.error("Error deleting blog:", error);
    return { error: "Failed to delete blog" };
  }
};

/**
 * Updates the published status of a blog post
 */
export const toggleBlogPublished = async (id: string, isPublished: boolean) => {
  if (!id) return { error: "Blog ID is required" };

  try {
    const blog = await db.blog.update({
      where: { id },
      data: { isPublished },
    });

    revalidatePath("/");
    revalidatePath("/admin/blogs");
    revalidatePath("/blog");
    revalidatePath(`/blog/${blog.slug}`);

    return { success: true };
  } catch (error) {
    console.error("Error updating blog published status:", error);
    return { error: "Failed to update blog published status" };
  }
};
