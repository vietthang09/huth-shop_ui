import axiosInstance from "./axiosInstance";

export async function create(data: { title: string; description: string; image: string }) {
  return axiosInstance.post("/categories", data);
}

export type TCategory = {
  id: number;
  slug: string;
  title: string;
  description: string;
  image: string;
  createdAt: string;
  updatedAt: string;
};
export async function findAll() {
  return axiosInstance.get("/categories");
}

export async function findOne(id: number) {
  return axiosInstance.get(`/categories/${id}`);
}

export async function update(id: number, data: { title: string; slug: string; description: string; image: string }) {
  return axiosInstance.patch(`/categories/${id}`, data);
}

export async function remove(id: number) {
  return axiosInstance.delete(`/categories/${id}`);
}
