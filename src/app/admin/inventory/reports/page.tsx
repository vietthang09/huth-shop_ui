"use client";

import { useState, useEffect } from "react";
import { Calendar, Filter, Download, PieChart, BarChart, AlertCircle } from "lucide-react";
import { ImportDashboardSummary, ImportFilterParams, ImportStatus, ImportPaymentStatus } from "@/types/inventory";
import Button from "@/components/UI/button";
import Link from "next/link";

// Function to fetch report data
async function getImportReports(filters: ImportFilterParams) {
  try {
    // Create query string from filters
    const queryParams = new URLSearchParams();

    if (filters.importStatus) queryParams.append("importStatus", filters.importStatus);
    if (filters.paymentStatus) queryParams.append("paymentStatus", filters.paymentStatus);
    if (filters.startDate) queryParams.append("startDate", filters.startDate.toISOString());
    if (filters.endDate) queryParams.append("endDate", filters.endDate.toISOString());
    if (filters.supplierId) queryParams.append("supplierId", filters.supplierId.toString());
    if (filters.query) queryParams.append("query", filters.query);

    // Make the API request
    const response = await fetch(`/api/admin/import-reports?${queryParams.toString()}`);
    if (!response.ok) throw new Error("Failed to fetch report data");

    return await response.json();
  } catch (error) {
    console.error("Error fetching import reports:", error);
    throw error;
  }
}

