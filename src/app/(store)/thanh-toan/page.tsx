"use client";

import { PaymentMethod } from "@/common/contants";
import { Button, Input } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { TProduct } from "@/services/product";
import { fCurrency } from "@/shared/utils/format-number";
import { cn } from "@/shared/utils/styling";
import { useCartStore } from "@/store/cartStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { Minus, Plus, ShieldCheck, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function CheckoutPage() {
  const cartStore = useCartStore();
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>(PaymentMethod.BANK_TRANSFER);
  const items = cartStore?.cartItems;
  const [products, setProducts] = useState<TProduct[]>([]);

  const onIncrement = (productId: number, quantity: number, variantId?: number) => {
    if (!cartStore) return;
    cartStore.updateQuantity(productId, quantity, variantId);
  };

  const onDecrement = (productId: number, quantity: number, variantId?: number) => {
    if (!cartStore) return;
    cartStore.updateQuantity(productId, quantity, variantId);
  };

  const onRemove = (productId: number, variantId?: number) => {
    if (!cartStore) return;
    cartStore.removeFromCart(productId, variantId);
  };

  // const onClear = () => {
  //   if (!cartStore) return;
  //   cartStore.clear();
  // };

  return (
    <div className="max-w-7xl mx-auto py-4">
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl">
            <header className="flex flex-col gap-3 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">
                    Sản phẩm <span className="text-sm font-medium">({cartStore.getTotalItems()})</span>
                  </h2>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <Button variant="ghost" color="danger" size="sm">
                    Xóa hết
                  </Button>
                </div>
              </div>
            </header>
            <hr />
            <div className="space-y-4 p-4 divide-y">
              {items.length === 0 && (
                <div className="py-20 flex items-center justify-center">
                  <p className="text-gray-500">No items added yet.</p>
                </div>
              )}
              {cartStore.cartItems.map((item) => {
                const variant = item.product.variants.find((v) => v.id === item.variantId);
                if (!variant) return;
                return (
                  <div key={item.product.id} className="pb-2 transition-colors bg-white">
                    <div className="gap-2">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <h3 className="font-medium truncate max-w-[40ch]">{item.product.title}</h3>
                            <Button
                              color="danger"
                              variant="ghost"
                              aria-label="Remove item"
                              size="sm"
                              onClick={() => onRemove(item.product.id, item.variantId)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-neutral-500">
                            <span className="break-all">{variant.title}</span>
                            <span className="text-neutral-300">•</span>
                            <span className="font-medium text-neutral-700">{fCurrency(variant.retailPrice)}</span>
                          </div>
                          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                color="primary"
                                aria-label="Decrease quantity"
                                disabled={item.quantity <= 1}
                                onClick={() => onDecrement(item.product.id, item.quantity - 1, item.variantId)}
                              >
                                <Minus className="size-4" />
                              </Button>
                              <span className="w-8 text-center select-none tabular-nums font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                color="primary"
                                aria-label="Increase quantity"
                                onClick={() => onIncrement(item.product.id, item.quantity + 1, item.variantId)}
                              >
                                <Plus className="size-4" />
                              </Button>
                            </div>
                            <div className="text-right min-w-[110px]">
                              <p className="text-[11px] uppercase tracking-wide text-neutral-400">Tổng</p>
                              <p className="text-base font-semibold leading-none mt-0.5">
                                {fCurrency(variant.retailPrice * item.quantity)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {items.length > 0 && (
            <div className="p-4 bg-white rounded-lg">
              <h2 className="text-2xl font-semibold">Thông tin thanh toán</h2>
              <div className="mt-2 p-4 bg-green-400/20 text-green-500 rounded-xl flex items-start gap-2">
                <ShieldCheck className="size-5" />
                <p className="text-sm">Tất cả các giao dịch được bảo mật.</p>
              </div>
              <div className="mt-6">
                <h3 className="text-xl font-semibold">Chọn phương thức thanh toán</h3>
                <div className="mt-4 flex gap-4">
                  <div
                    className="relative border p-2 rounded-xl cursor-pointer group overflow-hidden"
                    onClick={() => setSelectedMethod(PaymentMethod.MOMO)}
                  >
                    <div className="size-5 border rounded-full flex items-center justify-center">
                      {selectedMethod === PaymentMethod.MOMO && <div className="bg-black size-2.5 rounded-full" />}
                    </div>
                    <Image
                      src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-MoMo-Circle-1024x1024.png"
                      width={44}
                      height={44}
                      alt="momo"
                      className={cn(
                        "w-24 h-24 p-4 object-contain",
                        selectedMethod !== PaymentMethod.MOMO && "opacity-50 group-hover:opacity-100",
                      )}
                      unoptimized
                    />
                    {selectedMethod === PaymentMethod.MOMO && (
                      <span className="bg-green-400 text-white text-[11px] p-1 text-nowrap text-center font-semibold absolute bottom-0 left-0 right-0">
                        Đã chọn
                      </span>
                    )}
                  </div>
                  <div
                    className="relative border p-2 rounded-xl cursor-pointer group overflow-hidden"
                    onClick={() => setSelectedMethod(PaymentMethod.BANK_TRANSFER)}
                  >
                    <div className="size-5 border rounded-full flex items-center justify-center">
                      {selectedMethod === PaymentMethod.BANK_TRANSFER && (
                        <div className="bg-black size-2.5 rounded-full" />
                      )}
                    </div>
                    <Image
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Logo_TPBank.svg/2560px-Logo_TPBank.svg.png"
                      width={44}
                      height={44}
                      alt="bank transfer"
                      className={cn(
                        "w-24 h-24 p-4 object-contain",
                        selectedMethod !== PaymentMethod.BANK_TRANSFER && "opacity-50 group-hover:opacity-100",
                      )}
                      unoptimized
                    />
                    {selectedMethod === PaymentMethod.BANK_TRANSFER && (
                      <span className="bg-green-400 text-white text-[11px] p-1 text-nowrap text-center font-semibold absolute bottom-0 left-0 right-0">
                        Đã chọn
                      </span>
                    )}
                  </div>
                  <div
                    className="relative border p-2 rounded-xl cursor-pointer group overflow-hidden"
                    onClick={() => setSelectedMethod(PaymentMethod.ViettelPay)}
                  >
                    <div className="size-5 border rounded-full flex items-center justify-center">
                      {selectedMethod === PaymentMethod.ViettelPay && (
                        <div className="bg-black size-2.5 rounded-full" />
                      )}
                    </div>
                    <Image
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4OGDffm88naSCEqDH3fV1GljafXzX2GkERw&s"
                      width={44}
                      height={44}
                      alt="paypal"
                      className={cn(
                        "w-24 h-24 p-4 object-contain",
                        selectedMethod !== PaymentMethod.ViettelPay && "opacity-50 group-hover:opacity-100",
                      )}
                      unoptimized
                    />
                    {selectedMethod === PaymentMethod.ViettelPay && (
                      <span className="bg-green-400 text-white text-[11px] p-1 text-nowrap text-center font-semibold absolute bottom-0 left-0 right-0">
                        Đã chọn
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <form id="checkout-form" className="mt-6">
                <h3 className="text-xl font-semibold">Email</h3>
                <div className="mt-4 flex flex-col gap-4">
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    disabled
                    required
                    value={user?.email}
                  />
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="space-y-4 sticky top-24">
          <div className="bg-white p-4 rounded-xl">
            <div>
              <h2 className="font-medium">Tổng tiền</h2>
              <hr />
              <div className="mt-2 flex justify-between font-medium">
                <span>Tạm tính</span>
                <span>{fCurrency(cartStore.getTotalPrice())}</span>
              </div>

              <Button
                className="mt-2 w-full font-semibold"
                color="secondary"
                type="submit"
                form="checkout-form"
                disabled={isLoading}
              >
                Thanh toán
              </Button>

              <p className="mt-4 text-xs">
                Với việc bấm vào nút &quot;Thanh toán&quot; quý khác đã đồng ý với <Link href="/terms">điều khoản</Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
