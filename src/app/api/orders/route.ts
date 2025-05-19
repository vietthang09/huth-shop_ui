import { NextRequest, NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    // Get current user from session
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "You must be logged in to create an order" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { items, total } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Order must contain at least one item" }, { status: 400 });
    }

    if (typeof total !== "number" || total <= 0) {
      return NextResponse.json({ error: "Order total must be a positive number" }, { status: 400 });
    }

    // Create order with PROCESSING status
    const order = await db.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          total: total,
          status: OrderStatus.PROCESSING, // Set status to PROCESSING directly
          notes: body.notes || null,
        },
      });

      // Create order items and update inventory
      for (const item of items) {
        const propertyId = item.variantId;

        if (propertyId) {
          // Create order item
          await tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              propertiesId: propertyId,
              netPrice: item.price * 0.8, // Estimate net price as 80% of price
              retailPrice: item.price,
              quantity: item.quantity,
            },
          }); // Update inventory with checks
          const inventory = await tx.inventory.findUnique({
            where: { propertiesId: propertyId },
          });

          if (!inventory) {
            throw new Error(`Inventory for product variant ${propertyId} not found`);
          }

          if (inventory.quantity < item.quantity) {
            throw new Error(
              `Not enough inventory for product variant ${propertyId}. Available: ${inventory.quantity}, Requested: ${item.quantity}`
            );
          }

          await tx.inventory.update({
            where: { propertiesId: propertyId },
            data: { quantity: inventory.quantity - item.quantity },
          });
        }
      }

      // Log the order creation
      await tx.log.create({
        data: {
          userId: session.user.id,
          title: "ORDER_CREATED",
          description: `Order #${newOrder.id} created with total ${total}`,
        },
      });

      return newOrder;
    });

    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}
