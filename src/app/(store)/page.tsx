import { Metadata } from "next";

import {
  CollectionCards,
  CompanyLogoList,
  LatestBlogPosts,
  TodayDealCards,
  TopSellingCards,
  WideCardRow,
} from "@/features/store/homePage/components";
import { threeSaleCards, twoSaleCards } from "@/features/store/homePage/constants";

export const metadata: Metadata = {
  title: "BITEX - Trang chủ",
};

export default function Home() {
  return (
    <div className="w-full bg-mint-500">
      <div className="storeContainer flex-col">
        <div className="flex w-full mt-24"></div>
        <WideCardRow cards={threeSaleCards} />
        <TodayDealCards />
        <WideCardRow cards={twoSaleCards} />
        <CollectionCards />
        <TopSellingCards />
        <LatestBlogPosts />
        <CompanyLogoList />
      </div>
    </div>
  );
}
