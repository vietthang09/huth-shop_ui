import axiosInstance from "./axiosInstance";
import { TUser } from "./user";
export type TOrder = {
  id: number;
  userId: number;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  orderItems: [
    {
      id: number;
      orderId: number;
      productId: number;
      variantId: number;
      quantity: number;
      total: number;
      supplierId: number;
      createdAt: string;
      updatedAt: string;
    }
  ];
};
export function createOrder(data: { productId: number; variantId: number; quantity: number }[]) {
  return axiosInstance.post("/orders", { orderItems: data });
}

export function findAll() {
  return axiosInstance.get<(TOrder & { user: TUser })[]>("/orders");
}

export function findOne(id: number) {
  return axiosInstance.get<TOrder & { user: TUser }>(`/orders/${id}`);
}

export function getMyOrders() {
  return axiosInstance.get<(TOrder & { user: TUser })[]>("/orders/my-orders");
}
