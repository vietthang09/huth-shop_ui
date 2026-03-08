import axiosInstance from "./axiosInstance";
import { ApiResponse, Coupon } from "./type";

export type CreateCouponPayload = Omit<Coupon, "id" | "usedCount" | "usages" | "createdAt" | "updatedAt">;
export type UpdateCouponPayload = Omit<Coupon, "id" | "usedCount" | "usages" | "createdAt" | "updatedAt">;

export function findAll() {
  return axiosInstance.get<ApiResponse<Coupon[]>>("/coupons");
}

export function findOne(id: number) {
  return axiosInstance.get<ApiResponse<Coupon>>(`/coupons/${id}`);
}

export function create(data: CreateCouponPayload) {
  return axiosInstance.post("/coupons", data);
}

export function update(id: number, data: UpdateCouponPayload) {
  return axiosInstance.patch(`/coupons/${id}`, data);
}

export function remove(id: number) {
  return axiosInstance.delete(`/coupons/${id}`);
}

export function validateCoupon(code: string, orderTotal: number) {
  return axiosInstance.post<{
    isValid: boolean;
    discountAmount: number;
    discountType: "percentage" | "fixed_amount";
    description: string;
  }>("/coupons/validate", { code, orderTotal });
}
