import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { getToken } from "@/lib/auth-utils";
import type { InternalAxiosRequestConfig } from "axios";
import { API_URL } from "@/config";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || API_URL;

// Create axios instance with default configuration
const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const axiosPublicInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor to add authentication token and logging

axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (config.headers) {
      config.headers["ngrok-skip-browser-warning"] = "true";

      // Add Authorization header if NextAuth token exists
      try {
        const token = await getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error("Failed to get token in request interceptor:", error);
      }
    }

    return config;
  },
  (error: AxiosError) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling responses and errors
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful response in development
    if (process.env.NODE_ENV === "development") {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`, response.data);
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - Session expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log(error);

      // For 401 errors with NextAuth, sign out the user
      if (typeof window !== "undefined") {
        const { signOut } = await import("next-auth/react");
        await signOut({
          callbackUrl: "/dang-nhap",
          redirect: true,
        });
      }
    }

    // Handle different error status codes
    const errorMessage = getErrorMessage(error);

    // Log error in development
    if (process.env.NODE_ENV === "development") {
      console.error("❌ API Error:", {
        status: error.response?.status,
        message: errorMessage,
        url: error.config?.url,
        data: error.response?.data,
      });
    }

    // Create a more user-friendly error object
    const enhancedError = {
      ...error,
      message: errorMessage,
      statusCode: error.response?.status,
      data: error.response?.data,
    };

    return Promise.reject(enhancedError);
  }
);

// Helper function to extract user-friendly error messages
function getErrorMessage(error: AxiosError): string {
  if (error.response?.data && typeof error.response.data === "object") {
    const data = error.response.data as any;

    // Common error message patterns
    if (data.message) return data.message;
    if (data.error) return data.error;
    if (data.detail) return data.detail;
    if (data.errors && Array.isArray(data.errors)) {
      return data.errors.map((err: any) => err.message || err).join(", ");
    }
  }

  // Status code based messages
  switch (error.response?.status) {
    case 400:
      return "Bad request. Please check your input.";
    case 401:
      return "Unauthorized. Please log in again.";
    case 403:
      return "Forbidden. You do not have permission to perform this action.";
    case 404:
      return "Resource not found.";
    case 409:
      return "Conflict. The resource already exists.";
    case 422:
      return "Validation error. Please check your input.";
    case 429:
      return "Too many requests. Please try again later.";
    case 500:
      return "Internal server error. Please try again later.";
    case 502:
      return "Bad gateway. Please try again later.";
    case 503:
      return "Service unavailable. Please try again later.";
    default:
      return error.message || "An unexpected error occurred.";
  }
}

// Generic API methods for common operations
export const api = {
  // GET request
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return axiosInstance.get<T>(url, config);
  },

  // POST request
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return axiosInstance.post<T>(url, data, config);
  },

  // PUT request
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return axiosInstance.put<T>(url, data, config);
  },

  // PATCH request
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return axiosInstance.patch<T>(url, data, config);
  },

  // DELETE request
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return axiosInstance.delete<T>(url, config);
  },

  // Upload file
  upload: <T = any>(url: string, file: File | FormData, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    const formData = file instanceof FormData ? file : new FormData();
    if (file instanceof File) {
      formData.append("file", file);
    }

    return axiosInstance.post<T>(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Download file
  download: (url: string, filename?: string, config?: AxiosRequestConfig): Promise<void> => {
    return axiosInstance
      .get(url, {
        ...config,
        responseType: "blob",
      })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename || "download");
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      });
  },
};

export default axiosInstance;
