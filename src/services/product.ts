import axiosInstance from "./axiosInstance";

export async function create(data: any) {
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
  category: any;
  variants: any;
};
export async function findAll() {
  return axiosInstance.get("/products");
}

export async function findOne(id: number) {
  return axiosInstance.get(`/products/${id}`);
}
