export type Product = {
  id: number;
  sku: string;
  title: string;
  description: string;
  shortDescription: string;
  categoryId: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
  category: Category;
  variants: ProductVariant[];
};

export type Category = {
  id: number;
  slug: string;
  title: string;
  description: string;
  image: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
};

export type ProductVariant = {
  id: number;
  productId: number;
  title: string;
  description: string | null;
  netPrice: number;
  retailPrice: number;
  salePrice?: number;
  createdAt: string;
  updatedAt: string;
  supplierId: number;
  supplier: Supplier;
  kind: ProductVariantKind;
  fields?: Array<{
    label: string;
    type?: string;
    required?: boolean;
  }>;
};

export type Supplier = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export enum ProductVariantKind {
  OWNERSHIP_UPGRADE = "ownership_upgrade",
  PRE_MADE_ACCOUNT = "pre_made_account",
  SHARING = "sharing",
}

export type ApiResponse<T> = {
  data: T;
  message: string;
  status: number;
};

export enum PaymentMethod {
  ADMIN = "admin",
  MOMO = "momo",
  VIETCOMBANK = "vietcombank",
  TPBANK = "tpbank",
}
