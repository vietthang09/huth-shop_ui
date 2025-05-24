"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export type CategoryFormData = {
  name: string;
  slug: string;
  image?: string;
};

export const getAllCategories = async () => {
  try {
    const categories = await db.category.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    return { success: true, data: categories };
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return { success: false, error: "Failed to load categories" };
  }
};

export const addCategory = async (data: CategoryFormData) => {
  try {
    // Check if category with slug already exists
    const existingCategory = await db.category.findUnique({
      where: { slug: data.slug }
    });

    if (existingCategory) {
      return { success: false, error: "A category with this slug already exists" };
    }

    const newCategory = await db.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        image: data.image
      }
    });

    revalidatePath('/admin/categories');
    return { success: true, data: newCategory };
  } catch (error) {
    console.error("Failed to create category:", error);
    return { success: false, error: "Failed to create category" };
  }
};

export const updateCategory = async (id: number, data: CategoryFormData) => {
  try {
    // Check if another category already uses the slug
    const existingCategory = await db.category.findFirst({
      where: {
        slug: data.slug,
        NOT: { id }
      }
    });

    if (existingCategory) {
      return { success: false, error: "Another category with this slug already exists" };
    }

    const updatedCategory = await db.category.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        image: data.image
      }
    });

    revalidatePath('/admin/categories');
    return { success: true, data: updatedCategory };
  } catch (error) {
    console.error("Failed to update category:", error);
    return { success: false, error: "Failed to update category" };
  }
};

export const deleteCategory = async (id: number) => {
  try {
    // Check if category has associated products
    const categoryWithProducts = await db.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (categoryWithProducts?._count.products && categoryWithProducts._count.products > 0) {
      return {
        success: false,
        error: "Cannot delete category with associated products. Remove products first or reassign them."
      };
    }

    await db.category.delete({
      where: { id }
    });

    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error) {
    console.error("Failed to delete category:", error);
    return { success: false, error: "Failed to delete category" };
  }
};
