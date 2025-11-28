"use client";

import { ShoppingCart, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui";
import { fCurrency } from "@/shared/utils/format-number";
import Image from "next/image";
import { TProduct } from "@/services/product";
import { CartItem } from "@/store/types";
import { useRouter } from "next/navigation";

export default function CartButton() {
  const router = useRouter();
  const cartStore = useCartStore();
  const [showPopup, setShowPopup] = useState<boolean>(false);

  const onClickCartButton = () => {
    setShowPopup(!showPopup);
  };

  const onCheckout = () => {
    router.push("/thanh-toan");
    setShowPopup(false);
  };

  const totalItems = useMemo(() => cartStore.getTotalItems(), [cartStore]);
  if (!cartStore) return;

  return (
    <div className="relative">
      <div
        className="p-4 realative rounded-full  text-white hover:bg-[#171a3c] cursor-pointer"
        onClick={onClickCartButton}
      >
        <ShoppingCart className="size-5" />
        {totalItems > 0 && (
          <div className="bg-white text-[#171a3c] absolute z-50 top-1 right-1 flex items-center justify-center size-5 border rounded-full text-center align-middle p-1 text-xs">
            {totalItems}
          </div>
        )}
      </div>
      {showPopup && (
        <>
          <div className="bg-black/50 fixed inset-0" onClick={onClickCartButton} />
          <div className="bg-white p-3 absolute bottom-0 left-0 translate-y-full -translate-x-full rounded-xl">
            {totalItems === 0 ? (
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
                <h3 className="text-lg font-semibold">Giỏ hàng</h3>
                <hr />
                {cartStore.cartItems.map((item) => (
                  <CartItem key={item.product.id} item={item} />
                ))}
                <hr />
                <div className="flex items-center justify-between gap-4 p-2">
                  <p>
                    Tổng: <b>{fCurrency(cartStore.getTotalPrice())}</b>
                  </p>
                  <Button size="sm" color="secondary" className="gap-2" onClick={onCheckout}>
                    <ShoppingCart size={20} /> Thanh toán
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

type CartItemProps = {
  item: CartItem;
};
function CartItem({ item }: CartItemProps) {
  const cartStore = useCartStore();
  const onDelete = () => {
    cartStore.removeFromCart(item.product.id, item.variantId);
  };
  return (
    <div className="py-2 flex justify-between gap-4 min-w-96">
      <div className="flex gap-4">
        <Image
          src={"https://dynamic-media.tacdn.com/media/photo-o/2f/0d/14/37/caption.jpg?w=700&h=500&s=1"}
          width={44}
          height={44}
          className="h-16 w-16 object-cover rounded-lg"
          alt="image"
          unoptimized
        />
        <div className="flex flex-col justify-between gap-6">
          <div>
            <p className="font-semibold">{item.product.title}</p>
            <p className="text-sm text-gray-600">{item.product.category.title}</p>
          </div>
          <div className="flex gap-4">
            <p>
              SL: <b>{item.quantity}</b>
            </p>
            <p>
              <b>{fCurrency(item.product.variants.find((p) => p.id === item.variantId)?.retailPrice)}</b>
            </p>
          </div>
        </div>
      </div>
      <Button size="sm" variant="ghost" onClick={onDelete}>
        <X size={16} className="text-red-500" />
      </Button>
    </div>
  );
}
