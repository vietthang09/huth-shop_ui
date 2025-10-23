"use client";

import { useEffect, useState } from "react";
import { TableToolbar, createCommonActions, Table, Button } from "@/components/ui";
import type { TableToolbarFilter, TableColumn, TableSort } from "@/components/ui";

import { toast } from "sonner";
import { findAll, TOrder } from "@/services/order";
import { fCurrency } from "@/shared/utils/format-number";
import { TUser } from "@/services/user";
import { OrderDialog, OrderDialogProvider, useOrderDialog } from "@/components/admin/orders";
// Inner component that uses the dialog context
function OrdersPageContent() {
  const { openAddDialog, openEditDialog, openViewDialog } = useOrderDialog();
  const [orders, setOrders] = useState<(TOrder & { user: TUser })[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<(TOrder & { user: TUser })[]>([]);
  const [selectedRows, setSelectedRows] = useState<(string | number)[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await findAll();
      if (response.status === 200) {
        const data = response.data as (TOrder & { user: TUser })[];
        setOrders(data);
        setFilteredOrders(data);
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Define table columns
  const columns: TableColumn<TOrder & { user: TUser }>[] = [
    {
      key: "id",
      header: "ID",
      width: "80px",
      sortable: true,
      render: (value) => <span className="font-mono text-sm text-gray-600">#{value}</span>,
    },
    {
      key: "customerName",
      header: "Khách hàng",
      sortable: true,
      render: (value, row) => {
        return (
          <span>
            {row.user.firstName} {row.user.lastName} {row.user.role === "admin" && "(Admin)"}
          </span>
        );
      },
    },
    {
      key: "total",
      header: "Doanh thu",
      sortable: true,
      render: (value, row) => {
        return (
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{fCurrency(value, { currency: "VND" })}</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Trạng thái",
      sortable: true,
      render: (value, row) => {
        return (
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{value}</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "createdAt",
      header: "Ngày tạo",
      sortable: true,
      render: (value, row) => {
        return (
          <div className="text-sm">
            <div className="text-gray-900">{formatDate(value)}</div>
          </div>
        );
      },
    },
    {
      key: "updatedAt",
      header: "Cập nhật lần cuối",
      sortable: true,
      render: (value, row) => {
        return (
          <div className="text-sm">
            <div className="text-gray-700">{formatDate(value)}</div>
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "Thao tác",
      align: "center",
      render: (_, row) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              openViewDialog(row);
            }}
          >
            Chi tiết
          </Button>
          <Button
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              // openEditDialog(row);
            }}
          >
            Sửa
          </Button>
        </div>
      ),
    },
  ];

  // Define table toolbar actions
  const actions = [
    createCommonActions.add(() => {
      console.log("Open create order dialog");
    }),
    createCommonActions.export(() => {
      console.log("Export orders");
      // Implement export functionality
    }),
    ...(selectedRows.length > 0
      ? [
          {
            label: `Xóa (${selectedRows.length})`,
            onClick: () => {
              // TODO: Implement bulk delete functionality
              toast.error("Chức năng xóa hàng loạt sẽ được phát triển trong tương lai");
            },
            variant: "destructive" as const,
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            ),
          },
          {
            label: `Xuất (${selectedRows.length})`,
            onClick: () => {
              console.log("Export selected suppliers:", selectedRows);
            },
            variant: "outline" as const,
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            ),
          },
        ]
      : []),
  ];

  // Define table toolbar filters
  const filters: TableToolbarFilter[] = [];

  return (
    <div className="space-y-4">
      <TableToolbar
        title="Quản lý Đơn hàng"
        description={`Hiển thị ${filteredOrders.length} trong tổng số ${orders.length} đơn hàng`}
        actions={actions}
        filters={filters}
      />

      <Table
        data={filteredOrders}
        columns={columns}
        loading={loading}
        selectable
        sortable
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        getRowId={(supplier) => supplier.id}
        size="md"
        variant="striped"
        stickyHeader
        maxHeight="600px"
        emptyMessage="Không có nhà cung cấp nào được tìm thấy"
      />

      {/* Selection Summary */}
      {selectedRows.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-4">
            <div className="text-sm text-blue-700">
              Đã chọn <span className="font-semibold">{selectedRows.length}</span> nhà cung cấp
            </div>
            <div className="text-xs text-blue-600">Bạn có thể thực hiện các thao tác hàng loạt với các mục đã chọn</div>
          </div>
          <Button size="sm" variant="ghost" onClick={() => setSelectedRows([])}>
            Bỏ chọn tất cả
          </Button>
        </div>
      )}
    </div>
  );
}

export default function SuppliersPage() {
  return (
    <OrderDialogProvider>
      <OrdersPageContent />
      <OrderDialog />
    </OrderDialogProvider>
  );
}
