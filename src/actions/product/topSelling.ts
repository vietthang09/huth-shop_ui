import { db } from "@/lib/db";

export interface TopSellingProduct {
  id: number;
  title: string;
  image: string | null;
  cardColor: string | null;
  totalSold: number;
  retailPrice: any | null; // Using any to handle Prisma Decimal type
  salePrice: any | null; // Using any to handle Prisma Decimal type
  categoryName: string | null;
  categoryId: number | null;
  slug: string | null;
}

/**
 * Get top selling products based on order quantities
 * @param options Optional parameters to customize the query
 * @returns Array of top selling products with sales information
 */
export async function getTopSellingProducts({
  limit = 10,
  categoryId,
  period,
}: {
  limit?: number;
  categoryId?: number;
  period?: "day" | "week" | "month" | "year";
} = {}): Promise<TopSellingProduct[]> {
  try {
    // Calculate date range for period filtering if specified
    let dateFilterCondition = {};
    if (period) {
      const now = new Date();
      let startDate = new Date();

      switch (period) {
        case "day":
          startDate.setDate(now.getDate() - 1);
          break;
        case "week":
          startDate.setDate(now.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(now.getMonth() - 1);
          break;
        case "year":
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      dateFilterCondition = {
        createdAt: {
          gte: startDate,
        },
      };
    } // Get products with ordered quantities
    const products = await db.product.findMany({
      where: {
        ...(categoryId ? { categoryId } : {}),
        properties: {
          some: {
            orderItems: {
              some: {},
            },
          },
        },
      },
      select: {
        id: true,
        title: true,
        image: true,
        cardColor: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        properties: {
          select: {
            id: true,
            retailPrice: true,
            salePrice: true,
            orderItems: {
              select: {
                quantity: true,
                order: {
                  select: {
                    createdAt: true,
                    status: true,
                  },
                },
              },
              where: {
                order: {
                  status: {
                    not: "CANCELLED",
                  },
                  ...(period ? dateFilterCondition : {}),
                },
              },
            },
          },
        },
      },
      take: limit * 2, // Fetch extra to allow for filtering
    });

    // Process and calculate total sold for each product
    const processedProducts = products.map((product) => {
      // Calculate total quantity sold across all properties
      const totalSold = product.properties.reduce(
        (sum, prop) => sum + prop.orderItems.reduce((itemSum, orderItem) => itemSum + orderItem.quantity, 0),
        0
      );

      // Find the best-selling property for pricing info
      let bestSellingProperty = product.properties[0];
      if (product.properties.length > 1) {
        bestSellingProperty = product.properties.reduce((best, current) => {
          const bestSold = best.orderItems.reduce((sum, item) => sum + item.quantity, 0);
          const currentSold = current.orderItems.reduce((sum, item) => sum + item.quantity, 0);
          return currentSold > bestSold ? current : best;
        }, product.properties[0]);
      }
      return {
        id: product.id,
        title: product.title,
        image: product.image,
        cardColor: product.cardColor,
        totalSold,
        retailPrice: bestSellingProperty?.retailPrice || null,
        salePrice: bestSellingProperty?.salePrice || null,
        categoryName: product.category?.name || null,
        categoryId: product.category?.id || null,
        slug: product.category?.slug || null,
      };
    });

    // Filter out products with no sales and sort by total sold
    return processedProducts
      .filter((product) => product.totalSold > 0)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, limit);
  } catch (error) {
    console.error("Error fetching top selling products:", error);
    return [];
  }
}

/**
 * Get top selling products by category
 * @returns Object with category IDs as keys and arrays of top products as values
 */
export async function getTopSellingProductsByCategory({
  limit = 5,
  categoryLimit = 3,
}: {
  limit?: number;
  categoryLimit?: number;
} = {}): Promise<Record<number, TopSellingProduct[]>> {
  try {
    // Get all categories with at least one sold product
    const categories = await db.category.findMany({
      where: {
        products: {
          some: {
            properties: {
              some: {
                orderItems: {
                  some: {
                    order: {
                      status: {
                        not: "CANCELLED",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      take: categoryLimit,
    });

    const result: Record<number, TopSellingProduct[]> = {};

    // For each category, get top selling products
    for (const category of categories) {
      const topProducts = await getTopSellingProducts({
        limit,
        categoryId: category.id,
      });

      if (topProducts.length > 0) {
        result[category.id] = topProducts;
      }
    }

    return result;
  } catch (error) {
    console.error("Error fetching top selling products by category:", error);
    return {};
  }
}
