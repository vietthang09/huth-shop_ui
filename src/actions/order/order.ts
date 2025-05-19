"use server";

import { OrderStatus } from "@prisma/client";
import { z } from "zod";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// ------------ Schema Validation ------------

// Schema for the shipping information
const ShippingInfoSchema = z.object({
  fullName: z.string().min(3, "Full name is required and must be at least 3 characters"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  province: z.string().min(2, "Province is required"),
  postalCode: z.string().min(3, "Postal code is required"),
  phone: z.string().min(9, "Valid phone number is required"),
});

// Schema for individual order items
const OrderItemSchema = z.object({
  productId: z.string(), // ID of the product
  variantId: z.number().optional().nullable(), // ID of the variant (property)
  quantity: z.number().min(1, "Quantity must be at least 1"),
  price: z.number().min(0, "Price must be greater than or equal to 0"),
  totalPrice: z.number().min(0, "Total price must be greater than or equal to 0"),
  variantAttributes: z.string().optional(),
});

// Schema for the complete order
const OrderSchema = z.object({
  items: z.array(OrderItemSchema).min(1, "Order must contain at least 1 item"),
  total: z.number().min(0, "Total must be greater than or equal to 0"),
  notes: z.string().optional(),
  shippingInfo: ShippingInfoSchema,
});

// Schema for updating order status
const UpdateOrderStatusSchema = z.object({
  orderId: z.number(),
  status: z.nativeEnum(OrderStatus),
});

// Export type for client-side use
export type CreateOrderInput = z.infer<typeof OrderSchema>;

// ------------ Order Actions ------------

/**
 * Create a new order
 */
export async function createOrder(data: CreateOrderInput) {
  try {
    // Validate order data
    const validatedData = OrderSchema.parse(data);

    // Get the current user
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "You must be logged in to place an order" };
    }

    // Create order and related records in a transaction
    const order = await db.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          total: validatedData.total,
          status: OrderStatus.PENDING,
          notes: validatedData.notes,
        },
      }); // Create order items
      for (const item of validatedData.items) {
        // Determine which property (variant) to use
        const propertyId = item.variantId;

        // If we have a variant ID, use that property
        if (propertyId) {
          await tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              propertiesId: propertyId,
              netPrice: item.price * 0.8, // Estimate net price as 80% of price
              retailPrice: item.price,
              quantity: item.quantity,
            },
          });

          // Update inventory quantity for the variant
          const inventory = await tx.inventory.findUnique({
            where: { propertiesId: propertyId },
          });

          if (inventory) {
            await tx.inventory.update({
              where: { propertiesId: propertyId },
              data: { quantity: inventory.quantity - item.quantity },
            });
          }
        } else {
          // If no variant ID, try to find the default property for this product
          const product = await tx.product.findFirst({
            where: { sku: item.productId },
            include: {
              properties: {
                take: 1,
                include: { inventory: true },
              },
            },
          });

          if (product && product.properties.length > 0) {
            const defaultProperty = product.properties[0];

            await tx.orderItem.create({
              data: {
                orderId: newOrder.id,
                propertiesId: defaultProperty.id,
                netPrice: item.price * 0.8, // Estimate net price as 80% of price
                retailPrice: item.price,
                quantity: item.quantity,
              },
            });

            // Update inventory if it exists
            if (defaultProperty.inventory) {
              await tx.inventory.update({
                where: { propertiesId: defaultProperty.id },
                data: { quantity: defaultProperty.inventory.quantity - item.quantity },
              });
            }
          }
        }
      }

      // Record order in logs
      await tx.log.create({
        data: {
          userId: session.user.id,
          title: "ORDER_CREATED",
          description: `Order #${newOrder.id} created with total ${validatedData.total}`,
        },
      });

      return newOrder;
    });

    revalidatePath("/orders");
    revalidatePath("/admin/orders");

    return { success: true, order };
  } catch (error: any) {
    console.error("Error creating order:", error);
    return { error: error.message || "Failed to create order" };
  }
}

/**
 * Get a specific order by ID
 */
