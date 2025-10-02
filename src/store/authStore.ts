import { TLoginData } from "@/services/auth";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface AuthState {
  accessToken?: string | null;
  user: TLoginData | null;
}

export interface AuthActions {
  setAccessToken: (token: string | null) => void;
  setUser: (user: TLoginData | null) => void;
  logout: () => void;
}

// Custom cookie storage for Zustand
const cookieStorage = {
  getItem: (name: string): string | null => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(";").shift() || null;
    }
    return null;
  },
  setItem: (name: string, value: string): void => {
    if (typeof document === "undefined") return;
    // Set cookie with proper flags for security
    document.cookie = `${name}=${value}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax`;
  },
  removeItem: (name: string): void => {
    if (typeof document === "undefined") return;
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
  },
};

export const useAuthStore = create(
  persist<AuthState & AuthActions>(
    (set, get) => ({
      user: null,
      accessToken: null,

      setAccessToken: (token: string | null) => {
        set({ accessToken: token });
      },

      setUser: (user: TLoginData | null) => {
        set({ user });
      },

      logout: () => {
        set({ accessToken: null, user: null });
      },
    }),
    {
      name: "auth-store",
      version: 1,
      storage: createJSONStorage(() => cookieStorage),
    }
  )
);
