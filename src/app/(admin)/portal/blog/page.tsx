"use client";

import { useEffect, useState } from "react";
import { findAll } from "@/services/blog";
import { Blog, BlogStatus } from "@/services/type";
import { TableToolbar, createCommonActions, Table, Button } from "@/components/ui";
import type { TableToolbarFilter, TableColumn, TableSort } from "@/components/ui";
import { BlogDialogProvider, useBlogDialog, BlogDialog } from "@/components/admin/blog";
import { toast } from "sonner";

function BlogsPageContent() {
  const { openAddDialog, openEditDialog, openViewDialog } = useBlogDialog();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
  const [selectedRows, setSelectedRows] = useState<(string | number)[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState<TableSort>({ key: "", direction: null });

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await findAll();
      if (response.status === 200) {
        const data = response.data.data as Blog[];
        setBlogs(data);
        setFilteredBlogs(data);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast.error("Khong the tai danh sach bai viet");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateInput: string | Date) => {
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    let filtered = [...blogs];

    if (searchTerm) {
      const keyword = searchTerm.toLowerCase();
      filtered = filtered.filter((blog) => {
        const tagsText = (blog.tags || []).join(" ").toLowerCase();
        return (
          (blog.title || "").toLowerCase().includes(keyword) ||
          (blog.excerpt || "").toLowerCase().includes(keyword) ||
          (blog.slug || "").toLowerCase().includes(keyword) ||
          tagsText.includes(keyword)
        );
      });
    }

    if (dateFilter) {
      filtered = filtered.filter((blog) => {
        const createdAt = new Date(blog.createdAt).toISOString().split("T")[0];
        return createdAt === dateFilter;
      });
    }

    if (statusFilter) {
      filtered = filtered.filter((blog) => blog.status === statusFilter);
    }

    if (sort.key && sort.direction) {
      filtered.sort((a, b) => {
        const aValue = a[sort.key as keyof Blog];
        const bValue = b[sort.key as keyof Blog];

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

    setFilteredBlogs(filtered);
  }, [blogs, searchTerm, dateFilter, statusFilter, sort]);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const columns: TableColumn<Blog>[] = [
    {
      key: "id",
      header: "ID",
      width: "80px",
      sortable: true,
      render: (value) => `#${value}`,
    },
    {
      key: "title",
      header: "Bai viet",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3 max-w-[420px]">
          {row.thumbnail && (
            <img
              src={row.thumbnail}
              alt={String(value)}
              className="w-12 h-12 rounded-lg object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
          <div className="min-w-0">
            <div className="font-medium text-gray-900 truncate">{String(value)}</div>
            <div className="text-sm text-gray-500 truncate">{row.excerpt || "Khong co tom tat"}</div>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Trang thai",
      sortable: true,
      render: (value: BlogStatus) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
            value === BlogStatus.PUBLISHED ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-700"
          }`}
        >
          {value === BlogStatus.PUBLISHED ? "Da xuat ban" : "Ban nhap"}
        </span>
      ),
    },
    {
      key: "tags",
      header: "The",
      render: (value: string[]) => {
        const tags = value || [];
        if (tags.length === 0) {
          return <span className="text-sm text-gray-400">Khong co the</span>;
        }

        return (
          <div className="flex flex-wrap gap-1 max-w-[220px]">
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-xs">
                #{tag}
              </span>
            ))}
            {tags.length > 3 && <span className="text-xs text-gray-500">+{tags.length - 3}</span>}
          </div>
        );
      },
    },
    {
      key: "createdAt",
      header: "Ngay tao",
      sortable: true,
      render: (value) => <div className="text-sm text-gray-700">{formatDate(String(value))}</div>,
    },
    {
      key: "updatedAt",
      header: "Cap nhat",
      sortable: true,
      render: (value) => <div className="text-sm text-gray-500">{formatDate(String(value))}</div>,
    },
    {
      key: "actions",
      header: "Thao tac",
      align: "center",
      render: (_, row) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              openViewDialog(row);
            }}
          >
            Chi tiet
          </Button>
          <Button
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              openEditDialog(row);
            }}
          >
            Sua
          </Button>
        </div>
      ),
    },
  ];

  const actions = [
    createCommonActions.add(() => {
      openAddDialog();
    }),
    createCommonActions.export(() => {
      toast.error("Chuc nang xuat du lieu se duoc phat trien trong tuong lai");
    }),
    ...(selectedRows.length > 0
      ? [
          {
            label: `Xoa (${selectedRows.length})`,
            onClick: () => {
              toast.error("Chuc nang xoa hang loat se duoc phat trien trong tuong lai");
            },
            variant: "destructive" as const,
          },
        ]
      : []),
  ];

  const filters: TableToolbarFilter[] = [
    {
      type: "search",
      placeholder: "Tim theo tieu de, slug, tom tat hoac the...",
      value: searchTerm,
      onChange: setSearchTerm,
      label: "Tim kiem",
    },
    {
      type: "select",
      placeholder: "Tat ca trang thai",
      value: statusFilter,
      onChange: setStatusFilter,
      label: "Trang thai",
      options: [
        { label: "Tat ca", value: "" },
        { label: "Ban nhap", value: BlogStatus.DRAFT },
        { label: "Da xuat ban", value: BlogStatus.PUBLISHED },
      ],
    },
    {
      type: "date",
      placeholder: "Chon ngay tao...",
      value: dateFilter,
      onChange: setDateFilter,
      label: "Ngay tao",
    },
  ];

  return (
    <div className="space-y-4">
      <TableToolbar
        title="Quan ly Bai viet"
        description={`Hien thi ${filteredBlogs.length} trong tong so ${blogs.length} bai viet`}
        actions={actions}
        filters={filters}
      />

      <Table
        data={filteredBlogs}
        columns={columns}
        loading={loading}
        selectable
        sortable
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        sort={sort}
        onSortChange={setSort}
        onRowClick={(blog) => {
          openViewDialog(blog);
        }}
        getRowId={(blog) => blog.id}
        size="md"
        variant="striped"
        stickyHeader
        emptyMessage="Khong co bai viet nao duoc tim thay"
      />

      {selectedRows.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-700">
            Da chon <span className="font-semibold">{selectedRows.length}</span> bai viet
          </div>
          <Button size="sm" variant="ghost" onClick={() => setSelectedRows([])}>
            Bo chon tat ca
          </Button>
        </div>
      )}
    </div>
  );
}

export default function BlogsPage() {
  return (
    <BlogDialogProvider>
      <BlogsPageContent />
      <BlogDialog />
    </BlogDialogProvider>
  );
}