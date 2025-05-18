"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { OrderStatus } from "@prisma/client";
import {
    getOrder,
    updateOrderStatus,
    processRefund,
    formatOrderStatus,
    getOrderStatusColor,
    formatCurrency,
    updateOrderItem,
    removeOrderItem,
} from "@/actions/order";

interface OrderItem {
    id: number;
    quantity: number;
    price: number;
    productTitle?: string;
    productImage?: string;
    productDescription?: string;
    attributes?: {
        name: string | null;
        value: string | null;
        unit: string | null;
    };
    property: {
        id: number;
        name: string;
        price: number;
        inventory: number;
        product: {
            id: number;
            title: string;
            slug: string;
            image: string;
            description?: string;
        };
        attributeSet?: {
            name: string | null;
            value: string | null;
            unit: string | null;
            propertiesHash: string | null;
        };
    };
}

interface Order {
    id: number;
    userId: number | null;
    status: OrderStatus;
    paymentMethod: string;
    paymentId: string | null;
    shippingAddress: string | null;
    notes: string | null;
    total: number;
    createdAt: Date;
    updatedAt: Date;
    user: {
        id?: number;
        fullname: string;
        email: string;
        phone?: string | null;
    } | null;
    orderItems: OrderItem[];
}

export default function OrderDetailPage({ params }: { params: { orderId: string } }) {

    const orderId = parseInt(params.orderId);
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [refundReason, setRefundReason] = useState("");
    const [isProcessingRefund, setIsProcessingRefund] = useState(false);
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [itemUpdating, setItemUpdating] = useState<number | null>(null);
    const router = useRouter(); useEffect(() => {
        if (isNaN(orderId)) {
            router.push("/admin/orders");
            return;
        }

        fetchOrderDetails();
    }, [orderId, router]); const fetchOrderDetails = async () => {
        setIsLoading(true);
        try {
            const result = await getOrder(orderId);
            console.log("Order details:", result);
            if (result.success && result.order) {
                // Map the API response to our Order interface
                const fetchedOrder = {
                    ...result.order,
                    // If these fields are missing, provide default values
                    paymentMethod: (result.order as any).paymentMethod || "Not specified",
                    paymentId: (result.order as any).paymentId || null,
                    shippingAddress: (result.order as any).shippingAddress || null,
                } as Order;

                setOrder(fetchedOrder);
            } else {
                console.error("Error fetching order:", result.error);
            }
        } catch (error) {
            console.error("Failed to fetch order details:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (order) {
            console.log("Order data structure:", {
                order,
                firstItem: order.orderItems[0],
                itemAttributes: order.orderItems.map(item =>
                    item.property.attributeSet ? {
                        name: item.property.attributeSet.name,
                        value: item.property.attributeSet.value,
                        unit: item.property.attributeSet.unit,
                    } : null
                )
            });
        }
    }, [order]);

    const handleStatusChange = async (newStatus: OrderStatus) => {
        if (!order) return;

        setStatusUpdating(true);
        try {
            const result = await updateOrderStatus(orderId, newStatus);
            if (result.success) {
                setOrder({ ...order, status: newStatus });
            } else {
                console.error("Error updating status:", result.error);
            }
        } catch (error) {
            console.error("Failed to update order status:", error);
        } finally {
            setStatusUpdating(false);
        }
    };

    const handleRefund = async () => {
        if (!order || !refundReason.trim()) return;

        setIsProcessingRefund(true);
        try {
            const result = await processRefund(orderId, refundReason);
            if (result.success) {
                setOrder({ ...order, status: OrderStatus.REFUNDED });
                setShowRefundModal(false);
                setRefundReason("");
            } else {
                console.error("Error processing refund:", result.error);
            }
        } catch (error) {
            console.error("Failed to process refund:", error);
        } finally {
            setIsProcessingRefund(false);
        }
    };

    const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
        if (!order || newQuantity < 1) return;

        setItemUpdating(itemId);
        try {
            const result = await updateOrderItem(itemId, { quantity: newQuantity });
            if (result.success) {
                // Refresh order to get updated totals
                fetchOrderDetails();
            } else {
                console.error("Error updating item quantity:", result.error);
            }
        } catch (error) {
            console.error("Failed to update item quantity:", error);
        } finally {
            setItemUpdating(null);
        }
    };

    const handleRemoveItem = async (itemId: number) => {
        if (!order || !window.confirm("Are you sure you want to remove this item?")) return;

        try {
            const result = await removeOrderItem(itemId);
            if (result.success) {
                // Refresh order to get updated items and totals
                fetchOrderDetails();
            } else {
                console.error("Error removing item:", result.error);
            }
        } catch (error) {
            console.error("Failed to remove item:", error);
        }
    };

    const formatDate = (dateString: Date) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
        }).format(date);
    };

    const getStatusOptions = () => {
        // Filter out inappropriate status transitions based on current status
        const allStatuses = Object.values(OrderStatus);

        if (order?.status === OrderStatus.REFUNDED || order?.status === OrderStatus.CANCELLED) {
            return [order.status]; // Cannot change status if refunded or cancelled
        }

        if (order?.status === OrderStatus.DELIVERED) {
            return [OrderStatus.DELIVERED, OrderStatus.REFUNDED];
        }

        return allStatuses;
    };

    // Get detailed formatted data from order items that includes product attributes
    const getProductDetails = (item: OrderItem) => {
        if (!item.property.attributeSet) return null;

        // Check if the formatted order data includes attributes from getOrder
        const attributes = 'attributes' in item ?
            (item as any).attributes :
            { name: null, value: null, unit: null };

        if (!attributes.name && !attributes.value) return null;

        return {
            name: attributes.name,
            value: attributes.value,
            unit: attributes.unit || "",
        };
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">Loading order details...</div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="text-xl mb-4">Order not found</div>
                <button
                    onClick={() => router.push("/admin/orders")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Return to Orders
                </button>
            </div>
        );
    }


    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <button
                        onClick={() => router.push("/admin/orders")}
                        className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Back to Orders
                    </button>
                    <h1 className="text-3xl font-bold">Order #{order.id}</h1>
                    <div className="text-sm text-gray-500 mt-1">
                        Placed on {formatDate(order.createdAt)}
                    </div>
                </div>

                <div className="flex space-x-3">                    {order.status === OrderStatus.PROCESSING && (
                    <button
                        onClick={() => setShowRefundModal(true)}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                    >
                        Process Refund
                    </button>
                )}

                    <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                        disabled={statusUpdating || order.status === OrderStatus.REFUNDED || order.status === OrderStatus.CANCELLED}
                        className="px-4 py-2 border border-gray-300 rounded-md bg-white"
                    >
                        {getStatusOptions().map((status) => (
                            <option key={status} value={status}>
                                {formatOrderStatus(status)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Order Summary */}
                <div className="md:col-span-2">
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
                            <div className="divide-y divide-gray-200">
                                {order.orderItems.map((item) => (
                                    <div key={item.id} className="py-4 flex items-center">
                                        <div className="flex-shrink-0 w-16 h-16 relative">
                                            {item.property.product.image && (
                                                <Image
                                                    src={item.property.product.image}
                                                    alt={item.property.product.title}
                                                    fill
                                                    className="object-cover rounded-md"
                                                />
                                            )}
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <h3 className="text-sm font-medium">
                                                {item.property.product.title}
                                            </h3>                                            {/* Show product details from the formatted order data */}
                                            {item.property.attributeSet && (
                                                <p className="text-sm text-gray-500">
                                                    Option: {item.property.attributeSet.name} {item.property.attributeSet.value} {item.property.attributeSet.unit}
                                                </p>
                                            )}
                                            <p className="text-sm font-medium mt-1">
                                                {formatCurrency(item.property.retailPrice || item.price)} × {item.quantity} = {formatCurrency((item.property.retailPrice || item.price) * item.quantity)}
                                            </p>
                                            {/* Show product description if available */}
                                            {item.property.product.description && (
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                    {item.property.product.description}
                                                </p>
                                            )}
                                            {getProductDetails(item) && (
                                                <p className="text-sm text-gray-500">
                                                    {getProductDetails(item)?.name}: {getProductDetails(item)?.value} {getProductDetails(item)?.unit}
                                                </p>
                                            )}
                                        </div>
                                        <div className="ml-4 flex items-center space-x-2">
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value))}
                                                disabled={itemUpdating === item.id || order.status === OrderStatus.REFUNDED || order.status === OrderStatus.CANCELLED}
                                                className="w-16 p-1 border border-gray-300 rounded-md text-center"
                                            />
                                            <button
                                                onClick={() => handleRemoveItem(item.id)}
                                                disabled={order.status === OrderStatus.REFUNDED || order.status === OrderStatus.CANCELLED}
                                                className="text-red-500 hover:text-red-700 disabled:opacity-50"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 border-t border-gray-200 pt-6">
                                <div className="flex justify-between mb-2">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(order.total)}</span>
                                </div>
                                <div className="flex justify-between font-semibold text-lg">
                                    <span>Total</span>
                                    <span>{formatCurrency(order.total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white shadow-md rounded-lg overflow-hidden mt-6">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Payment Method</p>
                                    <p className="font-medium">{order.paymentMethod || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Payment ID</p>
                                    <p className="font-medium">{order.paymentId || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>                                    <p className="font-medium">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getOrderStatusColor(order.status)}`}>
                                            {formatOrderStatus(order.status)}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Timeline */}
                    <div className="bg-white shadow-md rounded-lg overflow-hidden mt-6">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Order Timeline</h2>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${order.status === OrderStatus.PENDING ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                                        1
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">Order Placed</p>
                                        <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                                    </div>
                                    <div>
                                        {order.status === OrderStatus.PENDING && <span className="inline-block w-3 h-3 bg-blue-500 rounded-full"></span>}
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${order.status === OrderStatus.PROCESSING ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                                        2
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">Processing</p>
                                        <p className="text-sm text-gray-500">
                                            {order.status === OrderStatus.PROCESSING || order.status === OrderStatus.DELIVERED ? 'Order is being processed' : 'Waiting'}
                                        </p>
                                    </div>
                                    <div>
                                        {order.status === OrderStatus.PROCESSING && <span className="inline-block w-3 h-3 bg-blue-500 rounded-full"></span>}
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${order.status === OrderStatus.DELIVERED ? 'bg-blue-500 text-white' : order.status === OrderStatus.CANCELLED || order.status === OrderStatus.REFUNDED ? 'bg-red-500 text-white' : 'bg-gray-200'}`}>
                                        3
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">
                                            {order.status === OrderStatus.CANCELLED ? 'Cancelled' :
                                                order.status === OrderStatus.REFUNDED ? 'Refunded' : 'Delivered'}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {order.status === OrderStatus.DELIVERED ? 'Successfully delivered' :
                                                order.status === OrderStatus.CANCELLED ? 'Order was cancelled' :
                                                    order.status === OrderStatus.REFUNDED ? 'Payment was refunded' : 'Waiting for delivery'}
                                        </p>
                                    </div>
                                    <div>
                                        {(order.status === OrderStatus.DELIVERED ||
                                            order.status === OrderStatus.CANCELLED ||
                                            order.status === OrderStatus.REFUNDED) &&
                                            <span className={`inline-block w-3 h-3 rounded-full ${order.status === OrderStatus.DELIVERED ? 'bg-blue-500' : 'bg-red-500'}`}></span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Order Analysis */}
                    <div className="bg-white shadow-md rounded-lg overflow-hidden mt-6">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Order Analysis</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Items Count</p>
                                    <p className="font-medium">{order.orderItems.reduce((acc, item) => acc + item.quantity, 0)} items</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Unique Products</p>
                                    <p className="font-medium">{order.orderItems.length} products</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Order Time</p>
                                    <p className="font-medium">{new Date(order.createdAt).toLocaleTimeString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Last Updated</p>
                                    <p className="font-medium">{formatDate(order.updatedAt)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="md:col-span-1">
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
                            {order.user ? (
                                <>
                                    <p className="font-medium">{order.user.fullname}</p>
                                    <p className="text-gray-600">{order.user.email}</p>
                                    {order.user.phone && <p className="text-gray-600">{order.user.phone}</p>}
                                </>
                            ) : (
                                <p className="text-gray-500">Guest Customer</p>
                            )}
                        </div>
                    </div>

                    {/* Shipping Address */}
                    {order.shippingAddress && (
                        <div className="bg-white shadow-md rounded-lg overflow-hidden mt-6">
                            <div className="p-6">
                                <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
                                <p className="whitespace-pre-line">{order.shippingAddress}</p>
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    {order.notes && (
                        <div className="bg-white shadow-md rounded-lg overflow-hidden mt-6">
                            <div className="p-6">
                                <h2 className="text-xl font-semibold mb-4">Order Notes</h2>
                                <p className="whitespace-pre-line text-gray-700">{order.notes}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Refund Modal */}
            {showRefundModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4">Process Refund</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Refund Reason
                            </label>
                            <textarea
                                value={refundReason}
                                onChange={(e) => setRefundReason(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                                placeholder="Enter reason for refund..."
                            />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowRefundModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRefund}
                                disabled={!refundReason.trim() || isProcessingRefund}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                            >
                                {isProcessingRefund ? "Processing..." : "Process Refund"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
