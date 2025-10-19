import axiosInstance from "./axiosInstance";

export type Order = {
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
  return axiosInstance.post("/orders", data);
}
