"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui";
import { fCurrency } from "@/shared/utils/format-number";
import Image from "next/image";

export default function CartButton() {
  const cartItems = useCartStore((state) => state.cartItems);
  const [showPopup, setShowPopup] = useState<boolean>(false);

  const onClickCartButton = () => {
    setShowPopup(!showPopup);
  };

  return (
    <div className="relative">
      <div className="p-4 rounded-full  text-white hover:bg-[#171a3c] cursor-pointer" onClick={onClickCartButton}>
        <ShoppingCart className="size-5" />
        {cartItems.length > 0 && (
          <div className="flex items-center justify-center size-4 border rounded-full text-center align-middle text-xs">
            {cartItems.length}
          </div>
        )}
      </div>
      {showPopup && (
        <>
          <div className="bg-black/50 fixed inset-0" onClick={onClickCartButton} />
          <div className="bg-white p-3 absolute bottom-0 left-0 translate-y-full -translate-x-full rounded-xl">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4">
                <Image
                  src="https://k4g.com/_next/static/images/empty_cart-547358581b9e42f4c9725d348a9c5f4f.png"
                  width={24}
                  height={24}
                  alt="emptry cart"
                  unoptimized
                  className="w-24"
                />
                <p className="px-10 text-nowrap font-bold">Giỏ của bạn đang hàng trống</p>
              </div>
            ) : (
              <div>
                <h3>Giỏ hàng</h3>
                <hr />
                <hr />
                <div className="flex items-center">
                  <p className="text-xl text-nowrap">
                    Tổng: <b>{fCurrency(100000, { currency: "VND" })}</b>
                  </p>
                  <Button variant="destructive">Thanh toán</Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
