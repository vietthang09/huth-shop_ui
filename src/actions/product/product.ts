"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { z } from "zod";

interface CreateProductInput {
  sku: string;
  title: string;
  description?: string;
  image: string;
  cardColor?: string;
  keywords?: string;
  categoryId?: number;
  attributes?: number[];
}

interface UpdateProductInput extends Partial<Omit<CreateProductInput, "attributes">> {
  id: number;
  image?: string;
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
  image: z.string().min(1, "Ảnh sản phẩm là bắt buộc"),
  description: z.string().optional(),
  cardColor: z.string().optional(),
  keywords: z.string().optional(),
  categoryId: z.number().optional(),
  attributeIds: z.array(z.number()).optional(),
  attributePrices: z
    .array(
      z.object({
        attributeId: z.number(),
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
    const validatedData = productSchema.parse(data); // Create the product
    const product = await db.product.create({
      data: {
        sku: validatedData.sku,
        title: validatedData.title,
        description: validatedData.description,
        image: validatedData.image,
        cardColor: validatedData.cardColor,
        keywords: validatedData.keywords,
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
        const property = await db.property.create({
          data: {
            productId: product.id,
            attributeSetHash: attribute.propertiesHash,
            retailPrice: retailPrice,
            salePrice: salePrice,
          },
        });

        // Create inventory record for this property with quantity 0
        await db.inventory.create({
          data: {
            propertiesId: property.id,
            quantity: 0,
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
        retail_price: prop.retailPrice,
        sale_price: prop.salePrice,
        attributeSetHash: prop.attributeSetHash,
        inventory: prop.inventory?.quantity || 0,
        attributeName: `${prop.attributeSet?.value} ${prop.attributeSet?.unit}` || "Default",
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
    const { id, attributes: attributesWithPrices, ...updateData } = data; // Update basic product information
    const product = await db.product.update({
      where: { id },
      data: {
        sku: updateData.sku,
        title: updateData.title,
        description: updateData.description,
        image: updateData.image,
        keywords: updateData.keywords,
        cardColor: updateData.cardColor,
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
    }

    // Format the products for cart display
    const cartItems = products.map((product) => ({
      id: String(product.id), // Convert to string to match the productId in cart state
      name: product.title,
      // This will already use the filtered properties if variantIds was provided
      // thanks to the where clause in the database query
      price: product.properties.reduce((lowest, property) => {
        const propertyPrice = Number(property.salePrice ?? property.retailPrice);
        return lowest === 0 || propertyPrice < lowest ? propertyPrice : lowest;
      }, 0),
      salePrice: product.properties.some((p) => p.salePrice !== null)
        ? product.properties.reduce((lowest, property) => {
            if (property.salePrice === null) return lowest;
            const salePrice = Number(property.salePrice);
            return lowest === 0 || salePrice < lowest ? salePrice : lowest;
          }, 0)
        : null,
      images: product.image ? [product.image] : ["/images/products/default.jpg"],
      isAvailable: product.properties.some((p) => p.inventory && p.inventory.quantity > 0),
      // Add variants information for cart display
      variants: product.properties.map((prop) => ({
        id: prop.id,
        retail_price: Number(prop.retailPrice),
        sale_price: prop.salePrice ? Number(prop.salePrice) : null,
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

export const searchProducts = async (
  query: string,
  options?: {
    includeCategory?: boolean;
    includeProperties?: boolean;
    limit?: number;
  }
) => {
  try {
    console.log("hello");
    if (!query || query.trim().length === 0) {
      return { success: false, error: "Search query is required" };
    }
    const searchTerm = query.trim();
    const limit = options?.limit || 50;
    const products = await db.product.findMany({
      where: {
        OR: [
          {
            title: {
              contains: searchTerm,
            },
          },
          {
            sku: {
              contains: searchTerm,
            },
          },
          {
            description: {
              contains: searchTerm,
            },
          },
          {
            category: {
              name: {
                contains: searchTerm,
              },
            },
          },
        ],
      },
      include: {
        category: options?.includeCategory ? { select: { name: true, id: true } } : false,
        properties: options?.includeProperties
          ? {
              include: {
                inventory: true,
                attributeSet: true,
              },
            }
          : false,
      },
      take: limit,
      orderBy: [
        {
          title: "asc",
        },
      ],
    });

    if (!products || products.length === 0) {
      return { success: true, data: [], message: "No products found matching your search" };
    }

    // Format the response with additional search-relevant information
    const formattedProducts = products.map((product: any) => ({
      ...product,
      // Add a relevance score based on where the match was found
      relevanceScore: calculateRelevanceScore(product, searchTerm.toLowerCase()),
      ...(options?.includeProperties &&
        product.properties && {
          prices: product.properties.map((prop: any) => ({
            id: prop.id,
            retail_price: Number(prop.retailPrice),
            sale_price: prop.salePrice ? Number(prop.salePrice) : null,
            attributeSetHash: prop.attributeSetHash,
            inventory: prop.inventory?.quantity || 0,
            attributeName: prop.attributeSet?.value
              ? `${prop.attributeSet.value} ${prop.attributeSet.unit || ""}`.trim()
              : "Default",
          })),
        }),
    }));

    // Sort by relevance score (higher is better)
    formattedProducts.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return {
      success: true,
      data: formattedProducts,
      total: formattedProducts.length,
      query: searchTerm,
    };
  } catch (error) {
    console.error("Error searching products:", error);
    return { success: false, error: "Failed to search products" };
  }
};

// Helper function to calculate relevance score for search results
const calculateRelevanceScore = (product: any, searchTerm: string): number => {
  let score = 0;
  const term = searchTerm.toLowerCase();

  // Exact match in title gets highest score
  if (product.title.toLowerCase() === term) {
    score += 100;
  } else if (product.title.toLowerCase().includes(term)) {
    score += 50;
  }

  // SKU match gets high score
  if (product.sku.toLowerCase() === term) {
    score += 80;
  } else if (product.sku.toLowerCase().includes(term)) {
    score += 40;
  }

  // Description match gets medium score
  if (product.description && product.description.toLowerCase().includes(term)) {
    score += 20;
  }

  // Category match gets lower score
  if (product.category && product.category.name.toLowerCase().includes(term)) {
    score += 10;
  }

  return score;
};

export const getProductsByCategory = async (
  categoryId: number,
  options?: {
    includeProperties?: boolean;
    limit?: number;
    offset?: number;
  }
) => {
  try {
    if (!categoryId) {
      return { success: false, error: "Category ID is required" };
    }

    const limit = options?.limit || 20;
    const offset = options?.offset || 0;

    const products = await db.product.findMany({
      where: {
        categoryId: categoryId,
      },
      include: {
        category: { select: { name: true, id: true } },
        properties: options?.includeProperties
          ? {
              include: {
                inventory: true,
                attributeSet: true,
              },
            }
          : false,
      },
      take: limit,
      skip: offset,
      orderBy: [
        {
          title: "asc",
        },
      ],
    });

    // Get total count for pagination
    const totalCount = await db.product.count({
      where: {
        categoryId: categoryId,
      },
    });

    if (!products || products.length === 0) {
      return {
        success: true,
        data: [],
        total: 0,
        message: "No products found in this category",
      };
    }

    // Format the response
    const formattedProducts = products.map((product: any) => ({
      ...product,
      ...(options?.includeProperties &&
        product.properties && {
          prices: product.properties.map((prop: any) => ({
            id: prop.id,
            retail_price: Number(prop.retailPrice),
            sale_price: prop.salePrice ? Number(prop.salePrice) : null,
            attributeSetHash: prop.attributeSetHash,
            inventory: prop.inventory?.quantity || 0,
            attributeName: prop.attributeSet?.value
              ? `${prop.attributeSet.value} ${prop.attributeSet.unit || ""}`.trim()
              : "Default",
          })),
        }),
    }));

    return {
      success: true,
      data: formattedProducts,
      total: totalCount,
      currentPage: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(totalCount / limit),
    };
  } catch (error) {
    console.error("Error getting products by category:", error);
    return { success: false, error: "Failed to get products by category" };
  }
};

/**
 * Get featured or recommended products
 * This function can be used to get products based on certain criteria like availability, pricing, etc.
 */
export const getFeaturedProducts = async (options?: { limit?: number; onlyInStock?: boolean; onSale?: boolean }) => {
  try {
    const limit = options?.limit || 10;

    const whereClause: any = {};

    // If we want only products in stock
    if (options?.onlyInStock) {
      whereClause.properties = {
        some: {
          inventory: {
            quantity: {
              gt: 0,
            },
          },
        },
      };
    }

    // If we want only products on sale
    if (options?.onSale) {
      whereClause.properties = {
        ...whereClause.properties,
        some: {
          ...whereClause.properties?.some,
          salePrice: {
            not: null,
          },
        },
      };
    }

    const products = await db.product.findMany({
      where: whereClause,
      include: {
        category: { select: { name: true, id: true } },
        properties: {
          include: {
            inventory: true,
            attributeSet: true,
          },
        },
      },
      take: limit,
      orderBy: [
        {
          createdAt: "desc", // Get newest products first
        },
      ],
    });

    if (!products || products.length === 0) {
      return {
        success: true,
        data: [],
        message: "No featured products found",
      };
    }

    // Format the response
    const formattedProducts = products.map((product: any) => ({
      ...product,
      prices: product.properties.map((prop: any) => ({
        id: prop.id,
        retail_price: Number(prop.retailPrice),
        sale_price: prop.salePrice ? Number(prop.salePrice) : null,
        attributeSetHash: prop.attributeSetHash,
        inventory: prop.inventory?.quantity || 0,
        attributeName: prop.attributeSet?.value
          ? `${prop.attributeSet.value} ${prop.attributeSet.unit || ""}`.trim()
          : "Default",
      })),
      isOnSale: product.properties.some((prop: any) => prop.salePrice !== null),
      isInStock: product.properties.some((prop: any) => prop.inventory && prop.inventory.quantity > 0),
      lowestPrice: product.properties.reduce((lowest: number, prop: any) => {
        const price = Number(prop.salePrice ?? prop.retailPrice);
        return lowest === 0 || price < lowest ? price : lowest;
      }, 0),
    }));

    return {
      success: true,
      data: formattedProducts,
      total: formattedProducts.length,
    };
  } catch (error) {
    console.error("Error getting featured products:", error);
    return { success: false, error: "Failed to get featured products" };
  }
};

/**
 * Search products with advanced filters
 * This function provides more detailed filtering options
 */
export const searchProductsAdvanced = async (filters: {
  query?: string;
  categoryId?: number;
  priceRange?: { min?: number; max?: number };
  inStock?: boolean;
  onSale?: boolean;
  limit?: number;
  offset?: number;
}) => {
  try {
    const { query, categoryId, priceRange, inStock, onSale, limit = 20, offset = 0 } = filters;

    const whereClause: any = {};

    // Text search
    if (query && query.trim().length > 0) {
      const searchTerm = query.trim();
      whereClause.OR = [
        { title: { contains: searchTerm } },
        { sku: { contains: searchTerm } },
        { description: { contains: searchTerm } },
        {
          category: {
            name: { contains: searchTerm },
          },
        },
      ];
    }

    // Category filter
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    // Stock filter
    if (inStock) {
      whereClause.properties = {
        some: {
          inventory: {
            quantity: { gt: 0 },
          },
        },
      };
    }

    // Sale filter
    if (onSale) {
      whereClause.properties = {
        ...whereClause.properties,
        some: {
          ...whereClause.properties?.some,
          salePrice: { not: null },
        },
      };
    }

    const products = await db.product.findMany({
      where: whereClause,
      include: {
        category: { select: { name: true, id: true } },
        properties: {
          include: {
            inventory: true,
            attributeSet: true,
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy: [{ title: "asc" }],
    });

    // Get total count for pagination
    const totalCount = await db.product.count({ where: whereClause });

    let formattedProducts = products.map((product: any) => ({
      ...product,
      prices: product.properties.map((prop: any) => ({
        id: prop.id,
        retail_price: Number(prop.retailPrice),
        sale_price: prop.salePrice ? Number(prop.salePrice) : null,
        attributeSetHash: prop.attributeSetHash,
        inventory: prop.inventory?.quantity || 0,
        attributeName: prop.attributeSet?.value
          ? `${prop.attributeSet.value} ${prop.attributeSet.unit || ""}`.trim()
          : "Default",
      })),
      lowestPrice: product.properties.reduce((lowest: number, prop: any) => {
        const price = Number(prop.salePrice ?? prop.retailPrice);
        return lowest === 0 || price < lowest ? price : lowest;
      }, 0),
    }));

    // Apply price range filter (done in JavaScript since Prisma can't easily filter on computed fields)
    if (priceRange && (priceRange.min !== undefined || priceRange.max !== undefined)) {
      formattedProducts = formattedProducts.filter((product) => {
        const price = product.lowestPrice;
        if (priceRange.min !== undefined && price < priceRange.min) return false;
        if (priceRange.max !== undefined && price > priceRange.max) return false;
        return true;
      });
    }

    return {
      success: true,
      data: formattedProducts,
      total: totalCount,
      currentPage: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(totalCount / limit),
      filters: filters,
    };
  } catch (error) {
    console.error("Error in advanced product search:", error);
    return { success: false, error: "Failed to search products" };
  }
};
