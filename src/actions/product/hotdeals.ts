"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { TDealCard } from "@/features/product/types";

/**
 * Updates the hot deals products in the database
 */
export const updateHotDeals = async (productIds: string[]) => {
  if (!productIds) return { error: "Invalid product IDs!" };

  try {
    // First, reset the hot deal status for all products
    await db.product.updateMany({
      data: {
        isHotDeal: false,
      },
    });

    // Then set the new hot deals
    if (productIds.length > 0) {
      // Update all selected products to be hot deals
      await Promise.all(
        productIds.map(async (productId, index) => {
          await db.product.update({
            where: { id: productId },
            data: {
              isHotDeal: true,
              hotDealOrder: index, // Store the order
            },
          });
        })
      );
    }

    // Revalidate the home page to reflect changes
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Error updating hot deals:", error);
    return { error: "Failed to update hot deals" };
  }
};

/**
 * Gets the current hot deals products with full details needed for display
 */
export const getHotDeals = async () => {
  try {
    // Get products marked as hot deals
    const hotDeals = await db.product.findMany({
      where: {
        isHotDeal: true,
        salePrice: { not: null },
      },
      orderBy: {
        hotDealOrder: "asc",
      },
      select: {
        id: true,
        name: true,
        images: true,
        price: true,
        salePrice: true,
        specialFeatures: true,
        isAvailable: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    // The data is already in the format we need
    return { success: true, data: hotDeals };
  } catch (error) {
    console.error("Error fetching hot deals:", error);
    return { error: "Failed to fetch hot deals" };
  }
};

/**
 * Gets hot deals formatted for the front-end TodayDealCards component
 */
export const getFormattedHotDeals = async (): Promise<TDealCard[]> => {
  try {
    const response = await getHotDeals();

    if (!response.success || !response.data || response.data.length === 0) {
      return [];
    }

    // Convert the database results to the TDealCard format
    return response.data.map((product) => ({
      name: product.name,
      imgUrl: product.images.slice(0, 2),
      price: product.price,
      dealPrice: product.salePrice || 0,
      specs: product.specialFeatures || [],
      url: `/product/${product.id}`,
      dealDate: new Date("1970-01-01T18:00:00"), // Default date for countdown
    }));
  } catch (error) {
    console.error("Error formatting hot deals:", error);
    return [];
  }
};
