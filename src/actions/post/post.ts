"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Post } from "@/types/blog";

export type PostFormData = {
  title: string;
  slug: string;
  shortDescription?: string;
  content?: string;
  cover?: string;
  topicId?: number;
};

/**
 * Get all posts with optional pagination
 */
export const getAllPosts = async (page = 1, pageSize = 10) => {
  try {
    const skip = (page - 1) * pageSize;

    const [posts, total] = await Promise.all([
      db.post.findMany({
        skip,
        take: pageSize,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              id: true,
              fullname: true,
              email: true,
            },
          },
          topic: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      db.post.count(),
    ]);

    return {
      success: true,
      data: posts,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return { success: false, error: "Failed to load posts" };
  }
};

/**
 * Get a post by its ID
 */
export const getPostById = async (id: number) => {
  try {
    const post = await db.post.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullname: true,
            email: true,
          },
        },
        topic: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!post) {
      return { success: false, error: "Post not found" };
    }

    return { success: true, data: post };
  } catch (error) {
    console.error(`Failed to fetch post with ID ${id}:`, error);
    return { success: false, error: "Failed to load post" };
  }
};

/**
 * Get a post by its slug
 */
export const getPostBySlug = async (slug: string) => {
  try {
    const post = await db.post.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            id: true,
            fullname: true,
            email: true,
          },
        },
        topic: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!post) {
      return { success: false, error: "Post not found" };
    }

    return { success: true, data: post };
  } catch (error) {
    console.error(`Failed to fetch post with slug ${slug}:`, error);
    return { success: false, error: "Failed to load post" };
  }
};

/**
 * Get posts by topic ID or slug
 */
export const getPostsByTopic = async (topicIdentifier: number | string, page = 1, pageSize = 10) => {
  try {
    const skip = (page - 1) * pageSize;

    // Determine if we're searching by ID or slug
    const whereCondition =
      typeof topicIdentifier === "number" ? { topicId: topicIdentifier } : { topic: { slug: topicIdentifier } };

    const [posts, total] = await Promise.all([
      db.post.findMany({
        where: whereCondition,
        skip,
        take: pageSize,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              id: true,
              fullname: true,
              email: true,
            },
          },
          topic: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      db.post.count({
        where: whereCondition,
      }),
    ]);

    return {
      success: true,
      data: posts,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    console.error(`Failed to fetch posts for topic ${topicIdentifier}:`, error);
    return { success: false, error: "Failed to load posts for this topic" };
  }
};

/**
 * Create a new post
 */
export const createPost = async (data: PostFormData, userId: number) => {
  try {
    // Check if post with slug already exists
    const existingPost = await db.post.findUnique({
      where: { slug: data.slug },
    });

    if (existingPost) {
      return { success: false, error: "A post with this slug already exists" };
    }

    const newPost = await db.post.create({
      data: {
        title: data.title,
        slug: data.slug,
        shortDescription: data.shortDescription || null,
        content: data.content || null,
        cover: data.cover || null,
        topicId: data.topicId || null,
        userId,
        logs: {
          create: {
            userId,
            title: "POST_CREATED",
            description: `Post "${data.title}" created`,
          },
        },
      },
    });

    revalidatePath("/admin/posts");
    revalidatePath("/blog");
    return { success: true, data: newPost };
  } catch (error) {
    console.error("Failed to create post:", error);
    return { success: false, error: "Failed to create post" };
  }
};

/**
 * Update an existing post
 */
export const updatePost = async (id: number, data: PostFormData, userId: number) => {
  try {
    // Check if another post already uses the slug
    const existingPost = await db.post.findFirst({
      where: {
        slug: data.slug,
        NOT: { id },
      },
    });

    if (existingPost) {
      return { success: false, error: "Another post with this slug already exists" };
    }

    const updatedPost = await db.post.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        shortDescription: data.shortDescription || null,
        content: data.content || null,
        cover: data.cover || null,
        topicId: data.topicId || null,
        updatedAt: new Date(),
        logs: {
          create: {
            userId,
            title: "POST_UPDATED",
            description: `Post "${data.title}" updated`,
            // No need to specify postId as it's handled by the relation
          },
        },
      },
    });

    revalidatePath("/admin/posts");
    revalidatePath(`/blog/${data.slug}`);
    revalidatePath("/blog");
    return { success: true, data: updatedPost };
  } catch (error) {
    console.error(`Failed to update post with ID ${id}:`, error);
    return { success: false, error: "Failed to update post" };
  }
};

/**
 * Delete a post
 */
export const deletePost = async (id: number, userId: number) => {
  try {
    // Get the post first to log the title
    const post = await db.post.findUnique({
      where: { id },
      select: { title: true },
    });

    if (!post) {
      return { success: false, error: "Post not found" };
    }

    // Create a log entry before deleting
    await db.log.create({
      data: {
        userId,
        title: "POST_DELETED",
        description: `Post "${post.title}" deleted`,
      },
    });

    // Delete the post
    await db.post.delete({
      where: { id },
    });

    revalidatePath("/admin/posts");
    revalidatePath("/blog");
    return { success: true };
  } catch (error) {
    console.error(`Failed to delete post with ID ${id}:`, error);
    return { success: false, error: "Failed to delete post" };
  }
};

/**
 * Search posts by title or content
 */
export const searchPosts = async (query: string, page = 1, pageSize = 10) => {
  try {
    const skip = (page - 1) * pageSize;

    const [posts, total] = await Promise.all([
      db.post.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { shortDescription: { contains: query } },
            { content: { contains: query } },
          ],
        },
        skip,
        take: pageSize,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              id: true,
              fullname: true,
              email: true,
            },
          },
          topic: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      db.post.count({
        where: {
          OR: [
            { title: { contains: query } },
            { shortDescription: { contains: query } },
            { content: { contains: query } },
          ],
        },
      }),
    ]);

    return {
      success: true,
      data: posts,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    console.error(`Failed to search posts with query "${query}":`, error);
    return { success: false, error: "Failed to search posts" };
  }
};
