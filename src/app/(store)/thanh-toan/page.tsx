"use client";

import { useAuth } from "@/hooks/useAuth";
import { validateCoupon } from "@/services/coupon";
import { createOrder } from "@/services/order";
import { PaymentMethod } from "@/services/type";
import { fCurrency } from "@/shared/utils/format-number";
import { cn } from "@/shared/utils/styling";
import { useCartStore } from "@/store/cartStore";
import { Button, Input } from "@heroui/react";
import { Minus, Plus, ShieldCheck, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CheckoutPage() {
  const cartStore = useCartStore();
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(PaymentMethod.VIETCOMBANK);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const items = cartStore?.cartItems;
  const subtotal = cartStore.getTotalPrice();
  const totalAfterDiscount = Math.max(0, subtotal - discountAmount);

  const clearCouponState = (withMessage?: string) => {
    setAppliedCouponCode(null);
    setDiscountAmount(0);
    setCouponSuccess("");
    setCouponError(withMessage || "");
  };

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

  const handleSubmit = async () => {
    if (items.length === 0) return;
    try {
      setIsLoading(true);
      const data = cartStore.cartItems.map((item) => ({
        productId: item.product.id,
        variantId: item.variantId!,
        quantity: item.quantity,
        fields: item.fields || {},
      }));
      const res = await createOrder(data, selectedMethod, appliedCouponCode || undefined);
      if (res.status === 201) {
        router.push(res.data.paymentUrl);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    const normalizedCode = couponCode.trim().toUpperCase();
    const userId = Number(user?.id);
    if (!normalizedCode) {
      setCouponSuccess("");
      setCouponError("Vui lòng nhập mã giảm giá");
      return;
    }
    if (!Number.isFinite(userId) || userId <= 0) {
      setCouponSuccess("");
      setCouponError("Vui lòng đăng nhập để áp dụng mã giảm giá");
      return;
    }
    if (subtotal <= 0) {
      setCouponSuccess("");
      setCouponError("Không thể áp dụng mã khi giỏ hàng trống");
      return;
    }

    try {
      setIsApplyingCoupon(true);
      setCouponError("");
      setCouponSuccess("");

      const response = await validateCoupon(normalizedCode, subtotal);
      const payload = response.data;

      const parsedDiscount = Number(payload?.discountAmount);

      if (!payload?.isValid || !parsedDiscount || parsedDiscount <= 0) {
        setCouponSuccess("");
        setCouponError(payload?.description || "Mã không hợp lệ hoặc không áp dụng được cho đơn hàng này");
        return;
      }

      setAppliedCouponCode(normalizedCode);
      setDiscountAmount(Math.min(parsedDiscount, subtotal));
      setCouponSuccess(payload?.description || "Áp dụng mã giảm giá thành công");
      setCouponError("");
    } catch (error: any) {
      clearCouponState(error?.response?.data?.message || "Không thể áp dụng mã giảm giá");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  useEffect(() => {
    if (!appliedCouponCode) return;
    clearCouponState("Giỏ hàng đã thay đổi, vui lòng áp dụng lại mã giảm giá");
  }, [items.length, subtotal]);

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
              </div>
            </header>
            <hr className="border-gray-200" />
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
                              variant="light"
                              radius="full"
                              isIconOnly
                              onPress={() => onRemove(item.product.id, item.variantId)}
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
                            {variant.fields?.length === 0 ? (
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  color="primary"
                                  aria-label="Decrease quantity"
                                  disabled={item.quantity <= 1}
                                  onPress={() => onDecrement(item.product.id, item.quantity - 1, item.variantId)}
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
                                  onPress={() => onIncrement(item.product.id, item.quantity + 1, item.variantId)}
                                >
                                  <Plus className="size-4" />
                                </Button>
                              </div>
                            ) : (
                              <div />
                            )}

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
                  {/* <div
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
                  </div> */}
                  <div
                    className="relative border p-2 rounded-xl cursor-pointer group overflow-hidden"
                    onClick={() => setSelectedMethod(PaymentMethod.VIETCOMBANK)}
                  >
                    <div className="size-5 border rounded-full flex items-center justify-center">
                      {selectedMethod === PaymentMethod.VIETCOMBANK && (
                        <div className="bg-black size-2.5 rounded-full" />
                      )}
                    </div>
                    <Image
                      src="https://static.wixstatic.com/media/9d8ed5_810e9e3b7fad40eca3ec5087da674662~mv2.png/v1/fit/w_500,h_500,q_90/file.png"
                      width={44}
                      height={44}
                      alt="bank transfer"
                      className={cn(
                        "w-24 h-24 object-contain",
                        selectedMethod !== PaymentMethod.VIETCOMBANK && "opacity-50 group-hover:opacity-100",
                      )}
                      unoptimized
                    />
                    {selectedMethod === PaymentMethod.VIETCOMBANK && (
                      <span className="bg-green-400 text-white text-[11px] p-1 text-nowrap text-center font-semibold absolute bottom-0 left-0 right-0">
                        Đã chọn
                      </span>
                    )}
                  </div>
                  {/* <div
                    className="relative border p-2 rounded-xl cursor-pointer group overflow-hidden"
                    onClick={() => setSelectedMethod(PaymentMethod.TPBANK)}
                  >
                    <div className="size-5 border rounded-full flex items-center justify-center">
                      {selectedMethod === PaymentMethod.TPBANK && <div className="bg-black size-2.5 rounded-full" />}
                    </div>
                    <Image
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4OGDffm88naSCEqDH3fV1GljafXzX2GkERw&s"
                      width={44}
                      height={44}
                      alt="paypal"
                      className={cn(
                        "w-24 h-24 p-4 object-contain",
                        selectedMethod !== PaymentMethod.TPBANK && "opacity-50 group-hover:opacity-100",
                      )}
                      unoptimized
                    />
                    {selectedMethod === PaymentMethod.TPBANK && (
                      <span className="bg-green-400 text-white text-[11px] p-1 text-nowrap text-center font-semibold absolute bottom-0 left-0 right-0">
                        Đã chọn
                      </span>
                    )}
                  </div> */}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-xl font-semibold">Email nhận đơn hàng</h3>
                <div className="mt-4 flex flex-col gap-4">
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    disabled
                    required
                    value={user?.email!}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 sticky top-24">
          <div className="bg-white p-4 rounded-xl">
            <div>
              <h2 className="font-medium">Tổng tiền</h2>
              <hr className="border-gray-200" />
              <div className="mt-2 flex justify-between font-medium">
                <span>Tạm tính</span>
                <span>{fCurrency(subtotal)}</span>
              </div>

              <div className="mt-4 space-y-2">
                <h3 className="text-sm font-medium">Mã giảm giá</h3>
                <div className="flex gap-2">
                  <Input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Nhập mã giảm giá"
                    className="flex-1"
                  />
                  <Button
                    color="default"
                    onPress={handleApplyCoupon}
                    isLoading={isApplyingCoupon}
                    disabled={isApplyingCoupon || items.length === 0}
                  >
                    Áp dụng
                  </Button>
                </div>
                {!!couponError && <p className="text-xs text-danger">{couponError}</p>}
                {!!couponSuccess && <p className="text-xs text-success">{couponSuccess}</p>}
              </div>

              {discountAmount > 0 && (
                <div className="mt-3 flex justify-between text-sm text-success">
                  <span>Giảm giá {appliedCouponCode ? `(${appliedCouponCode})` : ""}</span>
                  <span>-{fCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="mt-2 flex justify-between font-semibold text-base">
                <span>Tổng thanh toán</span>
                <span>{fCurrency(totalAfterDiscount)}</span>
              </div>

              <Button
                className="mt-2 w-full font-semibold"
                color="primary"
                type="submit"
                onPress={handleSubmit}
                disabled={isLoading || items.length === 0}
                isLoading={isLoading}
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
