"use client";

import { useAuth } from "@/hooks/useAuth";
import { signIn } from "next-auth/react";
import Link from "next/link";

export function AuthButton() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="flex items-center space-x-4">
        <Link href="/ca-nhan" className="textw-white">
          Trang cá nhân
        </Link>
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
