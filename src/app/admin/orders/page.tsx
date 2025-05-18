"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OrderStatus } from "@prisma/client";
import {
    getAllOrders,
    updateOrderStatus,
    deleteOrder,
    formatOrderStatus as formatServerOrderStatus,
    getOrderStatusColor,
    searchOrders,
    bulkUpdateOrderStatus
} from "@/actions/order";

// Client-side version of formatOrderStatus to avoid server action during render
const formatOrderStatus = (status: OrderStatus): string => {
    switch (status) {
        case "PENDING":
            return "Pending";
        case "PROCESSING":
            return "Processing";
        case "DELIVERED":
            return "Delivered";
        case "CANCELLED":
            return "Cancelled";
        case "REFUNDED":
            return "Refunded";
        default:
            return status;
    }
};

interface Order {
    id: number;
    status: OrderStatus;
    total: number;
    createdAt: Date;
    updatedAt: Date;
    user: {
        fullname: string;
        email: string;
    } | null;
    orderItems: {
        id: number;
        quantity: number;
        property: {
            product: {
                title: string;
                image: string;
            };
        };
    }[];
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusUpdating, setStatusUpdating] = useState<number | null>(null);
    const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
    const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
    const router = useRouter();

    useEffect(() => {
        fetchOrders();
    }, [currentPage, statusFilter]);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            let result;

            if (statusFilter === "ALL") {
                result = await getAllOrders(currentPage);
            } else {
                result = await searchOrders({
                    page: currentPage,
                    status: statusFilter
                });
            }

            if (result.success && result.orders) {
                setOrders(result.orders as Order[]);
                if (result.pagination) {
                    setTotalPages(result.pagination.totalPages);
                }
            } else {
                console.error("Error fetching orders:", result.error);
                setOrders([]);
            }
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            setOrders([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
        setStatusUpdating(orderId);
        try {
            const result = await updateOrderStatus(orderId, newStatus);
            if (result.success) {
                // Update local state
                setOrders(orders.map((order) =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                ));
            } else {
                console.error("Error updating status:", result.error);
            }
        } catch (error) {
            console.error("Failed to update order status:", error);
        } finally {
            setStatusUpdating(null);
        }
    };

    const handleDeleteOrder = async (orderId: number) => {
        if (!window.confirm("Are you sure you want to delete this order?")) return;

        try {
            const result = await deleteOrder(orderId);
            if (result.success) {
                // Remove from local state
                setOrders(orders.filter(order => order.id !== orderId));
            } else {
                console.error("Error deleting order:", result.error);
            }
        } catch (error) {
            console.error("Failed to delete order:", error);
        }
    };

    const handleSelectOrder = (orderId: number) => {
        if (selectedOrders.includes(orderId)) {
            setSelectedOrders(selectedOrders.filter(id => id !== orderId));
        } else {
            setSelectedOrders([...selectedOrders, orderId]);
        }
    };

    const handleSelectAllOrders = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelectedOrders(orders.map(order => order.id));
        } else {
            setSelectedOrders([]);
        }
    };

    const handleBulkStatusUpdate = async (status: OrderStatus) => {
        if (selectedOrders.length === 0) return;

        try {
            const result = await bulkUpdateOrderStatus({
                orderIds: selectedOrders,
                status
            });

            if (result.success) {
                // Update local state
                setOrders(orders.map((order) =>
                    selectedOrders.includes(order.id) ? { ...order, status } : order
                ));

                // Clear selection
                setSelectedOrders([]);
            } else {
                console.error("Error updating status in bulk:", result.error);
            }
        } catch (error) {
            console.error("Failed to update orders in bulk:", error);
        }
    };

    const formatDate = (dateString: Date) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="p-8">      <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Order Management</h1>

            <div className="flex space-x-4">
                <button
                    onClick={() => router.push("/admin/orders/new")}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                    Create Order
                </button>

                <button
                    onClick={() => router.push("/admin/orders/export")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Export
                </button>

                {selectedOrders.length > 0 && (
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{selectedOrders.length} selected</span>
                        <select
                            className="border border-gray-300 rounded-md text-sm px-2 py-1"
                            onChange={(e) => handleBulkStatusUpdate(e.target.value as OrderStatus)}
                            defaultValue=""
                        >
                            <option value="" disabled>Bulk Actions</option>
                            {Object.values(OrderStatus).map((status) => (
                                <option key={status} value={status}>
                                    Mark as {formatOrderStatus(status)}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <select
                    className="border border-gray-300 rounded-md text-sm px-4 py-2"
                    value={statusFilter}
                    onChange={(e) => {
                        setStatusFilter(e.target.value as OrderStatus | "ALL");
                        setCurrentPage(1);
                    }}
                >
                    <option value="ALL">All Orders</option>
                    {Object.values(OrderStatus).map((status) => (
                        <option key={status} value={status}>
                            {formatOrderStatus(status)} Orders
                        </option>
                    ))}
                </select>
            </div>
        </div>

            {isLoading ? (
                <div className="text-center p-8">Loading orders...</div>
            ) : (
                <>
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 w-10">
                                        <input
                                            type="checkbox"
                                            onChange={handleSelectAllOrders}
                                            checked={selectedOrders.length === orders.length && orders.length > 0}
                                            className="rounded text-blue-600"
                                        />
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Order ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer
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
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                                            No orders found
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedOrders.includes(order.id)}
                                                    onChange={() => handleSelectOrder(order.id)}
                                                    className="rounded text-blue-600"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                #{order.id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {order.user?.fullname || "Guest"}
                                                <br />
                                                <span className="text-xs">{order.user?.email}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(order.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {order.orderItems.length}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                ${Number(order.total).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getOrderStatusColor(order.status)}`}>
                                                    {formatOrderStatus(order.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        View
                                                    </button>
                                                    <select
                                                        className="text-xs border border-gray-300 rounded"
                                                        value={order.status}
                                                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                                        disabled={statusUpdating === order.id}
                                                    >
                                                        {Object.values(OrderStatus).map((status) => (
                                                            <option key={status} value={status}>
                                                                {formatOrderStatus(status)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        onClick={() => handleDeleteOrder(order.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center mt-6">
                        <div className="text-sm text-gray-500">
                            Page {currentPage} of {totalPages}
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage >= totalPages}
                                className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}