import { Order, OrderItem, OrderStatus, Property } from "@prisma/client";

/**
 * Calculate subtotal for an order
 */
export function calculateOrderSubtotal(orderItems: OrderItem[]): number {
    return orderItems.reduce((total, item) => {
        return total + Number(item.retailPrice) * item.quantity;
    }, 0)
}

/**
 * Format order status for display
 */
export function formatOrderStatus(status: OrderStatus): string {
    switch (status) {
        case OrderStatus.PENDING:
            return "Pending";
        case OrderStatus.PROCESSING:
            return "Processing";
        case OrderStatus.DELIVERED:
            return "Delivered";
        case OrderStatus.CANCELLED:
            return "Cancelled";
        case OrderStatus.REFUNDED:
            return "Refunded";
        default:
            return status;
    }
}

/**
 * Get CSS color class for order status
 */
export function getOrderStatusColor(status: OrderStatus): string {
    switch (status) {
        case OrderStatus.PENDING:
            return "bg-yellow-100 text-yellow-800";
        case OrderStatus.PROCESSING:
            return "bg-blue-100 text-blue-800";
        case OrderStatus.DELIVERED:
            return "bg-green-100 text-green-800";
        case OrderStatus.CANCELLED:
            return "bg-red-100 text-red-800";
        case OrderStatus.REFUNDED:
            return "bg-purple-100 text-purple-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
}

/**
 * Check if an order can be modified
 */
export function canModifyOrder(order: Order): boolean {
    // Only allow modification for pending or processing orders
    return [OrderStatus.PENDING, OrderStatus.PROCESSING].includes(order.status);
}

/**
 * Check if an order can be canceled
 */
export function canCancelOrder(order: Order): boolean {
    // Only pending orders can be cancelled
    return order.status === OrderStatus.PENDING;
}

/**
 * Check if items are in stock
 */
export function checkItemStock(
    orderItems: Array<{ propertyId: number; quantity: number }>,
    properties: Array<Property & { inventory?: { quantity: number } | null }>
): { inStock: boolean; outOfStockItems: Array<{ propertyId: number; available: number; requested: number }> } {
    const outOfStockItems: Array<{ propertyId: number; available: number; requested: number }> = [];

    for (const item of orderItems) {
        const property = properties.find(p => p.id === item.propertyId);
        if (!property || !property.inventory || property.inventory.quantity < item.quantity) {
            outOfStockItems.push({
                propertyId: item.propertyId,
                available: property?.inventory?.quantity || 0,
                requested: item.quantity
            });
        }
    }

    return {
        inStock: outOfStockItems.length === 0,
        outOfStockItems
    };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number | string | null | undefined): string {
    // Handle null/undefined values
    if (amount === null || amount === undefined) {
        return '$0.00';
    }

    // Convert string to number if needed
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    // Check for NaN, which can happen if parseFloat fails
    if (isNaN(numAmount)) {
        return '$0.00';
    }

    return numAmount.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
    });
}
