import { Metadata } from "next";

import {
  CollectionCards,
  CompanyLogoList,
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
    <div>
      <WideCardRow cards={threeSaleCards} />
      <TodayDealCards />
      <WideCardRow cards={twoSaleCards} />
      <CollectionCards />
      <TopSellingCards />
      <CompanyLogoList />
    </div>
  );
}
