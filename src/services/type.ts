export type User = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

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

export type Order = {
  id: number;
  userId: number | null;
  user: User | null;
  total: number | string; // Decimal can be represented as string or number
  status: OrderStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  orderItems: OrderItem[];
};

export type OrderItem = {
  id: number;
  orderId: number;
  productId: number;
  variantId: number;
  quantity: number;
  total: number;
  supplierId: number;
  fields: Record<string, any>;
  expireAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  product: Product;
  variant: ProductVariant;
  supplier: Supplier;
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

export type Coupon = {
  id: number;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number;
  maxUses: number;
  usedCount: number;
  maxUsesPerUser: number;
  isActive: boolean;
  validFrom: Date;
  validTo: Date;
  createdAt: Date;
  updatedAt: Date;
  usages: any[];
};

export type CouponUsage = {
  id: number;
  couponId: number;
  userId: number;
  orderId: number;
  createdAt: Date;
  coupon: Coupon;
};

export enum ProductVariantKind {
  OWNERSHIP_UPGRADE = "ownership_upgrade",
  PRE_MADE_ACCOUNT = "pre_made_account",
  SHARING = "sharing",
}

export type Blog = {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  thumbnail: string;
  status: BlogStatus;
  tags: string[];
  authorId: number;
  author: User;
  createdAt: Date;
  updatedAt: Date;
};

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

export enum OrderStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}

export enum DiscountType {
  PERCENTAGE = "percentage",
  FIXED_AMOUNT = "fixed_amount",
}

export enum BlogStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
}

export enum UserRole {
  CUSTOMER = "customer",
  ADMIN = "admin",
}
