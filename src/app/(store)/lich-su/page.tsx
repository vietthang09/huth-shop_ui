"use client";

import { getMyOrders } from "@/services/order";
import { fCurrency } from "@/shared/utils/format-number";
import { Order } from "@/types/order";
import { Accordion, AccordionItem, BreadcrumbItem, Breadcrumbs } from "@heroui/react";
import { CalendarDays, LoaderCircle, Search, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  { key: "ALL", label: "Tất cả" },
  { key: "PENDING", label: "Chờ xác nhận" },
  { key: "PROCESSING", label: "Đang xử lý" },
  { key: "DELIVERED", label: "Đã giao" },
  { key: "CANCELLED", label: "Đã hủy" },
  { key: "REFUNDED", label: "Hoàn tiền" },
] as const;

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PROCESSING: "bg-sky-100 text-sky-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-rose-100 text-rose-700",
  REFUNDED: "bg-violet-100 text-violet-700",
};

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatAttributeText(attributeName?: string | null, attributeValue?: string | null) {
  if (!attributeName && !attributeValue) return "Phân loại mặc định";
  if (attributeName && attributeValue) return `${attributeName}: ${attributeValue}`;
  return attributeName || attributeValue || "Phân loại mặc định";
}

export default function OrderHistoryPage() {
  const [selectedStatus, setSelectedStatus] = useState<(typeof STATUS_OPTIONS)[number]["key"]>("ALL");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await getMyOrders();
      setOrders(res.data);
    } catch {
      toast.error("Đã có lỗi xảy ra khi tải đơn hàng của bạn.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const normalizedKeyword = searchKeyword.trim().toLowerCase();

    return orders.filter((order) => {
      const matchedStatus = selectedStatus === "ALL" || order.status === selectedStatus;
      if (!matchedStatus) return false;

      if (!normalizedKeyword) return true;

      const inOrderCode = String(order.id).includes(normalizedKeyword);
      const inProductName = order.orderItems.some((item) =>
        item.property?.product?.title?.toLowerCase().includes(normalizedKeyword),
      );

      return inOrderCode || inProductName;
    });
  }, [orders, searchKeyword, selectedStatus]);

  const totalSpend = useMemo(() => {
    return filteredOrders.reduce((sum, order) => sum + Number(order.total), 0);
  }, [filteredOrders]);

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <Breadcrumbs>
          <BreadcrumbItem>HuthShop</BreadcrumbItem>
          <BreadcrumbItem>Lịch sử đặt hàng</BreadcrumbItem>
        </Breadcrumbs>

        <div className="mt-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-zinc-200 lg:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">Lịch sử đơn hàng</h1>
              <p className="mt-1 text-sm text-zinc-500">
                Theo dõi trạng thái đơn hàng và chi tiết sản phẩm bạn đã mua.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm sm:w-fit">
              <div className="rounded-2xl bg-zinc-100 px-4 py-3">
                <p className="text-zinc-500">Đơn hiển thị</p>
                <p className="mt-1 text-lg font-semibold text-zinc-900">{filteredOrders.length}</p>
              </div>
              <div className="rounded-2xl bg-rose-50 px-4 py-3">
                <p className="text-zinc-500">Tổng chi tiêu</p>
                <p className="mt-1 text-lg font-semibold text-rose-600">{fCurrency(totalSpend)}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-3 flex items-center gap-3 text-zinc-400 focus-within:ring-2 focus-within:ring-rose-200">
            <Search size={18} />
            <input
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
              className="w-full bg-transparent text-sm font-medium text-zinc-700 outline-none"
              placeholder="Tìm theo mã đơn hoặc tên sản phẩm"
            />
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {STATUS_OPTIONS.map((status) => {
              const isActive = selectedStatus === status.key;
              return (
                <button
                  key={status.key}
                  type="button"
                  onClick={() => setSelectedStatus(status.key)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "border-rose-500 bg-rose-500 text-white"
                      : "border-zinc-200 bg-white text-zinc-600 hover:border-rose-300 hover:text-rose-500"
                  }`}
                >
                  {status.label}
                </button>
              );
            })}
          </div>
        </div>

        {isLoading ? (
          <div className="py-40 flex justify-center items-center">
            <LoaderCircle className="animate-spin text-[#ef534f]" size={28} />
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="mt-6">
            <Accordion variant="splitted" className="gap-3 !px-0">
              {filteredOrders.map((order) => (
                <AccordionItem
                  key={order.id}
                  className="rounded-2xl border border-zinc-100"
                  title={
                    <div className="flex flex-col gap-2 pr-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2 text-zinc-800">
                        <ShoppingBag size={16} className="text-rose-500" />
                        <span className="font-semibold">Đơn hàng #{order.id}</span>
                      </div>
                      <span
                        className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[order.status] || "bg-zinc-100 text-zinc-600"}`}
                      >
                        {STATUS_OPTIONS.find((status) => status.key === order.status)?.label || order.status}
                      </span>
                    </div>
                  }
                >
                  <div className="grid gap-3 rounded-2xl bg-zinc-50 p-4 text-sm sm:grid-cols-3">
                    <div className="rounded-xl bg-white px-3 py-2">
                      <p className="text-zinc-500">Ngày đặt</p>
                      <p className="mt-1 flex items-center gap-2 font-semibold text-zinc-800">
                        <CalendarDays size={14} className="text-zinc-400" />
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white px-3 py-2">
                      <p className="text-zinc-500">Số lượng sản phẩm</p>
                      <p className="mt-1 font-semibold text-zinc-800">{order.orderItems.length} sản phẩm</p>
                    </div>
                    <div className="rounded-xl bg-white px-3 py-2">
                      <p className="text-zinc-500">Tổng thanh toán</p>
                      <p className="mt-1 font-semibold text-rose-600">{fCurrency(order.total)}</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {order.orderItems.map((item) => {
                      const unitPrice = Number(item.netPrice || item.retailPrice || 0);
                      const lineTotal = unitPrice * item.quantity;

                      return (
                        <div key={item.id} className="rounded-2xl border border-zinc-200 bg-white p-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="font-semibold text-zinc-900">
                                {item.property?.product?.title || "Sản phẩm"}
                              </p>
                              <p className="mt-1 text-sm text-zinc-500">
                                {formatAttributeText(
                                  item.property?.attributeSet?.name,
                                  item.property?.attributeSet?.value,
                                )}
                              </p>
                            </div>
                            <p className="text-sm font-semibold text-zinc-700">x{item.quantity}</p>
                          </div>

                          <div className="mt-3 grid gap-2 text-sm text-zinc-600 sm:grid-cols-3">
                            <p>Đơn giá: {fCurrency(unitPrice)}</p>
                            <p>Số lượng: {item.quantity}</p>
                            <p className="font-semibold text-zinc-800">Thành tiền: {fCurrency(lineTotal)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ) : (
          <div className="w-full mx-auto py-24">
            <div className="mx-auto w-full max-w-xl rounded-3xl border border-dashed border-zinc-300 bg-white p-10 text-center">
              <p className="text-lg font-semibold text-zinc-800">Không tìm thấy đơn hàng phù hợp</p>
              <p className="mt-2 text-sm text-zinc-500">
                Hãy thử thay đổi bộ lọc hoặc tiếp tục mua sắm để tạo đơn hàng mới.
              </p>

              <div className="mt-8 flex justify-center">
                <Link
                  href="/"
                  className="bg-[#ef534f] text-white rounded-full px-5 py-2 font-semibold hover:opacity-90 transition"
                >
                  Quay lại cửa hàng
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
