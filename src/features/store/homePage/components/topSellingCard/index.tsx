"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getFormattedTopSelling } from "@/actions/product/topSelling";
import { TopSellingProducts as fallbackProducts } from "@/features/product/constants";
import { TTopSellingCard } from "@/features/product/types";

import TopSellingCard from "./TopSellingCard";

export const TopSellingCards = () => {
  const [products, setProducts] = useState<TTopSellingCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopSelling = async () => {
      setIsLoading(true);
      try {
        // Get top selling products from the database
        const topSellingProducts = await getFormattedTopSelling();
        // Use the top selling products from DB if available, otherwise fall back to mock data
        if (topSellingProducts && topSellingProducts.length > 0) {
          setProducts(topSellingProducts);
        } else {
          // Comment this line out for production like in the TodayDeals component
          // setProducts(fallbackProducts);
        }
      } catch (error) {
        console.error("Error fetching top selling products:", error);
        setProducts(fallbackProducts);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopSelling();
  }, []);

  if (isLoading || products.length === 0) {
    return null; // Or a loading skeleton
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
      <div className="flex justify-between gap-3.5 overflow-x-scroll pb-7 2xl:pb-0 2xl:overflow-x-hidden">
        {products.map((product) => (
          <TopSellingCard
            key={product.url}
            productName={product.name}
            oldPrice={product.price}
            newPrice={product.dealPrice}
            image={product.imgUrl}
            spec={product.specs}
            url={product.url}
            soldCount={product.soldCount}
          />
        ))}
      </div>
    </div>
  );
};
