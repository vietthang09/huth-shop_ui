// Define the product type based on the existing structure
export interface RecentlyVisitedProduct {
  id: number;
  sku: string;
  title: string;
  image: string | null;
  cardColor?: string;
  properties: Array<{
    id: number;
    retailPrice: number;
    salePrice?: number;
    attributeName: string;
  }>;
  category: {
    id: number;
    name: string;
    slug: string;
  };
}

const STORAGE_KEY = "recently-visited-products";
const MAX_RECENT_PRODUCTS = 10;

// Utility functions for localStorage operations
export const getRecentlyVisitedProducts = (): RecentlyVisitedProduct[] => {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load recently visited products:", error);
    return [];
  }
};

export const addRecentlyVisitedProduct = (product: RecentlyVisitedProduct): void => {
  if (typeof window === "undefined") return;

  try {
    const currentProducts = getRecentlyVisitedProducts();

    // Remove the product if it already exists to avoid duplicates
    const filteredProducts = currentProducts.filter((p) => p.sku !== product.sku);

    // Add the new product to the beginning and limit to MAX_RECENT_PRODUCTS
    const updatedProducts = [product, ...filteredProducts].slice(0, MAX_RECENT_PRODUCTS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProducts));
  } catch (error) {
    console.error("Failed to save recently visited product:", error);
  }
};

export const clearRecentlyVisitedProducts = (): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear recently visited products:", error);
  }
};
