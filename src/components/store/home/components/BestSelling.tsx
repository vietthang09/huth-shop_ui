"use client";

import ProductCard from "../../common/productCard";
import { bestSellingProducts } from "../data";

export default function BestSelling() {
  return (
    <div className="h-full">
      <h2 className="text-center text-3xl lg:text-4xl font-bold text-blue-500 mb-2 tracking-tight">Bán chạy</h2>
      <p className="text-center text-gray-600 mb-8 text-sm lg:text-base">Những sản phẩm được ưa chuộng nhất</p>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 2xl:max-w-7xl mx-auto mt-4">
        {bestSellingProducts.map((product, index) => (
          <div
            key={product.id.toString()}
            className="group opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards]"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <ProductCard
              id={product.id.toString()}
              sku={product.sku}
              name={product.title}
              price={product.lowestPrice}
              dealPrice={0}
              imgUrl={product.image}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
