"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";

import { useAuth } from "@/hooks/useAuth";

import { Button } from "../ui";

export function AuthButton() {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated && user) {
    return (
      <Link href="/ca-nhan">
        <div className="size-8 flex items-center justify-center text-center border-[2px] text-gray-800 border-gray-400 rounded-full">
          {user.name?.charAt(0)}
        </div>
      </Link>
    );
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={() => signIn(undefined, { callbackUrl: "/" })} variant="destructive">
        Đăng nhập
      </Button>
      <Button size="sm" onClick={() => signIn(undefined, { callbackUrl: "/" })} variant="default">
        Đăng ký
      </Button>
    </div>
  );
}
