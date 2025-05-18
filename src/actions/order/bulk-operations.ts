"use server";

import { OrderStatus } from "@prisma/client";
import { z } from "zod";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// Validation schema for bulk operations
const BulkOrderIdsSchema = z.object({
    orderIds: z.array(z.number())
});

const BulkStatusUpdateSchema = z.object({
    orderIds: z.array(z.number()),
    status: z.nativeEnum(OrderStatus)
});

/**
 * Update status of multiple orders at once (admin only)
 */
export async function bulkUpdateOrderStatus({ orderIds, status }: z.infer<typeof BulkStatusUpdateSchema>) {
    try {
        // Validate input
        const validatedData = BulkStatusUpdateSchema.parse({ orderIds, status });

        // Get current user
        const session = await auth();
        if (!session?.user?.role || session.user.role !== "admin") {
            return { error: "You must be an admin to perform bulk operations" };
        }

        // Update all orders in transaction
        await db.$transaction(async (tx) => {
            // Update order statuses
            await tx.order.updateMany({
                where: {
                    id: {
                        in: validatedData.orderIds
                    }
                },
                data: {
                    status: validatedData.status,
                    updatedAt: new Date()
                }
            });

            // Create a single log entry for the bulk operation
            await tx.log.create({
                data: {
                    userId: session.user.id,
                    title: "BULK_ORDER_STATUS_UPDATE",
                    description: `Updated status of ${validatedData.orderIds.length} orders to ${status}`
                }
            });
        });

        revalidatePath("/admin/orders");

        return { success: true };
    } catch (error: any) {
        console.error("Error in bulk order status update:", error);
        return { error: error.message || "Failed to update order statuses" };
    }
}

/**
 * Delete multiple orders at once (admin only)
 */
export async function bulkDeleteOrders({ orderIds }: z.infer<typeof BulkOrderIdsSchema>) {
    try {
        // Validate input
        const validatedData = BulkOrderIdsSchema.parse({ orderIds });

        // Get current user
        const session = await auth();
        if (!session?.user?.role || session.user.role !== "admin") {
            return { error: "You must be an admin to perform bulk operations" };
        }

        // Delete all orders in transaction
        await db.$transaction(async (tx) => {
            // Delete the orders
            await tx.order.deleteMany({
                where: {
                    id: {
                        in: validatedData.orderIds
                    }
                }
            });

            // Create a log entry
            await tx.log.create({
                data: {
                    userId: session.user.id,
                    title: "BULK_ORDER_DELETE",
                    description: `Deleted ${validatedData.orderIds.length} orders`
                }
            });
        });

        revalidatePath("/admin/orders");

        return { success: true };
    } catch (error: any) {
        console.error("Error in bulk order deletion:", error);
        return { error: error.message || "Failed to delete orders" };
    }
}

/**
 * Export orders as CSV data (admin only)
 */
export async function exportOrdersToCSV({ orderIds }: z.infer<typeof BulkOrderIdsSchema>) {
    try {
        // Get current user
        const session = await auth();
        if (!session?.user?.role || session.user.role !== "admin") {
            return { error: "You must be an admin to export orders" };
        }

        // Get orders
        const orders = await db.order.findMany({
            where: {
                id: {
                    in: orderIds
                }
            },
            include: {
                user: {
                    select: {
                        fullname: true,
                        email: true
                    }
                },
                orderItems: {
                    include: {
                        property: {
                            include: {
                                product: {
                                    select: {
                                        title: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        // Build CSV content
        let csvContent = "Order ID,User,Email,Status,Total,Items,Date\n";

        for (const order of orders) {
            const row = [
                order.id,
                order.user?.fullname || "Guest",
                order.user?.email || "N/A",
                order.status,
                order.total,
                order.orderItems.length,
                order.createdAt.toISOString().split('T')[0]
            ];

            csvContent += row.join(",") + "\n";
        }

        // Log the export
        await db.log.create({
            data: {
                userId: session.user.id,
                title: "ORDERS_EXPORTED",
                description: `Exported ${orders.length} orders to CSV`
            }
        });

        return { success: true, data: csvContent };
    } catch (error: any) {
        console.error("Error exporting orders:", error);
        return { error: error.message || "Failed to export orders" };
    }
}
