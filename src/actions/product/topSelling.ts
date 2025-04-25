"use server";

import { connectToDB } from "@/lib/database";
import { Settings } from "@/models/settings";
import { Product } from "@/models/products";
import { TTopSellingCard } from "@/features/product/types";
import { TopSellingProducts as fallbackProducts } from "@/features/product/constants";
import { revalidatePath } from "next/cache";

// Get formatted top selling products for display on the homepage
export async function getFormattedTopSelling(): Promise<TTopSellingCard[]> {
  try {
    await connectToDB();

    // Get the list of top selling product IDs from settings
    const settings = await Settings.findOne();
    if (!settings?.topSellingProducts || settings.topSellingProducts.length === 0) {
      return [];
    }

    // Fetch the complete product data for each top selling product
    const products = await Product.find({
      _id: { $in: settings.topSellingProducts },
      isActive: true,
    });

    // Map database products to TTopSellingCard format
    return products.map((product) => ({
      name: product.name,
      imgUrl:
        product.images?.length > 1 ? [product.images[0], product.images[1]] : [product.images[0], product.images[0]],
      price: product.price,
      dealPrice: product.salePrice || undefined,
      specs: product.features || [],
      url: `/product/${product._id}`,
      soldCount: product.soldCount || Math.floor(Math.random() * 500) + 100, // Fallback if no real sales data
    }));
  } catch (error) {
    console.error("Failed to fetch top selling products:", error);
    return [];
  }
}

// Get just the IDs of top selling products for the dashboard
export async function getTopSellingProducts(): Promise<string[]> {
  try {
    await connectToDB();
    const settings = await Settings.findOne();
    return settings?.topSellingProducts || [];
  } catch (error) {
    console.error("Failed to fetch top selling product IDs:", error);
    return [];
  }
}

// Update the list of top selling products from the dashboard
export async function updateTopSellingProducts(productIds: string[]): Promise<boolean> {
  try {
    await connectToDB();

    // Find settings document or create if it doesn't exist
    await Settings.findOneAndUpdate({}, { $set: { topSellingProducts: productIds } }, { upsert: true });

    // Revalidate paths that show top selling products
    revalidatePath("/");
    revalidatePath("/list");

    return true;
  } catch (error) {
    console.error("Failed to update top selling products:", error);
    return false;
  }
}
