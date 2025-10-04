import axiosInstance from "./axiosInstance";

export async function create(data: { name: string }) {
  return axiosInstance.post("/suppliers", data);
}

export type TSupplier = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};
export async function findAll() {
  return axiosInstance.get("/suppliers");
}

export async function findOne(id: number) {
  return axiosInstance.get(`/suppliers/${id}`);
}

export async function update(id: number, data: { name: string }) {
  return axiosInstance.patch(`/suppliers/${id}`, data);
}

export async function remove(id: number) {
  return axiosInstance.delete(`/suppliers/${id}`);
}
