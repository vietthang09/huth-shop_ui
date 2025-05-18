import { Attribute } from "./attribute";
import { Inventory } from "./inventory";
import { OrderItem } from "./order";
import { Product } from "./product";

export type Property = {
  id: number;
  productId: number;
  product: Product;
  attributeSetHash: string;
  attributeSet: Attribute;
  netPrice: number | string; // Decimal can be represented as string or number
  retailPrice: number | string;
  salePrice: number | string | null;
  createdAt: Date;
  updatedAt: Date;
  inventory: Inventory | null;
  orderItems: OrderItem[];
};
