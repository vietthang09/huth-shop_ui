"use client";

import { findAll, TCategory } from "@/services/category";
import { useEffect, useState } from "react";
import { TableToolbar, createCommonActions, Table, Button } from "@/components/ui";
import type { TableToolbarFilter, TableColumn, TableSort } from "@/components/ui";
import { CategoryDialogProvider, useCategoryDialog, CategoryDialog } from "@/components/admin/categories";
import { toast } from "sonner";

// Inner component that uses the dialog context
function CategoriesPageContent() {
  const { openAddDialog, openEditDialog, openViewDialog } = useCategoryDialog();

  const [categories, setCategories] = useState<TCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<TCategory[]>([]);
  const [selectedRows, setSelectedRows] = useState<(string | number)[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sort, setSort] = useState<TableSort>({ key: "", direction: null });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await findAll();
      if (response.status === 200) {
        const data = response.data as TCategory[];
        setCategories(data);
        setFilteredCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
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

  // Filter and sort categories
  useEffect(() => {
    let filtered = [...categories];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (category) =>
          category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          category.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter((category) => {
        const categoryDate = new Date(category.createdAt).toISOString().split("T")[0];
        return categoryDate === dateFilter;
      });
    }

    // Apply sorting
    if (sort.key && sort.direction) {
      filtered.sort((a, b) => {
        const aValue = a[sort.key as keyof TCategory];
        const bValue = b[sort.key as keyof TCategory];

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

    setFilteredCategories(filtered);
  }, [categories, searchTerm, dateFilter, sort]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Define table columns
  const columns: TableColumn<TCategory>[] = [
    {
      key: "id",
      header: "ID",
      width: "80px",
      sortable: true,
      render: (value) => `#${value}`,
    },
    {
      key: "title",
      header: "Tên danh mục",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          {row.image && (
            <img
              src={row.image}
              alt={value}
              className="w-10 h-10 rounded-lg object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500 truncate max-w-[200px]">{row.description}</div>
          </div>
        </div>
      ),
    },
    {
      key: "description",
      header: "Mô tả",
      render: (value) => (
        <div className="max-w-[300px] truncate text-gray-600" title={value}>
          {value || "Không có mô tả"}
        </div>
      ),
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
      console.log("Export categories");
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
              console.log("Export selected categories:", selectedRows);
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
      placeholder: "Tìm kiếm theo tên danh mục hoặc mô tả...",
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
        title="Quản lý Danh mục"
        description={`Hiển thị ${filteredCategories.length} trong tổng số ${categories.length} danh mục`}
        actions={actions}
        filters={filters}
      />

      <Table
        data={filteredCategories}
        columns={columns}
        loading={loading}
        selectable
        sortable
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        sort={sort}
        onSortChange={setSort}
        onRowClick={(category) => {
          openViewDialog(category);
        }}
        getRowId={(category) => category.id}
        size="md"
        variant="striped"
        stickyHeader
        maxHeight="600px"
        emptyMessage="Không có danh mục nào được tìm thấy"
      />

      {/* Selection Summary */}
      {selectedRows.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-4">
            <div className="text-sm text-blue-700">
              Đã chọn <span className="font-semibold">{selectedRows.length}</span> danh mục
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
export default function CategoriesPage() {
  return (
    <CategoryDialogProvider>
      <CategoriesPageContent />
      <CategoryDialog />
    </CategoryDialogProvider>
  );
}
