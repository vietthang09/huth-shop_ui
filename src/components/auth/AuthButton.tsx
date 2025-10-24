"use client";

import { useAuth } from "@/hooks/useAuth";
import { signIn } from "next-auth/react";
import { Button } from "../ui";
import Link from "next/link";

export function AuthButton() {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated && user) {
    return (
      <Link href="/ca-nhan">
        <div className="size-8 flex items-center justify-center text-center border border-[2px] text-gray-800 border-gray-400 rounded-full">
          {user.name?.charAt(0)}
        </div>
      </Link>
    );
  }

  return (
    <Button onClick={() => signIn(undefined, { callbackUrl: "/" })} variant="outline">
      Đăng nhập / Đăng ký
    </Button>
  );
}
