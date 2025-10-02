"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";

const BANKS = [
  { label: "MB Bank", value: "mbbank", qrCode: "https://i.ibb.co/60vtZDD8/image.png" },
  { label: "Momo", value: "momo", qrCode: "https://i.ibb.co/60vtZDD8/image.png" },
  { label: "Viettel Pay", value: "viettelpay", qrCode: "https://i.ibb.co/60vtZDD8/image.png" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [touched, setTouched] = useState(false);
  const { cartItems } = useCartStore();
  if (cartItems.length === 0) {
    return <div className="text-center text-gray-500 mt-20">Giỏ hàng của bạn đang trống.</div>;
  }
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const isEmailValid = email.match(/^\S+@\S+\.\S+$/);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!isEmailValid || !selectedBank) return;
    router.push("/thanh-toan/thanh-cong");
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
              {cartItems.map((item) => (
                <li key={item.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-xs text-gray-500">Số lượng: {item.quantity}</div>
                  </div>
                  <div className="font-semibold text-blue-700">{(item.price * item.quantity).toLocaleString()}₫</div>
                </li>
              ))}
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
        <form className="space-y-7" onSubmit={handleSubmit} autoComplete="off">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-2 text-gray-700">
              Bước 1: Điền email nhận hóa đơn
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched(true)}
              className={`w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition ${
                touched && !isEmailValid ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Nhập email của bạn"
              required
            />
            {touched && !isEmailValid && <p className="text-xs text-red-500 mt-1">Vui lòng nhập email hợp lệ.</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Bước 2: Chọn ngân hàng và chuyển khoản
            </label>
            <div className="flex flex-col gap-3">
              {BANKS.map((bank) => (
                <label
                  key={bank.value}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer transition\n                    ${
                    selectedBank === bank.value ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="bank"
                    value={bank.value}
                    checked={selectedBank === bank.value}
                    onChange={() => setSelectedBank(bank.value)}
                    className="accent-blue-600"
                    required
                  />
                  <span className="font-medium text-gray-800">{bank.label}</span>
                </label>
              ))}
            </div>
            {touched && !selectedBank && <p className="text-xs text-red-500 mt-1">Vui lòng chọn ngân hàng.</p>}
            {selectedBank && (
              <div className="flex flex-col items-center mt-6">
                <span className="text-sm text-gray-700 mb-2">Quét mã QR để thanh toán:</span>
                <img
                  src={BANKS.find((b) => b.value === selectedBank)?.qrCode}
                  alt="QR code thanh toán"
                  className="w-48 h-48 object-contain border rounded-lg shadow"
                />
              </div>
            )}
          </div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">
            Bước 3: Bấm nút "Xác nhận" bên dưới đề hoàn thành đơn hàng
          </label>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-2.5 rounded-lg font-bold text-lg shadow hover:from-blue-700 hover:to-blue-600 transition disabled:opacity-60"
            disabled={!isEmailValid || !selectedBank}
          >
            Xác nhận
          </button>
        </form>
      </div>
    </div>
  );
}
