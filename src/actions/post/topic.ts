"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export type TopicFormData = {
  name: string;
  slug: string;
  image?: string;
};

/**
 * Get all topics
 */
export const getAllTopics = async () => {
  try {
    const topics = await db.topic.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    return { success: true, data: topics };
  } catch (error) {
    console.error("Failed to fetch topics:", error);
    return { success: false, error: "Failed to load topics" };
  }
};

/**
 * Get a topic by ID
 */
export const getTopicById = async (id: number) => {
  try {
    const topic = await db.topic.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    if (!topic) {
      return { success: false, error: "Topic not found" };
    }

    return { success: true, data: topic };
  } catch (error) {
    console.error(`Failed to fetch topic with ID ${id}:`, error);
    return { success: false, error: "Failed to load topic" };
  }
};

/**
 * Get a topic by slug
 */
export const getTopicBySlug = async (slug: string) => {
  try {
    const topic = await db.topic.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    if (!topic) {
      return { success: false, error: "Topic not found" };
    }

    return { success: true, data: topic };
  } catch (error) {
    console.error(`Failed to fetch topic with slug ${slug}:`, error);
    return { success: false, error: "Failed to load topic" };
  }
};

/**
 * Create a new topic
 */
export const createTopic = async (data: TopicFormData) => {
  try {
    // Check if topic with slug already exists
    const existingTopic = await db.topic.findUnique({
      where: { slug: data.slug },
    });

    if (existingTopic) {
      return { success: false, error: "A topic with this slug already exists" };
    }

    const newTopic = await db.topic.create({
      data: {
        name: data.name,
        slug: data.slug,
        image: data.image,
      },
    });

    revalidatePath("/admin/topics");
    revalidatePath("/blog");
    return { success: true, data: newTopic };
  } catch (error) {
    console.error("Failed to create topic:", error);
    return { success: false, error: "Failed to create topic" };
  }
};

/**
 * Update an existing topic
 */
export const updateTopic = async (id: number, data: TopicFormData) => {
  try {
    // Check if another topic already uses the slug
    const existingTopic = await db.topic.findFirst({
      where: {
        slug: data.slug,
        NOT: { id },
      },
    });

    if (existingTopic) {
      return { success: false, error: "Another topic with this slug already exists" };
    }

    const updatedTopic = await db.topic.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        image: data.image,
      },
    });

    revalidatePath("/admin/topics");
    revalidatePath("/blog");
    revalidatePath(`/blog/topic/${data.slug}`);
    return { success: true, data: updatedTopic };
  } catch (error) {
    console.error(`Failed to update topic with ID ${id}:`, error);
    return { success: false, error: "Failed to update topic" };
  }
};

/**
 * Delete a topic
 */
export const deleteTopic = async (id: number) => {
  try {
    // Check if topic has associated posts
    const topicWithPosts = await db.topic.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    if (topicWithPosts?._count.posts && topicWithPosts._count.posts > 0) {
      return {
        success: false,
        error: "Cannot delete topic with associated posts. Remove posts first or reassign them.",
      };
    }

    await db.topic.delete({
      where: { id },
    });

    revalidatePath("/admin/topics");
    revalidatePath("/blog");
    return { success: true };
  } catch (error) {
    console.error(`Failed to delete topic with ID ${id}:`, error);
    return { success: false, error: "Failed to delete topic" };
  }
};

/**
 * Get popular topics (with the most posts)
 */
export const getPopularTopics = async (limit = 5) => {
  try {
    const topics = await db.topic.findMany({
      take: limit,
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
      orderBy: {
        posts: {
          _count: "desc",
        },
      },
    });

    return { success: true, data: topics };
  } catch (error) {
    console.error("Failed to fetch popular topics:", error);
    return { success: false, error: "Failed to load popular topics" };
  }
};
