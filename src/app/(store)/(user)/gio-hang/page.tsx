"use client";

import { ArrowRight, Trash } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { fCurrency } from "@/shared/utils/format-number";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

export default function Page() {
  const router = useRouter();
  const { cartItems, removeFromCart, updateQuantity } = useCartStore();

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    setSelectedIds((prev) => {
      const validIds = prev.filter((id) => cartItems.some((item) => item.product.id === id));
      if (validIds.length === 0 && cartItems.length > 0) {
        return [cartItems[0].product.id];
      }
      return validIds;
    });
  }, [cartItems]);

  const allSelected = cartItems.length > 0 && selectedIds.length === cartItems.length;
  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(cartItems.map((item) => item.product.id));
    }
  };

  const handleSelectItem = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]));
  };

  const handleRemoveSelected = () => {
    selectedIds.forEach((id) => removeFromCart(id));
  };

  const selectedItems = cartItems.filter((item) => selectedIds.includes(item.product.id));
  const subtotal = selectedItems.reduce((sum, item) => {
    // Get price from variant if available
    const variant = item.variantId ? item.product.variants?.find((v) => v.id === item.variantId) : null;
    const price = variant?.retailPrice || 0;
    return sum + price * item.quantity;
  }, 0);
  const totalAmount = subtotal;

  return (
    <div className="flex flex-col lg:flex-row justify-center gap-8">
      {/* Left: Cart Items */}
      <div className="flex-1 max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={handleSelectAll}
              className="w-5 h-5"
              aria-label="Select all"
            />
            <span className="font-medium">
              {selectedIds.length}/{cartItems.length} sản phẩm
            </span>
          </div>
          {selectedIds.length > 0 && (
            <button className="text-sm text-gray-500 hover:underline" onClick={handleRemoveSelected}>
              Xóa đã chọn
            </button>
          )}
        </div>
        {cartItems.length === 0 ? (
          <div className="text-center text-gray-500">Giỏ hàng của bạn đang trống.</div>
        ) : (
          cartItems.map((item) => {
            const variant = item.variantId ? item.product.variants?.find((v) => v.id === item.variantId) : null;
            const price = variant?.retailPrice || 0;
            const itemKey = `${item.product.id}-${item.variantId || "default"}`;

            return (
              <div key={itemKey} className="bg-white rounded shadow p-6 flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.product.id)}
                  onChange={() => handleSelectItem(item.product.id)}
                  className="w-5 h-5"
                  aria-label={`Select ${item.product.title}`}
                />
                <div className="flex-1">
                  <div className="font-semibold text-lg">{item.product.title}</div>
                  {variant && <div className="text-sm text-gray-600 mt-1">{variant.title}</div>}
                  <div className="flex items-center gap-2 mt-4">
                    <button
                      className="w-8 h-8 rounded-full border border-gray-300 bg-gray-100 text-lg font-bold flex items-center justify-center transition hover:bg-gray-200 hover:border-gray-400 active:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-black/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variantId)}
                      disabled={item.quantity <= 1}
                      aria-label="Giảm số lượng"
                    >
                      -
                    </button>
                    <span className="font-medium mx-2 select-none min-w-[2ch] text-center">{item.quantity}</span>
                    <button
                      className="w-8 h-8 rounded-full border border-gray-300 bg-gray-100 text-lg font-bold flex items-center justify-center transition hover:bg-gray-200 hover:border-gray-400 active:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-black/30"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variantId)}
                      aria-label="Tăng số lượng"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">Tổng</div>
                  <div className="font-semibold text-lg">{fCurrency(price * item.quantity, { currency: "VND" })}</div>
                </div>
                <button
                  className="text-red-400 cursor-pointer"
                  title="Delete"
                  onClick={() => removeFromCart(item.product.id, item.variantId)}
                >
                  <Trash className="size-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Right: Coupon & Price Details */}
      <div className="lg:w-96">
        <div className="bg-white rounded shadow p-6">
          <div className="font-semibold mb-2">Chi tiết</div>
          <div className="flex justify-between text-sm mb-1">
            <span>{selectedItems.length} sản phẩm</span>
            <span>{fCurrency(subtotal, { currency: "VND" })}</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between font-semibold text-lg mb-4">
            <span>Tổng cộng</span>
            <span>{fCurrency(totalAmount, { currency: "VND" })}</span>
          </div>
          <Button disabled={selectedItems.length === 0} onClick={() => router.push("/thanh-toan")} className="w-full">
            Thanh toán <ArrowRight className="ml-2 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