export async function getOrder(orderId: number) {
  try {
    // Get current user
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "You must be logged in to view orders" };
    }

    // Find the order
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            fullname: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            property: {
              include: {
                product: {
                  select: {
                    title: true,
                    image: true,
                    description: true,
                  },
                },
                attributeSet: {
                  select: {
                    name: true,
                    value: true,
                    unit: true,
                    propertiesHash: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Check if the order exists
    if (!order) {
      return { error: "Order not found" };
    }

    // Check if the user owns this order or is an admin
    if (order.userId !== session.user.id && session.user.role !== "admin") {
      return { error: "You do not have permission to view this order" };
    }

    // Format order items to include readily accessible product titles and attributes
    const formattedOrder = {
      ...order,
      orderItems: order.orderItems.map((item) => ({
        ...item,
        productTitle: item.property.product.title,
        productImage: item.property.product.image,
        productDescription: item.property.product.description,
        attributes: {
          name: item.property.attributeSet.name,
          value: item.property.attributeSet.value,
          unit: item.property.attributeSet.unit,
        },
      })),
    };

    return { success: true, order: formattedOrder };
  } catch (error: any) {
    console.error("Error getting order:", error);
    return { error: error.message || "Failed to get order" };
  }
}

/**
 * Get all orders for the current user
 */
export async function getUserOrders(page = 1, limit = 10) {
  try {
    // Get current user
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "You must be logged in to view your orders" };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get orders with pagination
    const [orders, totalCount] = await Promise.all([
      db.order.findMany({
        where: { userId: session.user.id },
        include: {
          orderItems: {
            include: {
              property: {
                include: {
                  product: {
                    select: {
                      title: true,
                      image: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.order.count({ where: { userId: session.user.id } }),
    ]);

    return {
      success: true,
      orders,
      pagination: {
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        itemsPerPage: limit,
      },
    };
  } catch (error: any) {
    console.error("Error getting user orders:", error);
    return { error: error.message || "Failed to get orders" };
  }
}

/**
 * Get all orders (admin only)
 */
export async function getAllOrders(page = 1, limit = 10) {
  try {
    // Get current user
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "admin") {
      return { error: "You must be an admin to view all orders" };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get orders with pagination
    const [orders, totalCount] = await Promise.all([
      db.order.findMany({
        include: {
          user: {
            select: {
              fullname: true,
              email: true,
            },
          },
          orderItems: {
            include: {
              property: {
                include: {
                  product: {
                    select: {
                      title: true,
                      image: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
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
        itemsPerPage: limit,
      },
    };
  } catch (error: any) {
    console.error("Error getting all orders:", error);
    return { error: error.message || "Failed to get orders" };
  }
}

/**
 * Update order status (admin only)
 */
export async function updateOrderStatus(orderId: number, status: OrderStatus) {
  try {
    // Validate input
    const validatedData = UpdateOrderStatusSchema.parse({ orderId, status });

    // Get current user
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "admin") {
      return { error: "You must be an admin to update order status" };
    }

    // Update order status
    const updatedOrder = await db.order.update({
      where: { id: validatedData.orderId },
      data: { status: validatedData.status },
    });

    // Log the update
    await db.log.create({
      data: {
        userId: session.user.id,
        title: "ORDER_STATUS_UPDATED",
        description: `Order #${orderId} status updated to ${status}`,
      },
    });

    revalidatePath("/admin/orders");

    return { success: true, order: updatedOrder };
  } catch (error: any) {
    console.error("Error updating order status:", error);
    return { error: error.message || "Failed to update order status" };
  }
}

/**
 * Delete an order (admin only)
 */
export async function deleteOrder(orderId: number) {
  try {
    // Get current user
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "admin") {
      return { error: "You must be an admin to delete orders" };
    }

    // Delete order
    await db.order.delete({
      where: { id: orderId },
    });

    // Log the deletion
    await db.log.create({
      data: {
        userId: session.user.id,
        title: "ORDER_DELETED",
        description: `Order #${orderId} was deleted`,
      },
    });

    revalidatePath("/admin/orders");

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting order:", error);
    return { error: error.message || "Failed to delete order" };
  }
}

// ------------ Order Item Actions ------------

/**
 * Add an item to an existing order
 */
export async function addOrderItem(orderId: number, item: z.infer<typeof OrderItemSchema>) {
  try {
    // Validate input
    const validatedItem = OrderItemSchema.parse(item);

    // Get current user
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "You must be logged in to modify orders" };
    }

    // Get the order to check ownership
    const order = await db.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return { error: "Order not found" };
    }

    // Check if the user owns this order or is an admin
    if (order.userId !== session.user.id && session.user.role !== "admin") {
      return { error: "You do not have permission to modify this order" };
    } // Determine which property (variant) to use
    const propertyId = validatedItem.variantId;
    let newItem;

    // If we have a variant ID, use that property
    if (propertyId) {
      // Add the item
      newItem = await db.orderItem.create({
        data: {
          orderId,
          propertiesId: propertyId,
          netPrice: validatedItem.price * 0.8, // Estimate net price as 80% of price
          retailPrice: validatedItem.price,
          quantity: validatedItem.quantity,
        },
      });

      // Update the order total
      await db.order.update({
        where: { id: orderId },
        data: {
          total: {
            increment: validatedItem.price * validatedItem.quantity,
          },
          updatedAt: new Date(),
        },
      });

      // Update inventory
      const inventory = await db.inventory.findUnique({
        where: { propertiesId: propertyId },
      });

      if (inventory) {
        await db.inventory.update({
          where: { propertiesId: validatedItem.propertyId },
          data: { quantity: inventory.quantity - validatedItem.quantity },
        });
      }
    }

    revalidatePath("/orders");
    revalidatePath("/admin/orders");

    return { success: true, item: newItem };
  } catch (error: any) {
    console.error("Error adding order item:", error);
    return { error: error.message || "Failed to add order item" };
  }
}

/**
 * Update an order item
 */
export async function updateOrderItem(orderItemId: number, updates: { quantity?: number }) {
  try {
    // Get current user
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "You must be logged in to modify orders" };
    }

    // Find the order item
    const orderItem = await db.orderItem.findUnique({
      where: { id: orderItemId },
      include: { order: true },
    });

    if (!orderItem) {
      return { error: "Order item not found" };
    }

    // Check if the user owns this order or is an admin
    if (orderItem.order.userId !== session.user.id && session.user.role !== "admin") {
      return { error: "You do not have permission to modify this order" };
    }

    // Calculate price adjustment for order total
    const priceDifference = orderItem.retailPrice * (updates.quantity! - orderItem.quantity);

    // Update the order item
    const updatedItem = await db.orderItem.update({
      where: { id: orderItemId },
      data: {
        quantity: updates.quantity,
      },
    });

    // Update the order total
    await db.order.update({
      where: { id: orderItem.orderId },
      data: {
        total: {
          increment: priceDifference,
        },
        updatedAt: new Date(),
      },
    });

    // Update inventory if quantity changed
    if (updates.quantity) {
      const quantityChange = updates.quantity - orderItem.quantity;
      if (quantityChange !== 0) {
        const inventory = await db.inventory.findUnique({
          where: { propertiesId: orderItem.propertiesId },
        });

        if (inventory) {
          await db.inventory.update({
            where: { propertiesId: orderItem.propertiesId },
            data: { quantity: inventory.quantity - quantityChange },
          });
        }
      }
    }

    revalidatePath("/orders");
    revalidatePath("/admin/orders");

    return { success: true, item: updatedItem };
  } catch (error: any) {
    console.error("Error updating order item:", error);
    return { error: error.message || "Failed to update order item" };
  }
}

/**
 * Remove an item from an order
 */
export async function removeOrderItem(orderItemId: number) {
  try {
    // Get current user
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "You must be logged in to modify orders" };
    }

    // Find the order item
    const orderItem = await db.orderItem.findUnique({
      where: { id: orderItemId },
      include: { order: true },
    });

    if (!orderItem) {
      return { error: "Order item not found" };
    }

    // Check if the user owns this order or is an admin
    if (orderItem.order.userId !== session.user.id && session.user.role !== "admin") {
      return { error: "You do not have permission to modify this order" };
    }

    // Calculate price adjustment for order total
    const priceDifference = -(orderItem.retailPrice * orderItem.quantity);

    // Remove the item
    await db.orderItem.delete({
      where: { id: orderItemId },
    });

    // Update the order total
    await db.order.update({
      where: { id: orderItem.orderId },
      data: {
        total: {
          increment: priceDifference,
        },
        updatedAt: new Date(),
      },
    });

    // Return inventory
    const inventory = await db.inventory.findUnique({
      where: { propertiesId: orderItem.propertiesId },
    });

    if (inventory) {
      await db.inventory.update({
        where: { propertiesId: orderItem.propertiesId },
        data: { quantity: inventory.quantity + orderItem.quantity },
      });
    }

    revalidatePath("/orders");
    revalidatePath("/admin/orders");

    return { success: true };
  } catch (error: any) {
    console.error("Error removing order item:", error);
    return { error: error.message || "Failed to remove order item" };
  }
}

// ------------ Product Property Actions ------------

/**
 * Get all properties of a product
 */
export async function getProductProperties(productId: number) {
  try {
    const properties = await db.property.findMany({
      where: { productId },
      include: {
        attributeSet: true,
        inventory: true,
      },
    });

    return { success: true, properties };
  } catch (error: any) {
    console.error("Error getting product properties:", error);
    return { error: error.message || "Failed to get product properties" };
  }
}

/**
 * Get a specific property by ID
 */
export async function getProperty(propertyId: number) {
  try {
    const property = await db.property.findUnique({
      where: { id: propertyId },
      include: {
        product: true,
        attributeSet: true,
        inventory: true,
      },
    });

    if (!property) {
      return { error: "Property not found" };
    }

    return { success: true, property };
  } catch (error: any) {
    console.error("Error getting property:", error);
    return { error: error.message || "Failed to get property" };
  }
}

/**
 * Update inventory for a product property
 */
export async function updatePropertyInventory(propertyId: number, quantity: number) {
  try {
    // Get current user
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "admin") {
      return { error: "You must be an admin to update inventory" };
    }

    const inventory = await db.inventory.findUnique({
      where: { propertiesId: propertyId },
    });

    if (!inventory) {
      // Create inventory if it doesn't exist
      await db.inventory.create({
        data: {
          propertiesId: propertyId,
          quantity,
        },
      });
    } else {
      // Update existing inventory
      await db.inventory.update({
        where: { propertiesId: propertyId },
        data: { quantity },
      });
    }

    // Log the inventory update
    await db.log.create({
      data: {
        userId: session.user.id,
        title: "INVENTORY_UPDATED",
        description: `Inventory for product property #${propertyId} updated to ${quantity}`,
      },
    });

    revalidatePath("/admin/products");

    return { success: true };
  } catch (error: any) {
    console.error("Error updating property inventory:", error);
    return { error: error.message || "Failed to update inventory" };
  }
}

/**
 * Update a property's pricing
 */
export async function updatePropertyPricing(
  propertyId: number,
  prices: { netPrice?: number; retailPrice?: number; salePrice?: number | null }
) {
  try {
    // Get current user
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "admin") {
      return { error: "You must be an admin to update pricing" };
    }

    const updatedProperty = await db.property.update({
      where: { id: propertyId },
      data: {
        netPrice: prices.netPrice !== undefined ? prices.netPrice : undefined,
        retailPrice: prices.retailPrice !== undefined ? prices.retailPrice : undefined,
        salePrice: prices.salePrice !== undefined ? prices.salePrice : undefined,
      },
    });

    // Log the price update
    await db.log.create({
      data: {
        userId: session.user.id,
        title: "PRICE_UPDATED",
        description: `Pricing updated for product property #${propertyId}`,
      },
    });

    revalidatePath("/admin/products");

    return { success: true, property: updatedProperty };
  } catch (error: any) {
    console.error("Error updating property pricing:", error);
    return { error: error.message || "Failed to update pricing" };
  }
}

// ------------ Advanced Order Actions ------------

/**
 * Search orders with filtering options (admin only)
 */
export async function searchOrders({
  page = 1,
  limit = 10,
  status,
  userId,
  startDate,
  endDate,
  minTotal,
  maxTotal,
  sortBy = "createdAt",
  sortOrder = "desc",
}: {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  userId?: number;
  startDate?: Date;
  endDate?: Date;
  minTotal?: number;
  maxTotal?: number;
  sortBy?: "createdAt" | "total" | "updatedAt";
  sortOrder?: "asc" | "desc";
}) {
  try {
    // Get current user
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "admin") {
      return { error: "You must be an admin to search all orders" };
    }

    // Build where clause based on filters
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (userId) {
      where.userId = userId;
    }

    if (startDate || endDate) {
      where.createdAt = {};

      if (startDate) {
        where.createdAt.gte = startDate;
      }

      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    if (minTotal || maxTotal) {
      where.total = {};

      if (minTotal) {
        where.total.gte = minTotal;
      }

      if (maxTotal) {
        where.total.lte = maxTotal;
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get filtered orders with pagination
    const [orders, totalCount] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          user: {
            select: {
              fullname: true,
              email: true,
            },
          },
          orderItems: {
            include: {
              property: {
                include: {
                  product: {
                    select: {
                      title: true,
                      image: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      db.order.count({ where }),
    ]);

    return {
      success: true,
      orders,
      pagination: {
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        itemsPerPage: limit,
      },
    };
  } catch (error: any) {
    console.error("Error searching orders:", error);
    return { error: error.message || "Failed to search orders" };
  }
}

/**
 * Process a refund for an order (admin only)
 */
export async function processRefund(orderId: number, refundReason: string) {
  try {
    // Get current user
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "admin") {
      return { error: "You must be an admin to process refunds" };
    }

    // Find the order
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: true,
      },
    });

    if (!order) {
      return { error: "Order not found" };
    }

    // Update order status to REFUNDED
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.REFUNDED },
    });

    // Return items to inventory
    for (const item of order.orderItems) {
      const inventory = await db.inventory.findUnique({
        where: { propertiesId: item.propertiesId },
      });

      if (inventory) {
        await db.inventory.update({
          where: { propertiesId: item.propertiesId },
          data: { quantity: inventory.quantity + item.quantity },
        });
      }
    }

    // Log the refund
    await db.log.create({
      data: {
        userId: session.user.id,
        title: "ORDER_REFUNDED",
        description: `Order #${orderId} refunded. Reason: ${refundReason}`,
      },
    });

    revalidatePath("/admin/orders");

    return { success: true, order: updatedOrder };
  } catch (error: any) {
    console.error("Error processing refund:", error);
    return { error: error.message || "Failed to process refund" };
  }
}

/**
 * Generate order statistics for admin dashboard
 */
export async function getOrderStatistics(period: "daily" | "weekly" | "monthly" | "yearly" = "monthly") {
  try {
    // Get current user
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "admin") {
      return { error: "You must be an admin to view order statistics" };
    }

    const now = new Date();
    let startDate: Date;

    // Calculate start date based on period
    switch (period) {
      case "daily":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30); // Last 30 days
        break;
      case "weekly":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 90); // Last ~90 days (13 weeks)
        break;
      case "monthly":
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 12); // Last 12 months
        break;
      case "yearly":
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 5); // Last 5 years
        break;
      default:
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 12);
    }

    // Get all orders within the period
    const orders = await db.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        orderItems: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Calculate total revenue
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);

    // Count orders by status
    const ordersByStatus = await db.order.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    });

    // Calculate data for charts
    let timeSeriesData: any[] = [];
    let groupByFormat: string;

    switch (period) {
      case "daily":
        groupByFormat = "yyyy-MM-dd";
        break;
      case "weekly":
        groupByFormat = "yyyy-'W'ww"; // ISO week format
        break;
      case "monthly":
        groupByFormat = "yyyy-MM";
        break;
      case "yearly":
        groupByFormat = "yyyy";
        break;
      default:
        groupByFormat = "yyyy-MM";
    }

    // Group orders by time period
    const ordersByTimePeriod = new Map();

    for (const order of orders) {
      const date = order.createdAt;
      let key: string;

      if (period === "weekly") {
        // Calculate ISO week number
        const d = new Date(date);
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNum = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
        key = `${d.getUTCFullYear()}-W${weekNum.toString().padStart(2, "0")}`;
      } else if (period === "daily") {
        key = date.toISOString().slice(0, 10); // YYYY-MM-DD
      } else if (period === "monthly") {
        key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`; // YYYY-MM
      } else {
        key = date.getFullYear().toString(); // YYYY
      }

      if (!ordersByTimePeriod.has(key)) {
        ordersByTimePeriod.set(key, {
          period: key,
          count: 0,
          revenue: 0,
          items: 0,
        });
      }

      const periodData = ordersByTimePeriod.get(key);
      periodData.count += 1;
      periodData.revenue += Number(order.total);
      periodData.items += order.orderItems.length;
    }

    timeSeriesData = Array.from(ordersByTimePeriod.values());

    // Get most popular products
    const productSales = await db.orderItem.groupBy({
      by: ["propertiesId"],
      _sum: {
        quantity: true,
      },
      where: {
        order: {
          createdAt: {
            gte: startDate,
          },
        },
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 10, // Top 10 products
    });

    const topProducts = await Promise.all(
      productSales.map(async (sale) => {
        const property = await db.property.findUnique({
          where: { id: sale.propertiesId },
          include: {
            product: {
              select: {
                title: true,
                image: true,
              },
            },
          },
        });

        return {
          propertyId: sale.propertiesId,
          productTitle: property?.product?.title || "Unknown Product",
          productImage: property?.product?.image || null,
          quantitySold: sale._sum.quantity || 0,
          revenue: property ? Number(property.retailPrice) * (sale._sum.quantity || 0) : 0,
        };
      })
    );

    return {
      success: true,
      statistics: {
        totalRevenue,
        totalOrders: orders.length,
        ordersByStatus,
        timeSeriesData,
        topProducts,
        averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
      },
    };
  } catch (error: any) {
    console.error("Error generating order statistics:", error);
    return { error: error.message || "Failed to generate order statistics" };
  }
}
