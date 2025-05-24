import { Property } from "./property";
import { User } from "./user";

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

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
  order: Order;
  propertiesId: number;
  property: Property;
  netPrice: number | string;
  retailPrice: number | string;
  quantity: number;
};