"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OrderStatus } from "@prisma/client";
import {
    searchOrders,
    exportOrdersToCSV
} from "@/actions/order";

interface ExportOptions {
    startDate: string;
    endDate: string;
    status: OrderStatus | "ALL";
    format: "csv" | "excel";
    includeUserDetails: boolean;
    includeOrderItems: boolean;
}

export default function ExportOrdersPage() {
    const router = useRouter();
    const [options, setOptions] = useState<ExportOptions>({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        status: "ALL",
        format: "csv",
        includeUserDetails: true,
        includeOrderItems: true
    });

    const [isExporting, setIsExporting] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);
    const [previewData, setPreviewData] = useState<any[] | null>(null);
    const [totalOrders, setTotalOrders] = useState(0);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setOptions({ ...options, [name]: checked });
        } else {
            setOptions({ ...options, [name]: value });
        }
    };

    const handlePreview = async () => {
        setExportError(null);

        try {
            const result = await searchOrders({
                startDate: options.startDate ? new Date(options.startDate) : undefined,
                endDate: options.endDate ? new Date(options.endDate) : undefined,
                status: options.status !== "ALL" ? options.status : undefined,
                page: 1,
                limit: 5 // Just show a small preview
            });

            if (result.success && result.orders) {
                setPreviewData(result.orders);
                setTotalOrders(result.pagination?.totalItems || result.orders.length);
            } else {
                setPreviewData([]);
                setTotalOrders(0);
                setExportError(result.error || "No orders found matching the criteria");
            }
        } catch (error) {
            console.error("Failed to preview orders:", error);
            setExportError("Failed to load preview data");
            setPreviewData([]);
            setTotalOrders(0);
        }
    };

    const handleExport = async () => {
        setIsExporting(true);
        setExportError(null);

        try {
            // Get all order IDs that match the criteria
            const allOrderIds: number[] = [];
            let page = 1;
            let hasMore = true;

            while (hasMore) {
                const result = await searchOrders({
                    startDate: options.startDate ? new Date(options.startDate) : undefined,
                    endDate: options.endDate ? new Date(options.endDate) : undefined,
                    status: options.status !== "ALL" ? options.status : undefined,
                    page,
                    limit: 50
                });

                if (result.success && result.orders && result.orders.length > 0) {
                    allOrderIds.push(...result.orders.map(order => order.id));

                    // Check if we've got all the orders
                    if (result.orders.length < 50) {
                        hasMore = false;
                    } else {
                        page++;
                    }
                } else {
                    hasMore = false;
                }
            }

            if (allOrderIds.length === 0) {
                setExportError("No orders found matching the criteria");
                return;
            }

            // Export the orders
            const exportResult = await exportOrdersToCSV({
                orderIds: allOrderIds,
                options: {
                    format: options.format,
                    includeUserDetails: options.includeUserDetails,
                    includeOrderItems: options.includeOrderItems
                }
            });

            if (exportResult.success && exportResult.downloadUrl) {
                // Create a download link and click it
                const link = document.createElement("a");
                link.href = exportResult.downloadUrl;
                link.download = `orders-export-${new Date().toISOString().split('T')[0]}.${options.format}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                setExportError(exportResult.error || "Failed to generate export file");
            }
        } catch (error) {
            console.error("Failed to export orders:", error);
            setExportError("An unexpected error occurred while exporting");
        } finally {
            setIsExporting(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <button
                    onClick={() => router.push("/admin/orders")}
                    className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to Orders
                </button>
                <h1 className="text-3xl font-bold">Export Orders</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Export Options</h2>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={options.startDate}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={options.endDate}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Order Status
                                </label>
                                <select
                                    name="status"
                                    value={options.status}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                >
                                    <option value="ALL">All Statuses</option>
                                    {Object.values(OrderStatus).map(status => (
                                        <option key={status} value={status}>
                                            {status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Export Format
                                </label>
                                <div className="mt-2 space-x-4">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            name="format"
                                            value="csv"
                                            checked={options.format === "csv"}
                                            onChange={handleChange}
                                            className="text-blue-600"
                                        />
                                        <span className="ml-2">CSV</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            name="format"
                                            value="excel"
                                            checked={options.format === "excel"}
                                            onChange={handleChange}
                                            className="text-blue-600"
                                        />
                                        <span className="ml-2">Excel</span>
                                    </label>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Include Data
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="includeUserDetails"
                                            checked={options.includeUserDetails}
                                            onChange={handleChange}
                                            className="rounded text-blue-600"
                                        />
                                        <span className="ml-2">Customer Details</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="includeOrderItems"
                                            checked={options.includeOrderItems}
                                            onChange={handleChange}
                                            className="rounded text-blue-600"
                                        />
                                        <span className="ml-2">Order Items</span>
                                    </label>
                                </div>
                            </div>

                            <div className="mt-6 flex space-x-3">
                                <button
                                    type="button"
                                    onClick={handlePreview}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                >
                                    Preview
                                </button>
                                <button
                                    type="button"
                                    onClick={handleExport}
                                    disabled={isExporting || (previewData && previewData.length === 0)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {isExporting ? "Exporting..." : "Export Orders"}
                                </button>
                            </div>

                            {exportError && (
                                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
                                    {exportError}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2">
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Preview</h2>

                            {previewData === null ? (
                                <div className="text-center py-8 text-gray-500">
                                    Click &quot;Preview&quot; to see a sample of the orders that will be exported
                                </div>
                            ) : previewData.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No orders found matching your criteria
                                </div>
                            ) : (
                                <>
                                    <div className="mb-4 text-gray-600">
                                        Showing {previewData.length} of {totalOrders} orders matching your criteria
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead>
                                                <tr className="bg-gray-50">
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        ID
                                                    </th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Date
                                                    </th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Customer
                                                    </th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Items
                                                    </th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Total
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {previewData.map((order) => (
                                                    <tr key={order.id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                                                            #{order.id}
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                                                            {formatDate(order.createdAt)}
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                                                            {order.user?.fullname || "Guest"}
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                                                            {order.status}
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                                                            {order.orderItems.length}
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                                                            ${Number(order.total).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="bg-white shadow-md rounded-lg overflow-hidden mt-6">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Export Fields</h2>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="font-medium text-gray-700 mb-2">Order Information</h3>
                                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                                        <li>Order ID</li>
                                        <li>Date Created</li>
                                        <li>Date Updated</li>
                                        <li>Order Status</li>
                                        <li>Payment Method</li>
                                        <li>Payment ID</li>
                                        <li>Order Total</li>
                                        <li>Notes</li>
                                    </ul>
                                </div>

                                <div>
                                    {options.includeUserDetails && (
                                        <>
                                            <h3 className="font-medium text-gray-700 mb-2">Customer Information</h3>
                                            <ul className="list-disc list-inside text-gray-600 space-y-1">
                                                <li>Customer ID</li>
                                                <li>Full Name</li>
                                                <li>Email</li>
                                                <li>Phone</li>
                                                <li>Shipping Address</li>
                                            </ul>
                                        </>
                                    )}

                                    {options.includeOrderItems && (
                                        <div className="mt-4">
                                            <h3 className="font-medium text-gray-700 mb-2">Order Items</h3>
                                            <ul className="list-disc list-inside text-gray-600 space-y-1">
                                                <li>Product Title</li>
                                                <li>Property Name</li>
                                                <li>Quantity</li>
                                                <li>Price</li>
                                                <li>Subtotal</li>
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
