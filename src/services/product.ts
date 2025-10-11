import axiosInstance from "./axiosInstance";
import { TCategory } from "./category";
import { TProductVariant } from "./product-variants";

export async function create(data: { sku: string; title: string; categoryId: number }) {
  return axiosInstance.post("/products", data);
}

export type TProduct = {
  id: number;
  sku: string;
  title: string;
  description: string;
  categoryId: number;
  images: any;
  createdAt: string;
  updatedAt: string;
  category: TCategory;
  variants: TProductVariant[];
};
export async function findAll() {
  return axiosInstance.get("/products");
}

export async function findOne(id: number) {
  return axiosInstance.get(`/products/${id}`);
}

export async function update(id: number, data: any) {
  return axiosInstance.patch(`/products/${id}`, data);
}

export async function remove(id: number) {
  return axiosInstance.delete(`/products/${id}`);
}
