import axios from "axios";
import axiosInstance, { axiosPublicInstance } from "./axiosInstance";
import { TCategory } from "./category";
import { TProductVariant } from "./product-variants";
import { ProductVariantKind } from "@/types/product";
import { ProductSortBy, SortOrder } from "@/common/contants";

export async function create(data: { sku: string; title: string; categoryId: number }) {
  return axiosInstance.post("/products", data);
}

export type TProduct = {
  id: number;
  sku: string;
  title: string;
  description: string;
  categoryId: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
  category: TCategory;
  variants: TProductVariant[];
};
export interface FindAllQuery {
  page?: number;
  limit?: number;
  sortBy?: ProductSortBy;
  order?: SortOrder;
  search?: string;
}
export async function findAll(params?: FindAllQuery) {
  return axiosInstance.get("/products", { params });
}

export async function findAllByCategory(categorySlug: string) {
  return axiosPublicInstance.get(`/products/category/${categorySlug}`);
}

export async function findOne(id: number) {
  return axiosInstance.get(`/products/${id}`);
}

export async function findOneBySku(sku: string) {
  return axiosInstance.get(`/products/sku/${sku}`);
}

export async function update(id: number, data: any) {
  return axiosInstance.patch(`/products/${id}`, data);
}

export async function remove(id: number) {
  return axiosInstance.delete(`/products/${id}`);
}
