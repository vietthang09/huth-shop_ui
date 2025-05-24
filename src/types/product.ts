import { Category } from "./category";
import { Log } from "./log";
import { Property } from "./property";
import { Supplier } from "./supplier";

export type Product = {
  id: number;
  sku: string;
  title: string;
  description: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  supplierId: number | null;
  supplier: Supplier | null;
  categoryId: number | null;
  category: Category | null;
  properties: Property[];
  logs: Log[];
};

// Product variant/property type
export interface ProductVariant {
  id: number;
  retail_price: number;
  sale_price: number | null;
  attributeSetHash: string;
  inventory: number;
}

// Type for the ProductBoard component
export type TProductBoard = {
  id: number;
  name: string;
  price: number;
  dealPrice?: number | null;
  shortDesc: string;
  isAvailable: boolean;
  defaultQuantity: number;
  specialFeatures?: string[];
  variants?: ProductVariant[];
};

// Variant type for cart items
export interface CartItemVariant {
  id: number;
  retail_price: number;
  sale_price: number | null;
  attributeSetHash: string;
  inventory: number;
  attributeName: string;
}

// Type for cart products returned from database
export type TCartListItemDB = {
  id: string;
  name: string;
  price: number;
  salePrice: number | null;
  images: string[];
  isAvailable: boolean;
  variants?: CartItemVariant[];
};

// Type for product filters
export type TFilters = {
  stockStatus: "all" | "inStock" | "outStock";
  priceMinMax: [number, number];
  priceMinMaxLimitation: [number, number];
  brands: Array<{
    id: number;
    name: string;
    isSelected: boolean;
  }>;
  category?: string;
  search?: string;
};
