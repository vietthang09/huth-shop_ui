"use server";

import { db } from "@/lib/db";

export async function getSaleProducts(options?: {
  limit?: number;
  page?: number;
  includeDetails?: boolean;
}) {
  try {
    const limit = options?.limit || 10;
    const page = options?.page || 1;
    const skip = (page - 1) * limit;
    const includeDetails = options?.includeDetails || false;

    // Find products that have at least one property with a sale price
    const productsWithSalePrice = await db.product.findMany({
      where: {
        properties: {
          some: {
            salePrice: {
              not: null,
            },
          },
        },
      },
      include: {
        category: true,
        properties: {
          where: {
            salePrice: {
              not: null,
            },
          },
          include: {
            attributeSet: includeDetails,
            inventory: includeDetails,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Count total products with sale prices for pagination
    const totalCount = await db.product.count({
      where: {
        properties: {
          some: {
            salePrice: {
              not: null,
            },
          },
        },
      },
    });

    // Calculate discount percentage for each property
    const productsWithDiscountInfo = productsWithSalePrice.map(product => {
      const propertiesWithDiscounts = product.properties.map(property => {
        const retailPrice = parseFloat(property.retailPrice.toString());
        const salePrice = property.salePrice ? parseFloat(property.salePrice.toString()) : retailPrice;
        
        // Calculate discount percentage
        const discountPercentage = Math.round(((retailPrice - salePrice) / retailPrice) * 100);
        
        return {
          ...property,
          discountPercentage,
        };
      });

      return {
        ...product,
        properties: propertiesWithDiscounts,
      };
    });

    return {
      products: productsWithDiscountInfo,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching sale products:", error);
    throw new Error("Failed to fetch products with sale prices");
  }
}

// Get a single product with sale price by ID
export async function getSaleProductById(id: number, includeDetails: boolean = true) {
  try {
    const product = await db.product.findFirst({
      where: {
        id,
        properties: {
          some: {
            salePrice: {
              not: null,
            },
          },
        },
      },
      include: {
        category: true,
        properties: {
          include: {
            attributeSet: includeDetails,
            inventory: includeDetails,
          },
        },
      },
    });

    if (!product) {
      return null;
    }

    // Add discount percentage to properties
    const propertiesWithDiscounts = product.properties.map(property => {
      if (property.salePrice) {
        const retailPrice = parseFloat(property.retailPrice.toString());
        const salePrice = parseFloat(property.salePrice.toString());
        const discountPercentage = Math.round(((retailPrice - salePrice) / retailPrice) * 100);
        
        return {
          ...property,
          discountPercentage,
        };
      }
      return property;
    });

    return {
      ...product,
      properties: propertiesWithDiscounts,
    };
  } catch (error) {
    console.error("Error fetching sale product by ID:", error);
    throw new Error("Failed to fetch product with sale price");
  }
}