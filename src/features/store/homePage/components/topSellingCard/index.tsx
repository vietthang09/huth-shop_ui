"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getFormattedTopSellingProducts } from "@/actions/product/topSelling";
import { TTopSellingCard } from "@/features/product/types";

import ProductCard from "@/components/store/common/productCard";

export const TopSellingCards = () => {
  const [products, setProducts] = useState<TTopSellingCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopSelling = async () => {
      setIsLoading(true);
      try {
        // Get top selling products from the database
        const topSellingProducts = await getFormattedTopSellingProducts();
        if (topSellingProducts && topSellingProducts.length > 0) {
          setProducts(topSellingProducts);
        }
      } catch (error) {
        console.error("Error fetching top selling products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopSelling();
  }, []);

  // Don't render anything if loading or no products
  if (isLoading || products.length === 0) {
    return null;
  }

  return (
    <div className="w-full mt-14">
      <div className="flex w-full justify-between items-center mb-7">
        <h2 className="text-2xl font-medium text-gray-700">Sản phẩm bán chạy</h2>
        <Link
          href={"/list?topSelling=true"}
          className="font-medium bg-[position:right_center] hover:pr-5 pr-6 text-gray-700 bg-[url('/icons/arrowIcon02.svg')] bg-no-repeat bg-right-center transition-all duration-300 ease-out"
        >
          Xem tất cả
        </Link>
      </div>
      <div className="flex lg:flex-wrap justify-between lg:justify-start gap-3.5 overflow-x-scroll pb-7 2xl:pb-0 2xl:overflow-x-hidden">
        {products.map((product) => (
          <ProductCard
            id={product.id}
            key={product.url}
            name={product.name}
            price={product.price}
            dealPrice={product.dealPrice}
            imgUrl={product.imgUrl}
            specs={product.specs}
            url={product.url}
            staticWidth
            fromColor={product.fromColor}
            toColor={product.toColor}
          />
        ))}
      </div>
    </div>
  );
};
