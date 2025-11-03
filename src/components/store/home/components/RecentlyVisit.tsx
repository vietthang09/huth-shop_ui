"use client";

import { useRecentlyVisited } from "@/hooks/useRecentlyVisited";
import ProductCard from "../../common/ProductCard";

export default function RecentlyVisit() {
  const { getRecentProducts, clearHistory, isClient } = useRecentlyVisited();

  // Don't render anything on server-side to avoid hydration mismatch
  if (!isClient) {
    return (
      <div className="h-full space-y-2">
        <div className="w-full relative">
          <h2 className="text-center text-3xl lg:text-4xl font-bold mb-2 tracking-tight">Đã xem gần đây.</h2>
        </div>
        <div className="grid grid-cols-5 gap-4">
          {/* Loading skeleton */}
          {[1, 2, 3].map((index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const recentProducts = getRecentProducts(4);

  if (recentProducts.length === 0) {
    return null;
  }

  return (
    <div className="h-full space-y-2">
      <div className="w-full relative">
        <h2 className="text-center text-3xl lg:text-4xl font-bold mb-2 tracking-tight">Đã xem gần đây.</h2>
        <button
          onClick={clearHistory}
          className="absolute right-0 top-0 bottom-0 text-xs text-gray-800 underline cursor-pointer hover:text-red-600 transition-colors"
        >
          Xóa lịch sử
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {recentProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
