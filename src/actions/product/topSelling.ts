"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { TTopSellingCard } from "@/features/product/types";

/**
 * Gets the current list of top selling product IDs
 */
export const getTopSellingProducts = async () => {
  try {
    const setting = await db.setting.findFirst({
      where: { key: "topSellingProducts" },
    });

    if (!setting || !setting.value) {
      return { res: [] };
    }

    // The value is stored as a JSON string of product IDs
    const productIds = JSON.parse(setting.value as string) as string[];
    return { res: productIds };
  } catch (error) {
    console.error("Error fetching top selling products:", error);
    return { error: "Failed to fetch top selling products" };
  }
};

/**
 * Updates the list of top selling product IDs
 */
export const updateTopSellingProducts = async (productIds: string[]) => {
  try {
    // Find existing setting or create a new one
    const setting = await db.setting.upsert({
      where: { key: "topSellingProducts" },
      update: {
        value: JSON.stringify(productIds),
      },
      create: {
        key: "topSellingProducts",
        value: JSON.stringify(productIds),
      },
    });

    // Revalidate necessary pages
    revalidatePath("/");
    revalidatePath("/list");

    return { res: true };
  } catch (error) {
    console.error("Error updating top selling products:", error);
    return { error: "Failed to update top selling products" };
  }
};

/**
 * Gets the top selling products formatted for display on the frontend
 */
export const getFormattedTopSelling = async (): Promise<TTopSellingCard[]> => {
  try {
    // Get the list of top selling product IDs
    const { res: productIds, error } = await getTopSellingProducts();

    if (error || !productIds || productIds.length === 0) {
      return [];
    }

    // Fetch the actual products with these IDs
    const products = await db.product.findMany({
      where: {
        id: { in: productIds },
      },
      select: {
        id: true,
        name: true,
        images: true,
        price: true,
        salePrice: true,
        specialFeatures: true,
        soldCount: true,
      },
    });

    // Sort them according to the order in the productIds array
    const sortedProducts = productIds.map((id) => products.find((product) => product.id === id)).filter(Boolean);

    // Convert to the format expected by the UI
    return sortedProducts.map((product) => ({
      name: product!.name,
      imgUrl: [product!.images[0] || "", product!.images[1] || product!.images[0] || ""],
      price: product!.price,
      newPrice: product!.salePrice || undefined,
      specs: product!.specialFeatures || [],
      url: `/product/${product!.id}`,
      soldCount: product!.soldCount || 0,
    }));
  } catch (error) {
    console.error("Error formatting top selling products:", error);
    return [];
  }
};
