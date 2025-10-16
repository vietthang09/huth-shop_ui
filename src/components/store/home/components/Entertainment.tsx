"use client";

import { useEffect, useRef, useState } from "react";
import ProductCard from "../../common/productCard";
import { findAllByCategory, TProduct } from "@/services/product";

export default function Entertainment() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [products, setProducts] = useState<TProduct[]>([]);

  // Calculate how many items are visible and total pages
  const itemsPerPage = 4; // Assuming 4 items visible at once
  const totalPages = 1;

  const fetchEntertainmentProducts = async () => {
    const res = await findAllByCategory("giai-tri");
    if (res.status === 200) {
      setProducts(res.data.data);
    }
  };

  useEffect(() => {
    fetchEntertainmentProducts();
  }, []);

  const updateScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);

      // Calculate current page based on scroll position
      const itemWidth = 288; // 72 * 4 (w-72 = 18rem = 288px)
      const gap = 16; // gap-4 = 1rem = 16px
      const totalItemWidth = itemWidth + gap;
      const page = Math.round(scrollLeft / (totalItemWidth * itemsPerPage));
      setCurrentPage(Math.min(page, totalPages - 1));
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

  const goToPage = (pageIndex: number) => {
    if (scrollContainerRef.current) {
      const itemWidth = 288; // w-72 = 18rem = 288px
      const gap = 16; // gap-4 = 1rem = 16px
      const totalItemWidth = itemWidth + gap;
      const scrollPosition = pageIndex * totalItemWidth * itemsPerPage;
      scrollContainerRef.current.scrollTo({ left: scrollPosition, behavior: "smooth" });
    }
  };

  return (
    <div className="h-full">
      <h2 className="text-center text-3xl lg:text-4xl font-bold text-blue-500 mb-2 tracking-tight">Giải trí</h2>
      <p className="text-center text-gray-600 mb-8 text-sm lg:text-base">
        Khám phá các sản phẩm giải trí hàng đầu, từ phim ảnh đến trò chơi điện tử, mang đến trải nghiệm giải trí tuyệt
        vời nhất.
      </p>
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
          {products?.map((product, index) => (
            <div
              key={product.id}
              className="group opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards] flex-shrink-0"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ProductCard className="w-72" product={product} />
            </div>
          ))}
        </div>

        {/* Dot Indicators */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center space-x-2">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToPage(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentPage ? "bg-blue-500 w-6" : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
