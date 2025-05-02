"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { CheckCircle } from "lucide-react";

import { getOrder } from "@/actions/order/orderServices";
import { TOrder } from "@/types/order";
import Button from "@/components/UI/button";

export default function OrderSuccessPage({ params }: { params: { orderId: string } }) {
  const [order, setOrder] = useState<TOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const result = await getOrder(params.orderId);
        if (result.error) {
          setError(result.error);
        } else if (result.success && result.order) {
          setOrder(result.order);

          // Clear cart (optional)
          // dispatch({ type: 'cart/clearCart' });
        }
      } catch (err) {
        setError("Could not load order details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [params.orderId, dispatch]);

  if (isLoading) {
    return (
      <div className="storeContainer py-16">
        <div className="max-w-2xl mx-auto text-center">
          <p>Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="storeContainer py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">Có lỗi xảy ra</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <Button onClick={() => router.push("/")} className="px-6 py-2 bg-bitex-blue-500 text-white rounded-md">
            Quay lại trang chủ
          </Button>
        </div>
      </div>
    );
  }

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

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Mã đơn hàng:</span>
              <span className="font-medium">{order?.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ngày đặt:</span>
              <span className="font-medium">
                {order?.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN") : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Trạng thái:</span>
              <span className="font-medium text-green-600">Đã xác nhận</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tổng thanh toán:</span>
              <span className="font-semibold text-bitex-red-500">
                {order?.total?.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
              </span>
            </div>
          </div>
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
