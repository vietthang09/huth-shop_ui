import { TProductCard } from "@/types/common";

export type TTopSellingCard = TProductCard & {
  soldCount: number;
};
