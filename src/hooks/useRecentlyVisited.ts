import { useState, useEffect, useCallback } from "react";
import {
  getRecentlyVisitedProducts,
  addRecentlyVisitedProduct,
  clearRecentlyVisitedProducts,
} from "@/store/recentlyVisited";
import { TProduct } from "@/services/product";

export const useRecentlyVisited = () => {
  const [recentProducts, setRecentProducts] = useState<TProduct[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsClient(true);
    setRecentProducts(getRecentlyVisitedProducts());
  }, []);

  const addProduct = useCallback((product: TProduct) => {
    addRecentlyVisitedProduct(product);
    setRecentProducts(getRecentlyVisitedProducts());
  }, []);

  const clearHistory = useCallback(() => {
    clearRecentlyVisitedProducts();
    setRecentProducts([]);
  }, []);

  const getRecentProducts = useCallback(
    (limit = 3) => {
      return recentProducts.slice(0, limit);
    },
    [recentProducts]
  );

  return {
    recentProducts,
    addProduct,
    clearHistory,
    getRecentProducts,
    isClient,
  };
};
