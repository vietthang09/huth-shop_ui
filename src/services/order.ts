import axiosInstance from "./axiosInstance";
import { Order, PaymentMethod } from "./type";

export type ProcessOrderItemPayload = {
  orderItemId: number;
  expired?: string;
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

export function updateOrder(id: number, data: Partial<Order>) {
  return axiosInstance.patch<Order>(`/orders/${id}`, data);
}

export function sendConfirmationEmail(orderId: number, content?: string) {
  return axiosInstance.post(`/orders/${orderId}/send-confirmation-email`, { content });
}
