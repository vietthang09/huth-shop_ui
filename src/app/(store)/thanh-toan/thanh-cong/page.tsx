"use client";
import Link from "next/link";

export default function ThankYouPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center py-16 animate-fadeInUp">
      <div className="bg-green-100 rounded-full p-4 mb-6">
        <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2l4-4m5 2a9 9 0 11-18 0a9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Cảm ơn bạn đã đặt hàng!</h1>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        Đơn hàng của bạn đã được ghi nhận thành công. Thông tin đơn hàng sẽ được gửi đến email của bạn.
      </p>
      <Link href="/" className="px-6 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition-all">
        Quay về trang chủ
      </Link>
    </div>
  );
}
