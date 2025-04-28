import { ProductSpec } from "@prisma/client";

export type TUserReview = {
  userName: string;
  userImage: string;
  isVerified: boolean;
  date: Date;
  likeNumber: number;
  dislikeNumber: number;
  text: string;
  advantages?: string[];
  disAdvantages?: string[];
};

export type TProductSpec = {
  groupName: string;
  specs: {
    label: string;
    data: string[];
  }[];
};

export type TProductOption = {
  optionName: string;
  options: { value: string; label?: string }[];
  optionSelectedId: number;
  type: "text" | "color";
};

export type TProductBoard = {
  id: string;
  name: string;
  isAvailable: boolean;
  shortDesc: string;
  price: number;
  dealDate?: Date;
  dealPrice?: number;
  specialFeatures?: string[];
  options?: TProductOption[];
  defaultQuantity: number;
};

export type TProductPath = {
  label: string;
  url: string;
};

export type TProduct = {
  path: TProductPath[];
  board: TProductBoard;
  gallery: string[];
  specification: TProductSpec[];
  reviews: TUserReview[];
};

export type TAddProductFormValues = {
  name: string;
  brandID: string;
  categoryID: string;
  specialFeatures: string[];
  isAvailable: boolean;
  desc: string;
  richDesc: string;
  price: string;
  salePrice: string;
  images: string[];
  specifications: ProductSpec[];
  fromColor?: string;
  toColor?: string;
};

export type TProductListItem = {
  id: string;
  name: string;
  isAvailable: boolean;
  price: number;
  salePrice: number | null;
  images: string[];
  category: {
    id: string;
    name: string;
  };
  fromColor?: string; // Add gradient start color
  toColor?: string; // Add gradient end color
};

export type TCartListItemDB = {
  id: string;
  name: string;
  images: string[];
  price: number;
  salePrice: number | null;
};

export type TBrand = {
  id: string;
  name: string;
};

export type TFilters = {
  stockStatus: "all" | "inStock" | "outStock";
  priceMinMax: [number, number];
  priceMinMaxLimitation: [number, number];
  brands: TFilterBrands[];
};
export type TFilterBrands = {
  id: string;
  name: string;
  isSelected: boolean;
};

export type TListItem = {
  id: string;
  name: string;
  isAvailable: boolean;
  specialFeatures: string[];
  images: string[];
  price: number;
  salePrice: number | null;
  brand: {
    id: string;
    name: string;
  };
};

export type TSpecification = {
  groupName: string;
  specs: {
    name: string;
    value: string;
  }[];
};

export type TPath = {
  id: string;
  parentID: string | null;
  name: string;
  url: string;
};

export type TProductPageInfo = {
  id: string;
  name: string;
  isAvailable: boolean;
  desc: string | null;
  richDesc: string | null; // Add the rich description field
  images: string[];
  optionSets: string[];
  price: number;
  salePrice: number | null;
  specialFeatures: string[];
  isHotDeal: boolean;
  specifications: TSpecification[];
  path: TPath[];
  fromColor?: string; // Add gradient start color
  toColor?: string; // Add gradient end color
};
