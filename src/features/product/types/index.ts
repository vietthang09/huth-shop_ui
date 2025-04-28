export * from "./topSelling";

export type TDealCard = {
  id: string;
  name: string;
  imgUrl: string[];
  price: number;
  dealPrice: number;
  specs: string[];
  url: string;
  fromColor?: string;
  toColor?: string;
};
