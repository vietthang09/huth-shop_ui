"use client";

import { useRef, useState } from "react";
import ProductCard from "../../common/productCard";
import { mockProducts } from "../data";

export default function Entertainment() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -720, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 720, behavior: "smooth" });
    }
  };

  return (
    <div className="h-full">
      <h2 className="text-center text-2xl text-gray-800 font-medium mb-6">Giải trí</h2>
      <div className="relative">
        {/* Left Navigation Button */}
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Right Navigation Button */}
        {canScrollRight && (
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Products Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          onScroll={updateScrollButtons}
        >
          {mockProducts.map((product, index) => (
            <div
              key={product.id}
              className="group opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards] flex-shrink-0"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="transform transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-y-1">
                <ProductCard
                  className="w-72 h-full shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 ring-1 ring-gray-200/30 hover:ring-blue-300/50"
                  id={product.sku}
                  name={product.title}
                  price={+product.properties[0].retailPrice}
                  dealPrice={+(product.properties?.[0]?.salePrice ?? 0)}
                  imgUrl={product.image || ""}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
