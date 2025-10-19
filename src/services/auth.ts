import { API_URL } from "@/config";
import axiosInstance from "./axiosInstance";

export type TLoginData = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
};

type TLoginResponse = {
  access_token: string;
  user: TLoginData;
};
export function login(data: { email: string; password: string }) {
  return axiosInstance.post<TLoginResponse>(`${API_URL}/auth/login`, data);
}

export function register(data: { email: string; password: string; firstName: string; lastName: string }) {
  return axiosInstance.post<TLoginResponse>(`${API_URL}/auth/register`, data);
}
