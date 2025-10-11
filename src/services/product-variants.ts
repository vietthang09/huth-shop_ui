import axiosInstance from "./axiosInstance";

export type TProductVariant = {
  id: number;
  productId: number;
  title: string;
  netPrice: number;
  retailPrice: number;
  supplierId: number;
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
