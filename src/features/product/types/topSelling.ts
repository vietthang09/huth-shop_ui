import { TProductCard } from "@/types/common";

export type TTopSellingCard = TProductCard & {
  soldCount?: number;
  newPrice?: number;
  fromColor?: string;
  toColor?: string;
};
