import { Metadata } from "next";

import {
  Carousel,
  CollectionCards,
  CompanyLogoList,
  TabbedProductCards,
  WideCardRow,
} from "@/features/store/homePage/components";
import { threeSaleCards, twoSaleCards } from "@/features/store/homePage/constants";

export const metadata: Metadata = {
  title: "BITEX - Trang chủ",
};

export default function Home() {
  return (
    <div className="space-y-4">
      <Carousel />
      <WideCardRow cards={threeSaleCards} />
      <TabbedProductCards />
      <WideCardRow cards={twoSaleCards} />
      <CollectionCards />
      <CompanyLogoList />
    </div>
  );
}
