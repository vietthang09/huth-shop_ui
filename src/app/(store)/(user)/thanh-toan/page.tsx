"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";
import { generateVietQR, TVietQR } from "@/services/external";
import QRCode from "qrcode";

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems } = useCartStore();
  const [qrCode, setQrCode] = useState<string | null>(null);

  const cartTotal = cartItems.reduce((sum, item) => {
    const variant = item.variantId ? item.product.variants?.find((v) => v.id === item.variantId) : null;
    const price = variant?.retailPrice || 0;
    return sum + price * item.quantity;
  }, 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/thanh-toan/thanh-cong");
  }

  const fetchQRCode = async () => {
    if (cartTotal <= 0) return; // Don't generate QR code if cart total is 0

    const res = await generateVietQR(cartTotal, `Thanh toan don hang`);
    if (res.status === 200) {
      const data = res.data as TVietQR;
      QRCode.toDataURL(data.qrCode, (err, url) => {
        setQrCode(url);
      });
    }
  };

  useEffect(() => {
    fetchQRCode();
  }, [cartTotal]);
  if (cartItems.length === 0) {
    return <div className="text-center text-gray-500 mt-20">Giỏ hàng của bạn đang trống.</div>;
  }
  if (!qrCode) {
    return <div className="text-center text-gray-500 mt-20">Đang tải mã QR...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
      <div className="w-full h-fit p-4 border border-gray-200 rounded-2xl shadow-lg bg-white/90 backdrop-blur order-2 lg:order-1">
        <h3 className="text-xl font-bold mb-6">Tóm tắt đơn hàng</h3>
        {cartItems.length === 0 ? (
          <div className="text-gray-500 text-center">Giỏ hàng của bạn đang trống.</div>
        ) : (
          <>
            <ul className="divide-y divide-gray-100 mb-6">
              {cartItems.map((item) => {
                const variant = item.variantId ? item.product.variants?.find((v) => v.id === item.variantId) : null;
                const price = variant?.retailPrice || 0;
                const itemName = `${item.product.title} - ${variant?.title}`;
                const itemKey = `${item.product.id}-${item.variantId || "default"}`;

                return (
                  <li key={itemKey} className="flex items-center justify-between py-3">
                    <div>
                      <div className="font-medium text-gray-900">{itemName}</div>
                      <div className="text-xs text-gray-500">Số lượng: {item.quantity}</div>
                    </div>
                    <div className="font-semibold text-blue-700">{(price * item.quantity).toLocaleString()}₫</div>
                  </li>
                );
              })}
            </ul>
            <div className="flex justify-between font-bold text-lg">
              <span>Tổng cộng</span>
              <span className="text-blue-700">{cartTotal.toLocaleString()}₫</span>
            </div>
          </>
        )}
      </div>
      <div className="w-full p-4 border border-gray-200 rounded-2xl shadow-lg bg-white/90 backdrop-blur mb-10 md:mb-0 order-1 lg:order-2">
        <h2 className="text-lg font-extrabold mb-8 text-center tracking-tight">Thanh toán</h2>
        <div className="space-y-7">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Bước 1: Chuyển khoản</label>
            <img className="mx-auto" src={qrCode} />
          </div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">
            Bước 2: Bấm nút "Xác nhận" bên dưới đề hoàn thành đơn hàng
          </label>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-2.5 rounded-lg font-bold text-lg shadow hover:from-blue-700 hover:to-blue-600 transition disabled:opacity-60"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}
