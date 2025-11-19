"use client";

import { Home, LogOut, Settings, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";

import { useAuth } from "@/hooks/useAuth";

import { Button } from "../ui";

export function AuthButton() {
  const { user, isAuthenticated, signOut } = useAuth();

  const [showPopup, setShowPopup] = useState<boolean>(false);

  const onClickCartButton = () => {
    setShowPopup(!showPopup);
  };

  if (isAuthenticated && user) {
    return (
      <div className="relative">
        <div
          className="size-8 flex items-center justify-center text-center border-[2px] text-white border-white rounded-full cursor-pointer"
          onClick={onClickCartButton}
        >
          {user.name?.charAt(0)}
        </div>
        {showPopup && (
          <>
            <div className="bg-black/50 fixed inset-0" onClick={onClickCartButton} />
            <div className="min-w-72 bg-white p-3 absolute bottom-0 left-0 translate-y-full -translate-x-full rounded-xl">
              <div className="w-full bg-gray-200 p-3 rounded-xl flex items-start gap-2">
                <div
                  className="size-12 flex items-center justify-center text-center border-[2px] text-white border-white rounded-full cursor-pointer"
                  onClick={onClickCartButton}
                >
                  {user.name?.charAt(0)}
                </div>
                <div>
                  <div>
                    <p className="text-xs text-gray-600 font-bold">{user.role}</p>
                    <p>{user.name}</p>
                  </div>
                  <div>
                    <Button variant="ghost" size="xs" className="px-0" onClick={() => signOut()}>
                      <LogOut className="size-4 mr-2" /> Đăng xuất
                    </Button>
                  </div>
                </div>
              </div>
              <ul className="mt-2 divide-y divide-gray-300">
                <li>
                  <Link href="/portal" className="flex items-center gap-4 p-2 hover:bg-gray-50">
                    <Home className="size-5 text-gray-500" /> <span className="font-semibold">Portal</span>
                  </Link>
                </li>
                <li>
                  <Link href="#" className="flex items-center gap-4 p-2 hover:bg-gray-50">
                    <ShoppingCart className="size-5 text-gray-500" /> <span className="font-semibold">Đơn hàng</span>
                  </Link>
                </li>
                <li>
                  <Link href="#" className="flex items-center gap-4 p-2 hover:bg-gray-50">
                    <Settings className="size-5 text-gray-500" /> <span className="font-semibold">Tài khoản</span>
                  </Link>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
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
