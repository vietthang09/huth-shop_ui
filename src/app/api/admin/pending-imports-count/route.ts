import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    // Count pending and processing imports
    const pendingCount = await db.inventoryImport.count({
      where: {
        importStatus: {
          in: ["PENDING", "PROCESSING"],
        },
      },
    });

    return NextResponse.json({ pendingCount });
  } catch (error) {
    console.error("Error fetching pending import count:", error);
    return NextResponse.json({ error: "Failed to fetch pending import count" }, { status: 500 });
  }
}
