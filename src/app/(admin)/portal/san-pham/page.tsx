"use client";

import { findAll, TProduct } from "@/services/product";
import { useEffect, useState } from "react";
import { TableToolbar, createCommonActions, Table, Button } from "@/components/ui";
import type { TableToolbarFilter, TableColumn, TableSort } from "@/components/ui";

export default function ProductsPage() {
  const [products, setProducts] = useState<TProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<TProduct[]>([]);
  const [selectedRows, setSelectedRows] = useState<(string | number)[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sort, setSort] = useState<TableSort>({ key: "", direction: null });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await findAll();
      if (response.status === 200) {
        const data = response.data as TProduct[];
        setProducts(data);
        setFilteredProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
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

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter((product) => {
        const productDate = new Date(product.createdAt).toISOString().split("T")[0];
        return productDate === dateFilter;
      });
    }

    // Apply sorting
    if (sort.key && sort.direction) {
      filtered.sort((a, b) => {
        const aValue = a[sort.key as keyof TProduct];
        const bValue = b[sort.key as keyof TProduct];

        let comparison = 0;
        if (typeof aValue === "string" && typeof bValue === "string") {
          comparison = aValue.localeCompare(bValue);
        } else if (typeof aValue === "number" && typeof bValue === "number") {
          comparison = aValue - bValue;
        } else {
          // For dates
          comparison = new Date(String(aValue)).getTime() - new Date(String(bValue)).getTime();
        }

        return sort.direction === "desc" ? -comparison : comparison;
      });
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, dateFilter, sort]);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Define table columns
  const columns: TableColumn<TProduct>[] = [
    {
      key: "id",
      header: "ID",
      width: "80px",
      sortable: true,
      render: (value) => `#${value}`,
    },
    {
      key: "sku",
      header: "SKU",
      width: "120px",
      sortable: true,
      render: (value) => <div className="font-mono text-sm text-gray-600">{value}</div>,
    },
    {
      key: "title",
      header: "Tên sản phẩm",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          {row.images && Array.isArray(row.images) && row.images[0] && (
            <img
              src={row.images[0]}
              alt={value}
              className="w-10 h-10 rounded-lg object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500 truncate max-w-[200px]">{row.description || "Không có mô tả"}</div>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Danh mục",
      render: (value) => <div className="text-sm text-gray-600">{value?.name || "Chưa phân loại"}</div>,
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
              console.log("View product:", row.id);
            }}
          >
            Chi tiết
          </Button>
          <Button
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              console.log("Edit product:", row.id);
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
      console.log("Add new product");
      // Navigate to add product page or open modal
    }),
    createCommonActions.export(() => {
      console.log("Export products");
      // Implement export functionality
    }),
    ...(selectedRows.length > 0
      ? [
          {
            label: `Xóa (${selectedRows.length})`,
            onClick: () => {
              console.log("Delete selected products:", selectedRows);
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
        ]
      : []),
  ];

  // Define table toolbar filters
  const filters: TableToolbarFilter[] = [
    {
      type: "search",
      placeholder: "Tìm kiếm theo tên sản phẩm, mô tả hoặc SKU...",
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
        title="Quản lý Sản phẩm"
        description={`Hiển thị ${filteredProducts.length} trong tổng số ${products.length} sản phẩm`}
        actions={actions}
        filters={filters}
      />

      <Table
        data={filteredProducts}
        columns={columns}
        loading={loading}
        selectable
        sortable
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        sort={sort}
        onSortChange={setSort}
        onRowClick={(product) => {
          console.log("Clicked product:", product);
          // Navigate to product detail or open modal
        }}
        getRowId={(product) => product.id}
        size="md"
        variant="striped"
        stickyHeader
        maxHeight="600px"
        emptyMessage="Không có sản phẩm nào được tìm thấy"
      />

      {/* Selection Summary */}
      {selectedRows.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-700">
            Đã chọn <span className="font-semibold">{selectedRows.length}</span> sản phẩm
          </div>
          <Button size="sm" variant="ghost" onClick={() => setSelectedRows([])}>
            Bỏ chọn tất cả
          </Button>
        </div>
      )}
    </div>
  );
}
