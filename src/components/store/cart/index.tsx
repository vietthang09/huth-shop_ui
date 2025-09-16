"use client";

import { ArrowRight, Trash } from "lucide-react";
import { useCartStore } from "../../../store/cartStore";
import { fCurrency } from "@/shared/utils/format-number";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const router = useRouter();
  const { cartItems, removeFromCart, updateQuantity } = useCartStore();

  // Track selected item ids
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // When cartItems change (add/remove), update selectedIds to only valid ids
  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => cartItems.some((item) => item.id === id)));
  }, [cartItems]);

  // Select all if all items are selected, otherwise deselect all
  const allSelected = cartItems.length > 0 && selectedIds.length === cartItems.length;
  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(cartItems.map((item) => item.id));
    }
  };

  // Toggle selection for a single item
  const handleSelectItem = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]));
  };

  // Remove all selected items
  const handleRemoveSelected = () => {
    selectedIds.forEach((id) => removeFromCart(id));
  };

  // Only selected items for subtotal/total
  const selectedItems = cartItems.filter((item) => selectedIds.includes(item.id));
  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalAmount = subtotal;

  return (
    <div className="mt-40 flex justify-center gap-8">
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
          <button
            className="text-sm text-gray-500 hover:underline"
            onClick={handleRemoveSelected}
            disabled={selectedIds.length === 0}
          >
            Xóa đã chọn
          </button>
        </div>
        {cartItems.length === 0 ? (
          <div className="text-center text-gray-500">Giỏ hàng của bạn đang trống.</div>
        ) : (
          cartItems.map((item) => (
            <div key={item.id} className="bg-white rounded shadow p-6 flex items-center gap-4">
              <input
                type="checkbox"
                checked={selectedIds.includes(item.id)}
                onChange={() => handleSelectItem(item.id)}
                className="w-5 h-5"
                aria-label={`Select ${item.name}`}
              />
              <div className="flex-1">
                <div className="font-semibold text-lg">{item.name}</div>
                <div className="flex items-center gap-2 mt-4">
                  <button
                    className="w-8 h-8 rounded bg-gray-100 text-lg"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="font-medium">{item.quantity}</span>
                  <button
                    className="w-8 h-8 rounded bg-gray-100 text-lg"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              <button className="text-red-500 text-xl" title="Delete" onClick={() => removeFromCart(item.id)}>
                <Trash />
              </button>
              <div className="text-right">
                <div className="text-xs text-gray-400">Tổng</div>
                <div className="font-semibold text-lg">
                  {fCurrency(item.price * item.quantity, { currency: "VND" })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Right: Coupon & Price Details */}
      <div className="w-96">
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
          <button
            className="w-full bg-black text-white py-2 rounded-2xl flex items-center justify-center gap-2 text-base font-medium"
            disabled={selectedItems.length === 0}
            onClick={() => router.push("/thanh-toan")}
          >
            Thanh toán{" "}
            <span className="text-xl">
              <ArrowRight />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
