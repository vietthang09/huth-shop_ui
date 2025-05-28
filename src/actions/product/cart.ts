"use server";
import { db } from "@/lib/db";

/**
 * Get products for the shopping cart by their IDs
 * This function retrieves products with their properties for the shopping cart display
 * @param productIds Array of product IDs
 * @param variantIds Optional array of variant IDs to fetch specific variants
 */
export const getCartProducts = async (productIds: number[], variantIds?: number[]) => {
  try {
    if (!productIds || productIds.length === 0) {
      return { success: false, error: "No product IDs provided" };
    }

    console.log("Fetching products with IDs:", productIds);
    console.log("Variant IDs:", variantIds);

    const products = await db.product.findMany({
      where: {
        id: { in: productIds },
      },
      include: {
        category: true,
        properties: {
          where: variantIds ? { id: { in: variantIds } } : undefined,
          include: {
            inventory: true,
            attributeSet: true,
          },
        },
      },
    });

    if (!products || products.length === 0) {
      console.log("No products found in DB");
      return { success: false, error: "No products found" };
    }
    // Format the products for cart display
    const cartItems = products.map((product) => ({
      id: String(product.id), // Convert to string to match the productId in cart state
      name: product.title,
      // This will already use the filtered properties if variantIds was provided
      price: product.properties.reduce((lowest, property) => {
        const propertyPrice = property.salePrice ?? property.retailPrice;
        return lowest === 0 || propertyPrice < lowest ? propertyPrice : lowest;
      }, 0),
      salePrice: product.properties.some((p) => p.salePrice !== null)
        ? product.properties.reduce((lowest, property) => {
            if (property.salePrice === null) return lowest;
            return lowest === 0 || property.salePrice < lowest ? property.salePrice : lowest;
          }, 0)
        : null,
      images: product.image ? [product.image] : ["/images/products/default.jpg"],
      isAvailable: product.properties.some((p) => p.inventory && p.inventory.quantity > 0),
      // Add variants information for cart display
      variants: product.properties.map((prop) => ({
        id: prop.id,
        retail_price: prop.retailPrice,
        sale_price: prop.salePrice,
        attributeSetHash: prop.attributeSetHash,
        inventory: prop.inventory?.quantity || 0,
        attributeName: prop.attributeSet?.name || "Default",
      })),
    }));

    return { success: true, res: cartItems };
  } catch (error) {
    console.error("Error getting cart products:", error);
    return { success: false, error: "Failed to get cart products" };
  }
};
