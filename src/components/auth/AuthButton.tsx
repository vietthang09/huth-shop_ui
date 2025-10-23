"use client";

import { useAuth } from "@/hooks/useAuth";
import { signIn } from "next-auth/react";
import { Button } from "../ui";

export function AuthButton() {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated && user) {
    return (
      <div className="size-8 flex items-center justify-center text-center border border-[2px] text-gray-800 border-gray-400 rounded-full">
        {user.name?.charAt(0)}
      </div>
    );
  }

  return (
    <Button onClick={() => signIn(undefined, { callbackUrl: "/" })} variant="outline">
      Đăng nhập / Đăng ký
    </Button>
  );
}
