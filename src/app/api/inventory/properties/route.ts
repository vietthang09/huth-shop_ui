import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    // Get all properties with product and attribute details
    const properties = await db.property.findMany({
      include: {
        product: {
          select: {
            id: true,
            title: true,
            sku: true,
          },
        },
        attributeSet: {
          select: {
            id: true,
            name: true,
            value: true,
            unit: true,
          },
        },
        inventory: {
          select: {
            id: true,
            quantity: true,
          },
        },
      },
      orderBy: {
        product: {
          title: "asc",
        },
      },
    });

    return NextResponse.json({ properties });
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 });
  }
}
