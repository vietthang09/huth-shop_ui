"use client";

import ProductCard from "../../common/productCard";
import { useRecentlyVisited } from "@/hooks/useRecentlyVisited";

export default function RecentlyVisit() {
  const { getRecentProducts, clearHistory, isClient } = useRecentlyVisited();

  // Don't render anything on server-side to avoid hydration mismatch
  if (!isClient) {
    return (
      <div className="h-full space-y-2">
        <div className="w-full relative">
          <h2 className="text-center text-2xl text-gray-800 font-medium">Đã xem gần đây</h2>
        </div>
        <div className="grid grid-cols-4 gap-4">
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
    return (
      <div className="h-full space-y-2">
        <div className="w-full relative">
          <h2 className="text-center text-2xl text-gray-800 font-medium">Đã xem gần đây</h2>
        </div>
        <div className="text-center text-gray-500 py-8">Bạn chưa xem sản phẩm nào gần đây</div>
      </div>
    );
  }

  return (
    <div className="h-full space-y-2">
      <div className="w-full relative">
        <h2 className="text-center text-2xl text-gray-800 font-medium">Đã xem gần đây</h2>
        <button
          onClick={clearHistory}
          className="absolute right-0 top-0 bottom-0 text-xs text-gray-800 underline cursor-pointer hover:text-red-600 transition-colors"
        >
          Xóa lịch sử
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {recentProducts.map((product, index) => (
          <div
            key={product.id}
            className="group opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards]"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <ProductCard
              id={product.sku}
              sku={product.sku}
              name={product.title}
              price={product.properties[0]?.retailPrice || 0}
              dealPrice={product.properties[0]?.salePrice}
              imgUrl={product.image || ""}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
