import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PendingImportInfo } from "@/types/inventory";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const propertyId = searchParams.get("propertyId");

    if (!propertyId) {
      return NextResponse.json({ error: "Property ID is required" }, { status: 400 });
    }

    // Find pending imports for this property
    const pendingImportItems = await db.inventoryImportItem.findMany({
      where: {
        propertiesId: parseInt(propertyId),
        import: {
          importStatus: {
            in: ["PENDING", "PROCESSING"], // Only include pending and processing imports
          },
        },
      },
      include: {
        import: {
          select: {
            id: true,
            reference: true,
            importStatus: true,
          },
        },
      },
    });

    // Format the response
    const response: PendingImportInfo = {
      hasPending: pendingImportItems.length > 0,
      pendingImports: pendingImportItems.map((item) => ({
        importId: item.import.id,
        reference: item.import.reference,
        importStatus: item.import.importStatus,
        quantity: item.quantity,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching pending imports:", error);
    return NextResponse.json({ error: "Failed to fetch pending imports" }, { status: 500 });
  }
}
