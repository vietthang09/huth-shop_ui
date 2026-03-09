import axiosInstance, { axiosPublicInstance } from "./axiosInstance";
import { ProductVariantKind } from "@/types/product";
import { ProductSortBy, SortOrder } from "@/common/contants";
import { ApiResponse, Category, Product } from "./type";

export async function create(data: { sku: string; title: string; categoryId: number }) {
  return axiosInstance.post("/products", data);
}

export type TProduct = {
  id: number;
  sku: string;
  title: string;
  description: string;
  categoryId: number;
  image: string;
  createdAt: string;
  updatedAt: string;
  category: Category;
  variants: ProductVariantKind[];
};
export interface FindAllQuery {
  page?: number;
  limit?: number;
  sortBy?: ProductSortBy;
  order?: SortOrder;
  search?: string;
  categoryId?: number;
}
export async function findAll(params?: FindAllQuery) {
  return axiosInstance.get<ApiResponse<Product[]>>("/products", { params });
}

export async function findAllByCategory(categorySlug: string) {
  return axiosPublicInstance.get(`/products/category/${categorySlug}`);
}

export async function findOne(id: number) {
  return axiosInstance.get(`/products/${id}`);
}

export async function findOneBySku(sku: string) {
  return axiosInstance.get<Product>(`/products/sku/${sku}`);
}

export async function update(id: number, data: any) {
  return axiosInstance.patch(`/products/${id}`, data);
}

export async function remove(id: number) {
  return axiosInstance.delete(`/products/${id}`);
}
