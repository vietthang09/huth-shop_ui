"use server";

import { OrderStatus } from "@prisma/client";
import { z } from "zod";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { TOrder, TOrderItem, TShippingInfo } from "@/types/order";

// Validation schemas
const ShippingInfoSchema = z.object({
  fullName: z.string().min(3, "Full name is required and must be at least 3 characters"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  province: z.string().min(2, "Province is required"),
  postalCode: z.string().min(3, "Postal code is required"),
  phone: z.string().min(9, "Valid phone number is required"),
});

const OrderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(1),
  price: z.number().min(0),
  totalPrice: z.number().min(0),
});

const OrderSchema = z.object({
  items: z.array(OrderItemSchema),
  total: z.number().min(0),
  shippingInfo: ShippingInfoSchema,
});

// Create new order
export async function createOrder(orderData: z.infer<typeof OrderSchema>) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "User must be logged in to create an order" };
  }

  try {
    // Validate order data
    const validatedOrder = OrderSchema.safeParse(orderData);
    if (!validatedOrder.success) {
      return { error: "Invalid order data" };
    }

    // Create the order
    const order = await db.order.create({
      data: {
        userId: session.user.id,
        total: orderData.total,
        status: OrderStatus.PENDING,
        orderItems: {
          create: orderData.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            totalPrice: item.totalPrice,
          })),
        },
        shippingInfo: {
          create: {
            ...orderData.shippingInfo,
          },
        },
        paymentInfo: {
          create: {
            amount: orderData.total,
            method: "bank_transfer",
            status: "pending",
          },
        },
      },
      include: {
        orderItems: true,
        shippingInfo: true,
        paymentInfo: true,
      },
    });

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Error creating order:", error);
    return { error: "Failed to create order" };
  }
}

// Get orders for current user
export async function getUserOrders() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "User must be logged in to view orders" };
  }

  try {
    const orders = await db.order.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
                images: true,
              },
            },
          },
        },
        shippingInfo: true,
        paymentInfo: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, orders };
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return { error: "Failed to fetch orders" };
  }
}

// Get a single order by ID
export async function getOrder(orderId: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: "User must be logged in to view orders" };
  }

  try {
    const order = await db.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
                images: true,
                id: true,
              },
            },
          },
        },
        shippingInfo: true,
        paymentInfo: true,
      },
    });

    if (!order) {
      return { error: "Order not found" };
    }

    // Only allow admins or the order owner to view
    if (session.user.role !== "ADMIN" && order.userId !== session.user.id) {
      return { error: "Not authorized to view this order" };
    }

    return { success: true, order };
  } catch (error) {
    console.error("Error fetching order:", error);
    return { error: "Failed to fetch order" };
  }
}

// Update order payment status
export async function confirmPayment(orderId: string, transactionId?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "User must be logged in to confirm payment" };
  }

  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { paymentInfo: true },
    });

    if (!order) {
      return { error: "Order not found" };
    }

    // Check if user owns this order or is admin
    if (order.userId !== session.user.id && session.user.role !== "ADMIN") {
      return { error: "Not authorized to update this order" };
    }

    // Update payment info
    await db.paymentInfo.update({
      where: { orderId },
      data: {
        status: "paid",
        transactionId: transactionId || `TXN-${Date.now()}`,
        paidAt: new Date(),
      },
    });

    // Update order status
    await db.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CONFIRMED },
    });

    return { success: true };
  } catch (error) {
    console.error("Error confirming payment:", error);
    return { error: "Failed to confirm payment" };
  }
}

// Admin: Get all orders
export async function getAllOrders(page = 1, limit = 10) {
  const session = await auth();
  if (!session?.user?.role || session.user.role !== "ADMIN") {
    return { error: "Not authorized" };
  }

  try {
    const skip = (page - 1) * limit;

    const [orders, totalCount] = await Promise.all([
      db.order.findMany({
        skip,
        take: limit,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          orderItems: true,
          shippingInfo: true,
          paymentInfo: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      db.order.count(),
    ]);

    return {
      success: true,
      orders,
      pagination: {
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        hasMore: skip + orders.length < totalCount,
      },
    };
  } catch (error) {
    console.error("Error fetching all orders:", error);
    return { error: "Failed to fetch orders" };
  }
}

// Admin: Update order status
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const session = await auth();
  if (!session?.user?.role || session.user.role !== "ADMIN") {
    return { error: "Not authorized" };
  }

  try {
    await db.order.update({
      where: { id: orderId },
      data: { status },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { error: "Failed to update order status" };
  }
}
