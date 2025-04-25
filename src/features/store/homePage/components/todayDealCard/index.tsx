"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getFormattedHotDeals } from "@/actions/product/hotdeals";
import { TodayDeals as fallbackDeals } from "@/features/product/constants";
import { TDealCard } from "@/features/product/types";

import TodayDealCard from "./TodayDealCard";

export const TodayDealCards = () => {
  const [deals, setDeals] = useState<TDealCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHotDeals = async () => {
      setIsLoading(true);
      try {
        // Get hot deals from the database
        const hotDeals = await getFormattedHotDeals();
        // Use the hot deals from DB if available, otherwise fall back to mock data
        if (hotDeals && hotDeals.length > 0) {
          setDeals(hotDeals);
        } else {
          // setDeals(fallbackDeals);
        }
      } catch (error) {
        console.error("Error fetching hot deals:", error);
        setDeals(fallbackDeals);
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
      <div className="flex justify-between gap-3.5 overflow-x-scroll pb-7 2xl:pb-0 2xl:overflow-x-hidden">
        {deals.map((deal, index) => (
          <TodayDealCard
            key={deal.url}
            productName={deal.name}
            oldPrice={deal.price}
            newPrice={deal.dealPrice}
            image={deal.imgUrl}
            spec={deal.specs}
            dealEndTime={deal.dealDate}
            url={deal.url}
          />
        ))}
      </div>
    </div>
  );
};
