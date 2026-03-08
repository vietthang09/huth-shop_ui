import { Order } from "@/types/order";
import axiosInstance from "./axiosInstance";
import { TProduct } from "./product";
import { TProductVariant } from "./product-variants";
import { TSupplier } from "./supplier";
import { PaymentMethod } from "./type";
import { TUser } from "./user";
export type TOrderItem = {
  id: number;
  orderId: number;
  productId: number;
  variantId: number;
  quantity: number;
  total: number;
  supplierId: number;
  createdAt: string;
  updatedAt: string;
  product: TProduct;
  variant: TProductVariant;
  supplier: TSupplier;
  fields: Record<string, any>;
};

export type TOrder = {
  id: number;
  userId: number;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  orderItems: TOrderItem[];
  user: TUser;
  paymentMethod: PaymentMethod;
};
export function createOrder(
  data: {
    productId: number;
    variantId: number;
    quantity: number;
    fields?: Record<string, any>;
  }[],
  paymentMethod: PaymentMethod,
  couponCode?: string,
) {
  return axiosInstance.post("/orders", { orderItems: data, paymentMethod, couponCode });
}

export function findAll() {
  return axiosInstance.get<Order[]>("/orders");
}

export function findOne(id: number) {
  return axiosInstance.get<Order>(`/orders/${id}`);
}

export function getMyOrders() {
  return axiosInstance.get<Order[]>("/orders/my-orders");
}

export function sendConfirmationEmail(orderId: number, content?: string) {
  return axiosInstance.post(`/orders/${orderId}/send-confirmation-email`, { content });
}
