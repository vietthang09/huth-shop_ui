"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function OrderSuccessPage({ params }: { params: { orderId: string } }) {
  return (
    <div className="storeContainer py-16">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <CheckCircle size={64} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">Đặt hàng thành công!</h1>
          <p className="text-gray-600">Cảm ơn bạn đã đặt hàng. Chúng tôi đã nhận được thanh toán của bạn.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <h2 className="text-lg font-medium text-gray-700 mb-4">Thông tin đơn hàng</h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <Link
            href="/"
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md text-center hover:bg-gray-200 transition-colors"
          >
            Tiếp tục mua sắm
          </Link>
          <Link
            href="/account/orders"
            className="px-6 py-2 bg-bitex-blue-500 text-white rounded-md text-center hover:bg-bitex-blue-600 transition-colors"
          >
            Xem đơn hàng của tôi
          </Link>
        </div>
      </div>
    </div>
  );
}