export default function ImportReportsPage() {
  const [dashboard, setDashboard] = useState<ImportDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [filters, setFilters] = useState<ImportFilterParams>({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)), // Default to last month
    endDate: new Date(),
  });

  // Fetch report data
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const data = await getImportReports(filters);
        setDashboard(data.dashboard);
      } catch (err) {
        setError("Failed to load report data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [filters]);

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

  // Update filter
  const updateFilter = (key: keyof ImportFilterParams, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Generate CSV export
  const exportCSV = () => {
    // Implementation would go here
    alert("Export functionality will be implemented soon");
  };

  // Calculate percentage
  const calculatePercentage = (value: number, total: number) => {
    if (total === 0) return "0%";
    return `${Math.round((value / total) * 100)}%`;
  };

  // Get status color
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

  // Get payment status color
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventory Import Reports</h1>
        <div className="flex items-center gap-2">
          <Link href="/admin/inventory/imports">
            <Button className="bg-blue-600 hover:bg-blue-700">View All Imports</Button>
          </Link>
          <Button onClick={exportCSV} className="bg-green-600 hover:bg-green-700 flex items-center gap-1">
            <Download size={16} />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filter section */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
                value={filters.startDate?.toISOString().split("T")[0]}
                onChange={(e) => updateFilter("startDate", new Date(e.target.value))}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
                value={filters.endDate?.toISOString().split("T")[0]}
                onChange={(e) => updateFilter("endDate", new Date(e.target.value))}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="border border-gray-300 rounded-md px-3 py-2"
                value={filters.importStatus || ""}
                onChange={(e) => updateFilter("importStatus", e.target.value || undefined)}
              >
                <option value="">All Statuses</option>
                <option value={ImportStatus.DRAFT}>Draft</option>
                <option value={ImportStatus.PENDING}>Pending</option>
                <option value={ImportStatus.PROCESSING}>Processing</option>
                <option value={ImportStatus.COMPLETED}>Completed</option>
                <option value={ImportStatus.CANCELLED}>Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment</label>
              <select
                className="border border-gray-300 rounded-md px-3 py-2"
                value={filters.paymentStatus || ""}
                onChange={(e) => updateFilter("paymentStatus", e.target.value || undefined)}
              >
                <option value="">All Payment Statuses</option>
                <option value={ImportPaymentStatus.PENDING}>Pending</option>
                <option value={ImportPaymentStatus.PARTIALLY_PAID}>Partially Paid</option>
                <option value={ImportPaymentStatus.PAID}>Paid</option>
                <option value={ImportPaymentStatus.CANCELLED}>Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
          <AlertCircle size={20} className="mr-2" />
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 mb-2"></div>
          <p>Loading report data...</p>
        </div>
      ) : dashboard ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Summary Cards */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <PieChart size={20} className="mr-2 text-blue-600" />
              Import Status Overview
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold">{dashboard.statusCounts.draft}</div>
                <div className="text-sm text-gray-500">Drafts</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold">{dashboard.statusCounts.pending}</div>
                <div className="text-sm text-gray-500">Pending</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold">{dashboard.statusCounts.processing}</div>
                <div className="text-sm text-gray-500">Processing</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold">{dashboard.statusCounts.completed}</div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold">{dashboard.statusCounts.cancelled}</div>
                <div className="text-sm text-gray-500">Cancelled</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold">{formatCurrency(dashboard.totalValue)}</div>
                <div className="text-sm text-gray-500">Total Value</div>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <BarChart size={20} className="mr-2 text-green-600" />
              Payment Status
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Pending</span>
                  <span className="text-sm text-gray-500">
                    {dashboard.paymentCounts.pending}(
                    {calculatePercentage(
                      dashboard.paymentCounts.pending,
                      dashboard.paymentCounts.pending +
                        dashboard.paymentCounts.partiallyPaid +
                        dashboard.paymentCounts.paid +
                        dashboard.paymentCounts.cancelled
                    )}
                    )
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-yellow-400 h-2.5 rounded-full"
                    style={{
                      width: calculatePercentage(
                        dashboard.paymentCounts.pending,
                        dashboard.paymentCounts.pending +
                          dashboard.paymentCounts.partiallyPaid +
                          dashboard.paymentCounts.paid +
                          dashboard.paymentCounts.cancelled
                      ),
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Partially Paid</span>
                  <span className="text-sm text-gray-500">
                    {dashboard.paymentCounts.partiallyPaid}(
                    {calculatePercentage(
                      dashboard.paymentCounts.partiallyPaid,
                      dashboard.paymentCounts.pending +
                        dashboard.paymentCounts.partiallyPaid +
                        dashboard.paymentCounts.paid +
                        dashboard.paymentCounts.cancelled
                    )}
                    )
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-400 h-2.5 rounded-full"
                    style={{
                      width: calculatePercentage(
                        dashboard.paymentCounts.partiallyPaid,
                        dashboard.paymentCounts.pending +
                          dashboard.paymentCounts.partiallyPaid +
                          dashboard.paymentCounts.paid +
                          dashboard.paymentCounts.cancelled
                      ),
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Paid</span>
                  <span className="text-sm text-gray-500">
                    {dashboard.paymentCounts.paid}(
                    {calculatePercentage(
                      dashboard.paymentCounts.paid,
                      dashboard.paymentCounts.pending +
                        dashboard.paymentCounts.partiallyPaid +
                        dashboard.paymentCounts.paid +
                        dashboard.paymentCounts.cancelled
                    )}
                    )
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green-400 h-2.5 rounded-full"
                    style={{
                      width: calculatePercentage(
                        dashboard.paymentCounts.paid,
                        dashboard.paymentCounts.pending +
                          dashboard.paymentCounts.partiallyPaid +
                          dashboard.paymentCounts.paid +
                          dashboard.paymentCounts.cancelled
                      ),
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Cancelled</span>
                  <span className="text-sm text-gray-500">
                    {dashboard.paymentCounts.cancelled}(
                    {calculatePercentage(
                      dashboard.paymentCounts.cancelled,
                      dashboard.paymentCounts.pending +
                        dashboard.paymentCounts.partiallyPaid +
                        dashboard.paymentCounts.paid +
                        dashboard.paymentCounts.cancelled
                    )}
                    )
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-red-400 h-2.5 rounded-full"
                    style={{
                      width: calculatePercentage(
                        dashboard.paymentCounts.cancelled,
                        dashboard.paymentCounts.pending +
                          dashboard.paymentCounts.partiallyPaid +
                          dashboard.paymentCounts.paid +
                          dashboard.paymentCounts.cancelled
                      ),
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Imports */}
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar size={20} className="mr-2 text-purple-600" />
              Recent Imports
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Supplier
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dashboard.recentImports.map((imp) => (
                    <tr key={imp.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {imp.reference || `Import #${imp.id}`}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{imp.supplierName}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatDate(imp.createdAt)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{imp.itemCount}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(imp.totalAmount)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            imp.importStatus
                          )}`}
                        >
                          {imp.importStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Link href={`/admin/inventory/imports/${imp.id}`}>
                          <Button className="bg-blue-600 hover:bg-blue-700 px-2 py-1 text-xs">View</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-1">No report data available</h3>
          <p className="text-gray-500">Try adjusting your filter criteria or check back later.</p>
        </div>
      )}
    </div>
  );
}
