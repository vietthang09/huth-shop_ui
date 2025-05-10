"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getFormattedHotDeals } from "@/actions/product/hotdeals";
import { TDealCard } from "@/features/product/types";

import ProductCard from "@/components/store/common/productCard";
import { getAllProducts } from "@/actions/product/product";

export const TodayDealCards = () => {
  const [deals, setDeals] = useState<TDealCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHotDeals = async () => {
      setIsLoading(true);
      try {
        const hotDeals = await getAllProducts();
        console.log("Hot Deals:", hotDeals);
        if (hotDeals && hotDeals.length > 0) {
          setDeals(hotDeals);
        }
      } catch (error) {
        console.error("Error fetching hot deals:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHotDeals();
  }, []);

  if (isLoading || deals.length === 0) {
    return null; // Or a loading skeleton
  }

  return (
    <div className="w-full mt-14">
      <div className="flex w-full justify-between items-center mb-7">
        <h2 className="text-2xl font-medium text-gray-700">Ưu đãi hôm nay</h2>
        <Link
          href={"/list?hotDeals=true"}
          className="font-medium bg-[position:right_center] hover:pr-5 pr-6 text-gray-700 bg-[url('/icons/arrowIcon02.svg')] bg-no-repeat bg-right-center transition-all duration-300 ease-out"
        >
          Xem tất cả
        </Link>
      </div>
      <div className="flex lg:flex-wrap justify-between lg:justify-start gap-3.5 overflow-x-scroll pb-7 2xl:pb-0 2xl:overflow-x-hidden">
        {deals.map((deal, index) => (
          <ProductCard
            id={deal.id}
            key={deal.url}
            name={deal.name}
            price={deal.price}
            dealPrice={deal.dealPrice}
            imgUrl={deal.imgUrl}
            specs={deal.specs}
            url={deal.url}
            staticWidth
            fromColor={deal.fromColor}
            toColor={deal.toColor}
          />
        ))}
      </div>
    </div>
  );
};
