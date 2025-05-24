"use server";

import { db } from "@/lib/db";

/**
 * Get products by category slug with optional pagination and sorting
 * This function retrieves products belonging to a specific category using the category slug
 * @param slug The slug of the category to fetch products for
 * @param options Optional parameters for pagination and sorting
 * @returns Object containing products and pagination information
 */
export const getProductsByCategory = async (
  slug: string,
  options?: {
    page?: number;
    limit?: number;
    sortBy?: "newest" | "priceAsc" | "priceDesc";
    includeOutOfStock?: boolean;
  }
) => {
  try {
    if (!slug) {
      return { success: false, error: "Category slug is required" };
    }

    // Set default options
    const page = options?.page || 1;
    const limit = options?.limit || 12;
    const skip = (page - 1) * limit;
    const includeOutOfStock = options?.includeOutOfStock ?? false;

    // Find the category by slug
    const category = await db.category.findUnique({
      where: { slug },
    });

    if (!category) {
      return { success: false, error: "Category not found" };
    }

    // Define base query params
    const queryParams: any = {
      where: {
        categoryId: category.id,
      },
      skip,
      take: limit,
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
    };

    // Add sorting based on options
    if (options?.sortBy) {
      switch (options.sortBy) {
        case "newest":
          queryParams.orderBy = { createdAt: "desc" };
          break;
        case "priceAsc":
          // For price sorting, we need to sort in the application layer
          // as we're finding min/max prices from properties
          break;
        case "priceDesc":
          // For price sorting, we need to sort in the application layer
          // as we're finding min/max prices from properties
          break;
        default:
          queryParams.orderBy = { createdAt: "desc" };
      }
    } else {
      // Default sorting by newest
      queryParams.orderBy = { createdAt: "desc" };
    }

    // Get products and count matching the category
    const [products, totalCount] = await Promise.all([
      db.product.findMany(queryParams),
      db.product.count({
        where: {
          categoryId: category.id,
        },
      }),
    ]);

    if (!products || products.length === 0) {
      return {
        success: true,
        data: {
          products: [],
          pagination: {
            total: 0,
            page,
            limit,
            totalPages: 0,
          },
          category: {
            id: category.id,
            name: category.name,
            slug: category.slug,
          },
        },
      };
    }

    // Format and potentially filter products
    let formattedProducts = products.map((product) => {
      // Calculate lowest price across properties
      const lowestPrice = product.properties.reduce((lowest, property) => {
        const propertyPrice = property.retailPrice;
        return lowest === 0 || Number(propertyPrice) < lowest ? Number(propertyPrice) : lowest;
      }, 0);

      // Calculate lowest sale price if available
      const lowestSalePrice = product.properties.some((p) => p.salePrice !== null)
        ? product.properties.reduce((lowest, property) => {
            if (property.salePrice === null) return lowest;
            return lowest === 0 || Number(property.salePrice) < lowest ? Number(property.salePrice) : lowest;
          }, 0)
        : null;

      // Check if product has stock
      const isAvailable = product.properties.some((p) => p.inventory && p.inventory.quantity > 0);

      // Return formatted product
      return {
        id: product.id,
        title: product.title,
        description: product.description,
        image: product.image,
        sku: product.sku,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        supplier: product.supplier,
        category: product.category,
        properties: product.properties,
        lowestPrice,
        lowestSalePrice,
        isAvailable,
      };
    });

    // Filter out of stock if requested
    if (!includeOutOfStock) {
      formattedProducts = formattedProducts.filter((product) => product.isAvailable);
    }

    // Manual sorting for price-based sorting
    if (options?.sortBy) {
      switch (options.sortBy) {
        case "priceAsc":
          formattedProducts.sort((a, b) => a.lowestPrice - b.lowestPrice);
          break;
        case "priceDesc":
          formattedProducts.sort((a, b) => b.lowestPrice - a.lowestPrice);
          break;
      }
    }

    return {
      success: true,
      data: {
        products: formattedProducts,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
        category: {
          id: category.id,
          name: category.name,
          slug: category.slug,
        },
      },
    };
  } catch (error) {
    console.error("Error getting products by category:", error);
    return { success: false, error: "Failed to get products by category" };
  }
};

/**
 * Get products from multiple categories
 * @param slugs Array of category slugs
 * @param options Optional parameters for pagination and filtering
 */
export const getProductsFromCategories = async (
  slugs: string[],
  options?: {
    limit?: number;
    includeOutOfStock?: boolean;
  }
) => {
  try {
    if (!slugs || slugs.length === 0) {
      return { success: false, error: "Category slugs are required" };
    }

    // Set default options
    const limit = options?.limit || 4; // Limit per category
    const includeOutOfStock = options?.includeOutOfStock ?? false;

    // Find the categories by slug
    const categories = await db.category.findMany({
      where: {
        slug: {
          in: slugs,
        },
      },
    });

    if (!categories || categories.length === 0) {
      return { success: false, error: "No categories found" };
    }

    const categoryIds = categories.map((category) => category.id);

    // Define base query params
    const queryParams = {
      where: {
        categoryId: { in: categoryIds },
      },
      take: limit * categoryIds.length, // Get enough products for all categories
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
      orderBy: {
        createdAt: "desc" as const,
      },
    };

    const products = await db.product.findMany(queryParams);

    if (!products || products.length === 0) {
      return {
        success: true,
        data: {
          productsByCategory: Object.fromEntries(categories.map((category) => [category.slug, []])),
        },
      };
    }

    // Group and format products by category
    const productsByCategory: Record<string, any[]> = {};

    // Initialize empty arrays for each category
    categories.forEach((category) => {
      productsByCategory[category.slug] = [];
    });

    // Process products and group them by category
    products.forEach((product) => {
      if (product.category) {
        const categorySlug = product.category.slug;

        // Calculate product data
        const lowestPrice = product.properties.reduce((lowest, property) => {
          const propertyPrice = property.retailPrice;
          return lowest === 0 || Number(propertyPrice) < lowest ? Number(propertyPrice) : lowest;
        }, 0);

        const lowestSalePrice = product.properties.some((p) => p.salePrice !== null)
          ? product.properties.reduce((lowest, property) => {
              if (property.salePrice === null) return lowest;
              return lowest === 0 || Number(property.salePrice) < lowest ? Number(property.salePrice) : lowest;
            }, 0)
          : null;

        const isAvailable = product.properties.some((p) => p.inventory && p.inventory.quantity > 0);

        // Skip if out of stock and we're not including those
        if (!includeOutOfStock && !isAvailable) {
          return;
        }

        // Add to appropriate category array, limited to the option limit
        if (productsByCategory[categorySlug] && productsByCategory[categorySlug].length < limit) {
          productsByCategory[categorySlug].push({
            id: product.id,
            title: product.title,
            description: product.description,
            image: product.image,
            sku: product.sku,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            supplier: product.supplier,
            category: product.category,
            properties: product.properties,
            lowestPrice,
            lowestSalePrice,
            isAvailable,
          });
        }
      }
    });

    return {
      success: true,
      data: {
        productsByCategory,
        categories: categories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          image: cat.image,
        })),
      },
    };
  } catch (error) {
    console.error("Error getting products from categories:", error);
    return { success: false, error: "Failed to get products from categories" };
  }
};
