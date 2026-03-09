import axiosInstance from "./axiosInstance";
import { ApiResponse, Category } from "./type";

export async function create(data: Partial<Category>) {
  return axiosInstance.post("/categories", data);
}

export async function findAll(params?: any) {
  return axiosInstance.get<ApiResponse<Category[]>>("/categories", { params });
}

export async function findOne(id: number) {
  return axiosInstance.get(`/categories/${id}`);
}

export async function update(id: number, data: Partial<Category>) {
  return axiosInstance.patch(`/categories/${id}`, data);
}

export async function remove(id: number) {
  return axiosInstance.delete(`/categories/${id}`);
}
