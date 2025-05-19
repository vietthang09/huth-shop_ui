"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { Product, Property, Attribute } from "@prisma/client";
import { z } from "zod";

type ProductWithRelations = Product & {
  properties: Property[];
  supplier?: { name: string } | null;
  category?: { name: string } | null;
  productAttributes?: Array<{ attribute: Attribute }>;
};

interface CreateProductInput {
  sku: string;
  title: string;
  description?: string;
  image?: string;
  supplierId?: number;
  categoryId?: number;
  attributes?: number[];
}

interface UpdateProductInput extends Partial<CreateProductInput> {
  id: number;
  properties?: Array<{
    id: number;
    net_price: number;
    retail_price: number;
    sale_price?: number;
    inventory: number;
  }>;
  attributes?: Array<{
    attributeId: number;
    attributeSetHash: string;
    netPrice: number;
    retailPrice: number;
    discount?: number;
  }>;
}

// Update the product schema to include attributeIds and prices
const productSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  supplierId: z.number().optional(),
  categoryId: z.number().optional(),
  attributeIds: z.array(z.number()).optional(),
  attributePrices: z
    .array(
      z.object({
        attributeId: z.number(),
        netPrice: z.number().default(0),
        retailPrice: z.number().default(0),
        discount: z.number().optional(),
      })
    )
    .optional(),
});

export async function addProduct(data: z.infer<typeof productSchema>) {
  try {
    console.log("Adding product with data:", JSON.stringify(data));
    console.log("Attribute prices data:", data.attributePrices);
    const validatedData = productSchema.parse(data);

    // Create the product
    const product = await db.product.create({
      data: {
        sku: validatedData.sku,
        title: validatedData.title,
        description: validatedData.description,
        supplierId: validatedData.supplierId,
        categoryId: validatedData.categoryId,
      },
    }); // If there are selected attributes, create properties for them
    if (validatedData.attributeIds && validatedData.attributeIds.length > 0) {
      // Get the attribute details from the database
      const attributes = await db.attribute.findMany({
        where: {
          id: {
            in: validatedData.attributeIds,
          },
        },
      });

      // Create property entries for each attribute with the provided prices
      for (const attribute of attributes) {
        // Find the price data for this attribute if it exists
        const priceData = validatedData.attributePrices?.find((price) => price.attributeId === attribute.id);
        // Calculate sale price if discount is provided
        const retailPrice = priceData?.retailPrice || 0;
        const discount = priceData?.discount || 0;
        // Calculate the sale price if discount is provided and greater than 0
        let salePrice = null;
        if (discount > 0 && retailPrice > 0) {
          const discountAmount = retailPrice * (discount / 100);
          salePrice = retailPrice - discountAmount;
        }

        await db.property.create({
          data: {
            productId: product.id,
            attributeSetHash: attribute.propertiesHash,
            netPrice: priceData?.netPrice || 0,
            retailPrice: retailPrice,
            salePrice: salePrice,
          },
        });
      }
    }

    revalidatePath("/admin/products");
    return { success: true, product };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors };
    }

    console.error("Error creating product:", error);
    return { success: false, error: "Failed to create product." };
  }
}

export const getAllProducts = async () => {
  try {
    const products = await db.product.findMany({
      include: {
        supplier: { select: { name: true } },
        category: { select: { name: true } },
        properties: true,
      },
    });

    return { success: true, data: products };
  } catch (error) {
    console.error("Error getting products:", error);
    return { success: false, error: "Failed to get products" };
  }
};

