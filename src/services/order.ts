import axiosInstance from "./axiosInstance";
import { TProduct } from "./product";
import { TProductVariant } from "./product-variants";
import { TSupplier } from "./supplier";
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
};
export function createOrder(data: { productId: number; variantId: number; quantity: number }[]) {
  return axiosInstance.post("/orders", { orderItems: data });
}

export function findAll() {
  return axiosInstance.get<TOrder[]>("/orders");
}

export function findOne(id: number) {
  return axiosInstance.get<TOrder>(`/orders/${id}`);
}

export function getMyOrders() {
  return axiosInstance.get<TOrder[]>("/orders/my-orders");
}
