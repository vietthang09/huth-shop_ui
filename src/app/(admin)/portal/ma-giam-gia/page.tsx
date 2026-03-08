"use client";

import { useEffect, useState } from "react";
import { TableToolbar, createCommonActions, Table, Button } from "@/components/ui";
import type { TableToolbarFilter, TableColumn, TableSort } from "@/components/ui";
import { toast } from "sonner";
import { Coupon, DiscountType } from "@/services/type";
import { findAll } from "@/services/coupon";
import { CouponDialog, CouponDialogProvider, useCouponDialog } from "@/components/admin/coupon";

// Inner component that uses the dialog context
function CouponsPageContent() {
  const { openAddDialog, openEditDialog, openViewDialog } = useCouponDialog();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [filteredCoupons, setFilteredCoupons] = useState<Coupon[]>([]);
  const [selectedRows, setSelectedRows] = useState<(string | number)[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sort, setSort] = useState<TableSort>({ key: "", direction: null });

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await findAll();
      if (response.status === 200) {
        const data = response.data.data;
        setCoupons(data);
        setFilteredCoupons(data);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const getDiscountTypeLabel = (discountType: DiscountType) => {
    return discountType === DiscountType.PERCENTAGE ? "Phần trăm" : "Số tiền cố định";
  };

  // Filter and sort coupons
  useEffect(() => {
    let filtered = [...coupons];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((coupon) => {
        const keyword = searchTerm.toLowerCase();
        return (
          coupon.code.toLowerCase().includes(keyword) ||
          (coupon.description || "").toLowerCase().includes(keyword) ||
          getDiscountTypeLabel(coupon.discountType).toLowerCase().includes(keyword)
        );
      });
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter((coupon) => {
        const couponDate = new Date(coupon.createdAt).toISOString().split("T")[0];
        return couponDate === dateFilter;
      });
    }

    // Apply sorting
    if (sort.key && sort.direction) {
      filtered.sort((a, b) => {
        const aValue = a[sort.key as keyof Coupon];
        const bValue = b[sort.key as keyof Coupon];

        let comparison = 0;
        if (typeof aValue === "string" && typeof bValue === "string") {
          comparison = aValue.localeCompare(bValue);
        } else if (typeof aValue === "number" && typeof bValue === "number") {
          comparison = aValue - bValue;
        } else {
          comparison = new Date(String(aValue)).getTime() - new Date(String(bValue)).getTime();
        }

        return sort.direction === "desc" ? -comparison : comparison;
      });
    }

    setFilteredCoupons(filtered);
  }, [coupons, searchTerm, dateFilter, sort]);

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Define table columns
  const columns: TableColumn<Coupon>[] = [
    {
      key: "id",
      header: "ID",
      width: "80px",
      sortable: true,
      render: (value) => `#${value}`,
    },
    {
      key: "code",
      header: "Mã giảm giá",
      width: "160px",
      sortable: true,
      render: (value) => <div className="font-mono text-sm text-gray-700">{value}</div>,
    },
    {
      key: "discountType",
      header: "Loại giảm giá",
      sortable: true,
      render: (value: DiscountType) => (
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
          {getDiscountTypeLabel(value)}
        </span>
      ),
    },
    {
      key: "discountValue",
      header: "Giá trị giảm",
      sortable: true,
      render: (value, row) => (
        <div className="text-sm text-gray-900 font-medium">
          {row.discountType === DiscountType.PERCENTAGE ? `${value}%` : formatCurrency(Number(value))}
        </div>
      ),
    },
    {
      key: "description",
      header: "Mô tả",
      render: (value) => (
        <div className="text-sm text-gray-600 max-w-[260px] truncate">{value || "Không có mô tả"}</div>
      ),
    },
    {
      key: "usage",
      header: "Lượt dùng",
      render: (_, row) => (
        <div className="text-sm text-gray-700">
          {row.usedCount}/{row.maxUses}
        </div>
      ),
    },
    {
      key: "isActive",
      header: "Trạng thái",
      sortable: true,
      render: (value: boolean) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
            value ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"
          }`}
        >
          {value ? "Đang hoạt động" : "Tạm ngưng"}
        </span>
      ),
    },
    {
      key: "validTo",
      header: "Hạn sử dụng",
      sortable: true,
      render: (value) => <div className="text-sm text-gray-700">{formatDate(value)}</div>,
    },
    {
      key: "createdAt",
      header: "Ngày tạo",
      sortable: true,
      render: (value) => (
        <div className="text-sm">
          <div className="text-gray-900">{formatDate(value)}</div>
        </div>
      ),
    },
    {
      key: "updatedAt",
      header: "Cập nhật lần cuối",
      sortable: true,
      render: (value) => <div className="text-sm text-gray-500">{formatDate(value)}</div>,
    },
    {
      key: "actions",
      header: "Thao tác",
      align: "center",
      render: (_, row) => (
        <div className="flex items-center justify-center gap-2">
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
              openEditDialog(row);
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
      openAddDialog();
    }),
    createCommonActions.export(() => {
      console.log("Export coupons:", selectedRows);
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
              console.log("Export selected products:", selectedRows);
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
  const filters: TableToolbarFilter[] = [
    {
      type: "search",
      placeholder: "Tìm theo mã, mô tả hoặc loại giảm giá...",
      value: searchTerm,
      onChange: setSearchTerm,
      label: "Tìm kiếm",
    },
    {
      type: "date",
      placeholder: "Chọn ngày tạo...",
      value: dateFilter,
      onChange: setDateFilter,
      label: "Ngày tạo",
    },
  ];

  return (
    <div className="space-y-4">
      <TableToolbar
        title="Quản lý Mã giảm giá"
        description={`Hiển thị ${filteredCoupons.length} trong tổng số ${coupons.length} mã giảm giá`}
        actions={actions}
        filters={filters}
      />

      <Table
        data={filteredCoupons}
        columns={columns}
        loading={loading}
        selectable
        sortable
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        sort={sort}
        onSortChange={setSort}
        onRowClick={(coupon) => {
          openViewDialog(coupon);
        }}
        getRowId={(coupon) => coupon.id}
        size="md"
        variant="striped"
        stickyHeader
        emptyMessage="Không có mã giảm giá nào được tìm thấy"
      />

      {/* Selection Summary */}
      {selectedRows.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-4">
            <div className="text-sm text-blue-700">
              Đã chọn <span className="font-semibold">{selectedRows.length}</span> mã giảm giá
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

// Main page component with dialog provider
export default function CouponsPage() {
  return (
    <CouponDialogProvider>
      <CouponsPageContent />
      <CouponDialog />
    </CouponDialogProvider>
  );
}
