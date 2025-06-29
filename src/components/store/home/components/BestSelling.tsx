"use client";

import ProductCard from "../../common/productCard";
import { bestSellingProducts } from "../data";

export default function BestSelling() {
  return (
    <div className="h-full">
      <h2 className="text-center text-2xl text-gray-800 font-medium text-white">Bán chạy</h2>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 2xl:max-w-7xl mx-auto mt-4">
        {bestSellingProducts.map((product, index) => (
          <div
            key={product.id.toString()}
            className="group opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards]"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="transform transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-y-1">
              <ProductCard
                id={product.id.toString()}
                sku={product.sku}
                className="w-full h-full shadow-lg hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 ring-1 ring-gray-200/30 hover:ring-purple-300/50"
                name={product.title}
                price={product.lowestPrice}
                dealPrice={product.lowestSalePrice}
                imgUrl={product.image}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
