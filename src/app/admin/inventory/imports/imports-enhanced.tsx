"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Plus, FileText, X, Check, Clock, AlertCircle, CalendarIcon, Download } from "lucide-react";
import { getAllImports } from "@/actions/inventory/import";
import { ImportSummary, ImportStatus, ImportPaymentStatus } from "@/types/inventory";
import Button from "@/components/UI/button";
import Input from "@/components/UI/input";
import Link from "next/link";
import BulkActionsBar from "@/components/admin/inventory/BulkActionsBar";

export default function InventoryImportsPage() {
  const [imports, setImports] = useState<ImportSummary[]>([]);
  const [filteredImports, setFilteredImports] = useState<ImportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ImportStatus | "ALL">("ALL");
  const [paymentFilter, setPaymentFilter] = useState<ImportPaymentStatus | "ALL">("ALL");
  const [dateRange, setDateRange] = useState<{ startDate?: Date; endDate?: Date }>({});
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);

  // Fetch imports data
  useEffect(() => {
    const fetchImports = async () => {
      try {
        setLoading(true);
        const data = await getAllImports();
        setImports(data);
        setFilteredImports(data);
      } catch (err) {
        setError("Failed to fetch import data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchImports();
  }, []);

  // Handle search and filtering
  useEffect(() => {
    let filtered = imports;

    // Apply search filter
    if (searchTerm.trim() !== "") {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (imp) =>
          imp.reference?.toLowerCase().includes(searchLower) ||
          false ||
          imp.supplierName.toLowerCase().includes(searchLower) ||
          imp.userName.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((imp) => imp.importStatus === statusFilter);
    }

    // Apply payment filter
    if (paymentFilter !== "ALL") {
      filtered = filtered.filter((imp) => imp.paymentStatus === paymentFilter);
    }

    // Apply date range filter
    if (dateRange.startDate && dateRange.endDate) {
      filtered = filtered.filter((imp) => {
        const importDate = new Date(imp.createdAt);
        return importDate >= dateRange.startDate! && importDate <= dateRange.endDate!;
      });
    }

    setFilteredImports(filtered);

    // Update select all state when filtered items change
    if (selectAll) {
      setSelectedIds(filtered.map((imp) => imp.id));
    }
  }, [searchTerm, statusFilter, paymentFilter, dateRange, imports, selectAll]);

  // Get status badge color
  const getStatusColor = (status: ImportStatus) => {
    switch (status) {
      case "DRAFT":
        return "bg-gray-200 text-gray-800";
      case "PENDING":
        return "bg-blue-200 text-blue-800";
      case "PROCESSING":
        return "bg-yellow-200 text-yellow-800";
      case "COMPLETED":
        return "bg-green-200 text-green-800";
      case "CANCELLED":
        return "bg-red-200 text-red-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  // Get payment status badge color
  const getPaymentColor = (status: ImportPaymentStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PARTIALLY_PAID":
        return "bg-blue-100 text-blue-800";
      case "PAID":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Handle bulk action completion
  const handleBulkActionComplete = () => {
    setSelectedIds([]);
    setSelectAll(false);
    // Refresh imports data
    const fetchImports = async () => {
      try {
        const data = await getAllImports();
        setImports(data);
        setFilteredImports(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchImports();
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setPaymentFilter("ALL");
    setDateRange({});
    setShowDateFilter(false);
  };

  // Export to CSV
  const exportToCSV = () => {
    // Create CSV content
    let csvContent = "Id,Reference,Supplier,Created By,Date,Items,Total,Status,Payment Status\n";

    const importsToExport =
      selectedIds.length > 0 ? filteredImports.filter((imp) => selectedIds.includes(imp.id)) : filteredImports;

    importsToExport.forEach((imp) => {
      csvContent +=
        [
          imp.id,
          imp.reference || `Import #${imp.id}`,
          imp.supplierName,
          imp.userName,
          formatDate(imp.createdAt),
          imp.itemCount,
          imp.totalAmount,
          imp.importStatus,
          imp.paymentStatus,
        ].join(",") + "\n";
    });

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `inventory-imports-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Status filter options
  const statusOptions = [
    { value: "ALL", label: "All Statuses" },
    { value: "DRAFT", label: "Draft" },
    { value: "PENDING", label: "Pending" },
    { value: "PROCESSING", label: "Processing" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  // Payment status filter options
  const paymentOptions = [
    { value: "ALL", label: "All Payment Statuses" },
    { value: "PENDING", label: "Pending" },
    { value: "PARTIALLY_PAID", label: "Partially Paid" },
    { value: "PAID", label: "Paid" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventory Imports</h1>
        <div className="flex gap-2">
          <Button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
            disabled={loading || filteredImports.length === 0}
          >
            <Download size={16} />
            Export CSV
          </Button>
          <Link href="/admin/inventory/imports/new">
            <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
              <Plus size={16} />
              New Import
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and filter section */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Search by reference, supplier or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ImportStatus | "ALL")}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as ImportPaymentStatus | "ALL")}
            >
              {paymentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Button
              onClick={() => setShowDateFilter(!showDateFilter)}
              className={`flex items-center gap-1 px-3 py-2 text-sm ${
                showDateFilter
                  ? "bg-blue-100 text-blue-800 border-blue-300"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
              }`}
            >
              <CalendarIcon size={16} />
              Date Filter
            </Button>
          </div>
        </div>

        {/* Date filter */}
        {showDateFilter && (
          <div className="flex gap-4 mt-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
                value={dateRange.startDate?.toISOString().split("T")[0] || ""}
                onChange={(e) =>
                  setDateRange((prev) => ({
                    ...prev,
                    startDate: e.target.value ? new Date(e.target.value) : undefined,
                  }))
                }
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
                value={dateRange.endDate?.toISOString().split("T")[0] || ""}
                onChange={(e) =>
                  setDateRange((prev) => ({
                    ...prev,
                    endDate: e.target.value ? new Date(e.target.value) : undefined,
                  }))
                }
              />
            </div>
            <Button onClick={clearAllFilters} className="bg-gray-200 hover:bg-gray-300 text-gray-800">
              <X size={16} className="mr-1" />
              Clear All Filters
            </Button>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
          <AlertCircle size={20} className="mr-2" />
          {error}
        </div>
      )}

      {/* Filter summary */}
      {(searchTerm ||
        statusFilter !== "ALL" ||
        paymentFilter !== "ALL" ||
        (dateRange.startDate && dateRange.endDate)) && (
        <div className="bg-blue-50 border border-blue-100 text-blue-700 px-4 py-3 rounded mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <Filter size={18} className="mr-2" />
            <span>
              Filtered by:
              {searchTerm && <span className="ml-1 font-medium">Search</span>}
              {statusFilter !== "ALL" && <span className="ml-1 font-medium">Status</span>}
              {paymentFilter !== "ALL" && <span className="ml-1 font-medium">Payment</span>}
              {dateRange.startDate && dateRange.endDate && <span className="ml-1 font-medium">Date Range</span>}
              <span className="ml-2">({filteredImports.length} results)</span>
            </span>
          </div>
          <Button onClick={clearAllFilters} className="bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs">
            Clear Filters
          </Button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 mb-2"></div>
          <p>Loading imports...</p>
        </div>
      ) : (
        <>
          {/* Empty state */}
          {filteredImports.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No imports found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ||
                statusFilter !== "ALL" ||
                paymentFilter !== "ALL" ||
                (dateRange.startDate && dateRange.endDate)
                  ? "Try adjusting your search or filters"
                  : "Create your first inventory import to get started"}
              </p>
              {(searchTerm ||
                statusFilter !== "ALL" ||
                paymentFilter !== "ALL" ||
                (dateRange.startDate && dateRange.endDate)) && (
                <Button onClick={clearAllFilters} className="bg-gray-200 hover:bg-gray-300 text-gray-800">
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            /* Imports table */
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={(e) => {
                              setSelectAll(e.target.checked);
                              setSelectedIds(e.target.checked ? filteredImports.map((imp) => imp.id) : []);
                            }}
                            className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                          />
                          <span className="ml-2">Reference</span>
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Supplier
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredImports.map((imp) => (
                      <tr key={imp.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(imp.id)}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setSelectedIds((prev) =>
                                  checked ? [...prev, imp.id] : prev.filter((id) => id !== imp.id)
                                );
                                if (!checked && selectAll) {
                                  setSelectAll(false);
                                }
                              }}
                              className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                            />
                            <span className="ml-2">{imp.reference || `Import #${imp.id}`}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{imp.supplierName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{imp.userName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(imp.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{imp.itemCount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(imp.totalAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                              imp.importStatus
                            )}`}
                          >
                            {imp.importStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentColor(
                              imp.paymentStatus
                            )}`}
                          >
                            {imp.paymentStatus.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex gap-2">
                            <Link href={`/admin/inventory/imports/${imp.id}`}>
                              <Button className="bg-blue-600 hover:bg-blue-700 px-2 py-1 text-xs">View</Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Bulk actions bar */}
      {selectedIds.length > 0 && (
        <BulkActionsBar
          selectedIds={selectedIds}
          onActionComplete={handleBulkActionComplete}
          onClearSelection={() => setSelectedIds([])}
        />
      )}
    </div>
  );
}