export const getOneProduct = async (id: number) => {
  try {
    if (!id) {
      return { success: false, error: "Invalid product ID" };
    }

    const product = await db.product.findUnique({
      where: { id },
      include: {
        supplier: true,
        category: true,
        properties: {
          include: {
            inventory: true,
            attributeSet: true,
          },
        },
      },
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    // Make sure prices are accessible in the response
    const productWithPrices = {
      ...product,
      prices: product.properties.map((prop) => ({
        id: prop.id,
        net_price: prop.netPrice,
        retail_price: prop.retailPrice,
        sale_price: prop.salePrice,
        attributeSetHash: prop.attributeSetHash,
        inventory: prop.inventory?.quantity || 0,
      })),
    };

    return { success: true, data: productWithPrices };
  } catch (error) {
    console.error("Error getting product:", error);
    return { success: false, error: "Failed to get product" };
  }
};

export const getOneProductBySku = async (sku: string) => {
  try {
    if (!sku) {
      return { success: false, error: "Invalid product SKU" };
    }

    const product = await db.product.findUnique({
      where: { sku },
      include: {
        supplier: true,
        category: true,
        properties: {
          include: {
            inventory: true,
            attributeSet: true,
          },
        },
      },
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    // Make sure prices are accessible in the response
    const productWithPrices = {
      ...product,
      prices: product.properties.map((prop) => ({
        id: prop.id,
        net_price: prop.netPrice,
        retail_price: prop.retailPrice,
        sale_price: prop.salePrice,
        attributeSetHash: prop.attributeSetHash,
        inventory: prop.inventory?.quantity || 0,
      })),
    };

    return { success: true, data: productWithPrices };
  } catch (error) {
    console.error("Error getting product:", error);
    return { success: false, error: "Failed to get product" };
  }
};

export const deleteProduct = async (productId: number) => {
  try {
    await db.product.delete({
      where: { id: productId },
    });

    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, error: "Failed to delete product" };
  }
};

export const updateProduct = async (data: UpdateProductInput) => {
  try {
    console.log("Updating product with data:", JSON.stringify(data));
    const { id, attributes: attributesWithPrices, ...updateData } = data;

    // Update basic product information
    const product = await db.product.update({
      where: { id },
      data: {
        sku: updateData.sku,
        title: updateData.title,
        description: updateData.description,
        supplierId: updateData.supplierId,
        categoryId: updateData.categoryId,
      },
    }); // Get all existing properties for this product
    const existingProperties = await db.property.findMany({
      where: { productId: id },
      include: { attributeSet: true },
    });

    // Update properties if provided
    if (attributesWithPrices && attributesWithPrices.length > 0) {
      // Create a set of attribute hashes that are being sent in the update
      const updatedAttributeHashes = new Set(attributesWithPrices.map((attr) => attr.attributeSetHash));

      // Delete properties that are no longer selected (not in the update list)
      for (const property of existingProperties) {
        if (!updatedAttributeHashes.has(property.attributeSetHash)) {
          await db.property.delete({
            where: { id: property.id },
          });
        }
      }

      // Process each attribute with its price data
      for (const attr of attributesWithPrices) {
        const { attributeId, attributeSetHash, netPrice, retailPrice, discount } = attr;

        // Calculate sale price if discount is provided
        let salePrice = null;
        if (discount && discount > 0 && retailPrice > 0) {
          const discountAmount = retailPrice * (discount / 100);
          salePrice = retailPrice - discountAmount;
        }

        // Check if property already exists for this product and attribute set
        const existingProperty = await db.property.findFirst({
          where: {
            productId: id,
            attributeSetHash: attributeSetHash,
          },
        });

        if (existingProperty) {
          // Update existing property
          await db.property.update({
            where: { id: existingProperty.id },
            data: {
              netPrice,
              retailPrice,
              salePrice,
            },
          });
        } else {
          // Create new property
          await db.property.create({
            data: {
              productId: id,
              attributeSetHash,
              netPrice,
              retailPrice,
              salePrice,
            },
          });
        }
      }
    } // Make sure to revalidate all paths showing product data
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath(`/product/${id}`);

    return { success: true, product };
  } catch (error) {
    console.error("Error updating product:", error);
    return { success: false, error: "Failed to update product." };
  }
};

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

    const products = await db.product.findMany({
      where: {
        id: { in: productIds },
      },
      include: {
        supplier: true,
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
      return { success: false, error: "No products found" };
    } // Format the products for cart display
    const cartItems = products.map((product) => ({
      id: String(product.id), // Convert to string to match the productId in cart state
      name: product.title,
      // This will already use the filtered properties if variantIds was provided
      // thanks to the where clause in the database query
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
