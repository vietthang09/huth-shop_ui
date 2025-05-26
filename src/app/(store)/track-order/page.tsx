"use client";

import { useState } from "react";
import { getOrderForTracking, formatOrderStatus, getOrderStatusColor } from "@/actions/order";
import Image from "next/image";

export default function OrderTrackingPage() {
    const [orderId, setOrderId] = useState("");
    const [email, setEmail] = useState("");
    const [order, setOrder] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!orderId.trim()) {
            setError("Order ID is required");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await getOrderForTracking(parseInt(orderId), email.trim() || undefined);

            if (result.success && result.order) {
                setOrder(result.order);
            } else {
                setError(result.error || "Order not found. Please check your order ID and email.");
                setOrder(null);
            }
        } catch (error) {
            console.error("Error fetching order:", error);
            setError("Failed to retrieve order information");
            setOrder(null);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const renderOrderTimeline = () => {
        if (!order) return null;

        const statusSteps = [
            { status: 'PENDING', label: 'Order Placed', description: 'Your order has been received' },
            { status: 'PROCESSING', label: 'Processing', description: 'We\'re preparing your order' },
            { status: 'SHIPPED', label: 'Shipped', description: 'Your order is on the way' },
            { status: 'DELIVERED', label: 'Delivered', description: 'Your order has been delivered' }
        ];

        // Find the current step index
        const currentStatusIndex = statusSteps.findIndex(step => step.status === order.status);
        const isCompleted = currentStatusIndex === statusSteps.length - 1;
        const isCancelled = order.status === 'CANCELLED';
        const isRefunded = order.status === 'REFUNDED';

        if (isCancelled || isRefunded) {
            return (
                <div className="mt-6">
                    <div className="py-3 px-4 bg-gray-100 rounded-lg">
                        <div className="flex items-center">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isRefunded ? 'bg-yellow-500' : 'bg-red-500'} text-white`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {isRefunded ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    )}
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium">{isRefunded ? 'Order Refunded' : 'Order Cancelled'}</p>
                                <p className="text-xs text-gray-500">
                                    {formatDate(order.updatedAt)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="mt-6">
                <div className="relative">
                    {/* Progress line */}
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="h-0.5 w-full bg-gray-200">
                            <div
                                className="h-0.5 bg-green-500 transition-all duration-500"
                                style={{ width: isCompleted ? '100%' : `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Steps */}
                    <div className="relative flex justify-between">
                        {statusSteps.map((step, index) => {
                            const isActive = index <= currentStatusIndex;

                            return (
                                <div key={step.status} className="flex flex-col items-center">
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${isActive ? 'bg-green-500' : 'bg-gray-300'} transition-colors duration-300`}>
                                        {isActive ? (
                                            <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <span className="text-white text-xs">{index + 1}</span>
                                        )}
                                    </div>
                                    <div className="text-center mt-2">
                                        <div className="text-sm font-medium">{step.label}</div>
                                        <div className="text-xs text-gray-500 hidden md:block">{step.description}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold text-center mb-8">Order Tracking</h1>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="p-6">
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-6 mb-6 md:grid-cols-2">
                            <div>
                                <label htmlFor="orderId" className="block mb-2 text-sm font-medium text-gray-700">
                                    Order ID <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="orderId"
                                    value={orderId}
                                    onChange={(e) => setOrderId(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter your order ID"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
                                    Email (Optional)
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter your email address"
                                />
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                            >
                                {isLoading ? "Searching..." : "Track Order"}
                            </button>
                        </div>

                        {error && (
                            <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-md">
                                {error}
                            </div>
                        )}
                    </form>
                </div>
            </div>

            {/* Order Details */}
            {order && (
                <div className="mt-8 bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold">Order #{order.id}</h2>
                            <div className="text-sm">
                                Placed on {formatDate(order.createdAt)}
                            </div>
                        </div>

                        {/* Order Status */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm text-gray-500">Status</div>
                                    <div className="font-medium">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getOrderStatusColor(order.status)}`}>
                                            {formatOrderStatus(order.status)}
                                        </span>
                                    </div>
                                </div>

                                {order.paymentMethod && (
                                    <div className="text-right">
                                        <div className="text-sm text-gray-500">Payment Method</div>
                                        <div className="font-medium">{order.paymentMethod}</div>
                                    </div>
                                )}
                            </div>

                            {renderOrderTimeline()}
                        </div>

                        {/* Order Items */}
                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-medium mb-4">Order Items</h3>

                            <div className="space-y-4">
                                {order.orderItems.map((item: any) => (
                                    <div key={item.id} className="flex items-center">
                                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 relative">
                                            {item.property?.product?.image && (
                                                <Image
                                                    src={item.property.product.image}
                                                    alt={item.property.product.title}
                                                    fill
                                                    className="object-cover object-center"
                                                />
                                            )}
                                        </div>

                                        <div className="ml-4 flex-1">
                                            <div className="font-medium">
                                                {item.property?.product?.title}
                                            </div>
                                            {item.attributes?.name && (
                                                <div className="text-sm text-gray-500">
                                                    Option: {item.attributes.name} {item.attributes.value} {item.attributes.unit}
                                                </div>
                                            )}
                                            <div className="text-sm">
                                                {formatCurrency(item.price)} × {item.quantity}
                                            </div>
                                        </div>

                                        <div className="font-medium">
                                            {formatCurrency(item.price * item.quantity)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Order Summary */}
                            <div className="mt-6 border-t border-gray-200 pt-6">
                                <div className="flex justify-between font-medium">
                                    <span>Total</span>
                                    <span>{formatCurrency(order.total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        {order.shippingAddress && (
                            <div className="mt-8 border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-medium mb-2">Shipping Address</h3>
                                <p className="whitespace-pre-line text-gray-700">
                                    {order.shippingAddress}
                                </p>
                            </div>
                        )}

                        {/* Order Notes */}
                        {order.notes && (
                            <div className="mt-6 border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-medium mb-2">Order Notes</h3>
                                <p className="text-gray-700">{order.notes}</p>
                            </div>
                        )}

                        {/* Help Section */}
                        <div className="mt-8 border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-medium mb-4">Need Help?</h3>
                            <p className="text-gray-700 mb-4">
                                If you have any questions about your order, please contact our customer support.
                            </p>
                            <div className="flex space-x-4">
                                <a
                                    href="mailto:support@example.com"
                                    className="text-blue-600 hover:underline flex items-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                    </svg>
                                    Email Support
                                </a>
                                <a
                                    href="tel:+1234567890"
                                    className="text-blue-600 hover:underline flex items-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                    </svg>
                                    Call Support
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
