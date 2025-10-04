"use client";

import { useAuth } from "@/hooks/useAuth";
import { signIn } from "next-auth/react";

export function AuthButton() {
  const { user, isAuthenticated, signOut } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-700">Welcome, {user?.name || user?.email}</span>
        <button
          onClick={() => signOut()}
          className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 cursor-pointer"
        >
          Đăng xuất
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn(undefined, { callbackUrl: "/" })}
      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 cursor-pointer"
    >
      Đăng nhập
    </button>
  );
}
