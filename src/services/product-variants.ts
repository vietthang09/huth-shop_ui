import axiosInstance from "./axiosInstance";
import { TSupplier } from "./supplier";

export type TProductVariant = {
  id: number;
  productId: number;
  title: string;
  description: string | null;
  netPrice: number;
  retailPrice: number;
  salePrice: number | null;
  createdAt: string;
  updatedAt: string;
  supplierId: number;
  supplier: TSupplier;
};

export async function create(data: {
  productId: number;
  title: string;
  netPrice: number;
  retailPrice: number;
  supplierId: number;
}) {
  return axiosInstance.post("/product-variants", data);
}

export async function update(id: number, data: any) {
  return axiosInstance.patch(`/product-variants/${id}`, data);
}

export async function remove(id: number) {
  return axiosInstance.delete(`/product-variants/${id}`);
}
