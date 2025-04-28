"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { TTopSellingCard } from "@/features/product/types";

/**
 * Updates the top selling products in the database
 */
export const updateTopSellingProducts = async (productIds: string[]) => {
  if (!productIds) return { error: "Invalid product IDs!" };

  try {
    // First, reset the top selling status for all products
    await db.product.updateMany({
      data: {
        isTopSelling: false,
      },
    });

    // Then set the new top selling products
    if (productIds.length > 0) {
      // Update all selected products to be top selling
      await Promise.all(
        productIds.map(async (productId, index) => {
          await db.product.update({
            where: { id: productId },
            data: {
              isTopSelling: true,
              topSellingOrder: index, // Store the order
            },
          });
        })
      );
    }

    // Revalidate the home page to reflect changes
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error updating top selling products:", error);
    return { error: "Failed to update top selling products" };
  }
};

/**
 * Gets the current top selling products with full details needed for display
 */
export const getTopSellingProducts = async () => {
  try {
    // Get products marked as top selling
    const topSellingProducts = await db.product.findMany({
      where: {
        isTopSelling: true,
      },
      orderBy: {
        topSellingOrder: "asc",
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
    return { success: true, data: topSellingProducts };
  } catch (error) {
    console.error("Error fetching top selling products:", error);
    return { error: "Failed to fetch top selling products" };
  }
};

/**
 * Gets top selling products formatted for the front-end TopSellingCards component
 */
export const getFormattedTopSellingProducts = async (): Promise<TTopSellingCard[]> => {
  try {
    const response = await getTopSellingProducts();

    if (!response.success || !response.data || response.data.length === 0) {
      return [];
    }

    // Convert the database results to the TTopSellingCard format
    return response.data.map((product) => ({
      name: product.name,
      imgUrl: product.images.slice(0, 2),
      price: product.price,
      dealPrice: product.salePrice || undefined,
      specs: product.specialFeatures,
      url: `/product/${product.id}`,
      soldCount: product.soldCount || 0,
      fromColor: product.fromColor || undefined,
      toColor: product.toColor || undefined,
    }));
  } catch (error) {
    console.error("Error formatting top selling products:", error);
    return [];
  }
};
