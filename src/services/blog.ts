import axiosInstance from "./axiosInstance";
import { ApiResponse, Blog } from "./type";

export function findAll() {
  return axiosInstance.get<ApiResponse<Blog[]>>("/blogs");
}

export function findOne(id: number) {
  return axiosInstance.get<ApiResponse<Blog>>(`/blogs/${id}`);
}

export function findOneBySlug(slug: string) {
  return axiosInstance.get<ApiResponse<Blog>>(`/blogs/slug/${slug}`);
}

export function create(data: Partial<Blog>) {
  return axiosInstance.post<ApiResponse<Blog>>("/blogs", data);
}

export function update(id: number, data: Partial<Blog>) {
  return axiosInstance.patch<ApiResponse<Blog>>(`/blogs/${id}`, data);
}

export function remove(id: number) {
  return axiosInstance.delete(`/blogs/${id}`);
}
