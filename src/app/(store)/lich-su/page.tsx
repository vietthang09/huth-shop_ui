"use client";

import { getMyOrders } from "@/services/order";
import { Order } from "@/types/order";
import { LoaderCircle, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function OrderHistoryPage() {
  const type = [
    {
      label: "Tất cả",
    },
    {
      label: "Chờ xác nhận",
    },
    {
      label: "Đang giao",
    },
  ];
  const [selectedType, setSelectedType] = useState(type[0]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await getMyOrders();
      setOrders(res.data);
    } catch (error) {
      toast.error("Đã có lỗi xảy ra khi tải đơn hàng của bạn.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="bg-white py-20">
      <div className="container mx-auto">
        <div className="bg-[#f5f5f5] hover:bg-white hover:ring-2 ring-red-200 rounded-3xl p-3 flex items-center gap-3 text-[#ccc8c8]">
          <Search />
          <input className="w-full font-semibold" placeholder="Tìm bằng mã đơn hàng" />
        </div>

        <div className="mt-8 flex gap-4">
          {type.map((item, index) => (
            <div
              key={index}
              className={`border px-4 py-2 rounded-lg cursor-pointer text-sm shadow-lg ${selectedType.label === item.label ? "border-red-400 text-red-400" : "border-white"}`}
              onClick={() => setSelectedType(item)}
            >
              {item.label}
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="py-40 flex justify-center items-center">
            <LoaderCircle className="animate-spin text-[#ef534f]" />
          </div>
        ) : orders.length > 0 ? (
          orders.map((order) => (
            <div key={order.id} className="border-b py-6">
              <div className="flex justify-between items-center">
                <Link href={`/lich-su/${order.id}`} className="font-semibold">
                  Mã đơn hàng: #{order.id}
                </Link>
                <p className="text-sm">{new Date(order.createdAt).toLocaleDateString("vi-VN")}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="w-fit mx-auto py-40">
            <p className="font-semibold">Không tìm thấy đơn hàng</p>

            <div className="mt-8 flex justify-center">
              <Link href="/" className="bg-[#ef534f] text-white rounded-full px-5 py-2">
                Quay lại cửa hàng
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
