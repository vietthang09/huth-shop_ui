"use client";
import React, { useEffect, useState } from "react";
import { getMyOrders, TOrder } from "@/services/order";
import { Table } from "@/components/ui/table";
import { fCurrency } from "@/shared/utils/format-number";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui";
export default function Page() {
  const { signOut } = useAuth();
  const [orders, setOrders] = useState<TOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMyOrders()
      .then((res: { data: TOrder[] }) => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch((err: any) => {
        setError("Không thể tải đơn hàng");
        setLoading(false);
      });
  }, []);

  const handleSignOut = () => {
    signOut();
  };

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6">Đơn hàng của tôi</h2>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      <Table
        data={orders}
        columns={[
          {
            key: "id",
            header: "ID",
            width: 80,
            align: "center",
          },
          {
            key: "total",
            header: "Tổng tiền",
            align: "right",
            render: (value) => (
              <span className="font-semibold text-green-700">
                {fCurrency(value, { currency: "VND", style: "currency" })}
              </span>
            ),
          },
          {
            key: "status",
            header: "Trạng thái",
            align: "center",
            render: (value) => (
              <span
                className={
                  value === "pending"
                    ? "px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-xs"
                    : value === "completed"
                    ? "px-2 py-1 rounded bg-green-100 text-green-800 text-xs"
                    : "px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs"
                }
              >
                {value}
              </span>
            ),
          },
          {
            key: "createdAt",
            header: "Ngày tạo",
            align: "center",
            render: (value) => new Date(value).toLocaleString(),
          },
          {
            key: "orderItems",
            header: "Sản phẩm",
            render: (_, row) => (
              <ul className="list-none m-0 p-0">
                {row.orderItems.map((item: TOrder["orderItems"][0]) => (
                  <li key={item.id} className="mb-1">
                    <span className="font-medium">#{item.productId}</span> (Biến thể #{item.variantId}) x{item.quantity}
                  </li>
                ))}
              </ul>
            ),
          },
        ]}
        loading={loading}
        emptyMessage="Bạn chưa có đơn hàng nào."
        variant="striped"
        size="md"
        stickyHeader
        maxHeight="500px"
      />
      <Button className="mt-4" onClick={handleSignOut} variant="outline">
        Đăng xuất
      </Button>
    </div>
  );
}
