import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ProductWarrantyInfo } from "@/types/inventory";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const propertyId = searchParams.get("propertyId");

    if (!propertyId) {
      return NextResponse.json({ error: "Property ID is required" }, { status: 400 });
    }

    // Find the most recent import with warranty information for this property
    const latestImportItem = await db.inventoryImportItem.findFirst({
      where: {
        propertiesId: parseInt(propertyId),
        OR: [{ warrantyPeriod: { not: null } }, { warrantyExpiry: { not: null } }],
        import: {
          importStatus: "COMPLETED", // Only consider completed imports
        },
      },
      orderBy: {
        import: {
          createdAt: "desc", // Get the most recent import
        },
      },
      include: {
        import: {
          select: {
            id: true,
            reference: true,
            createdAt: true,
          },
        },
      },
    });

    if (!latestImportItem) {
      return NextResponse.json({ warrantyInfo: null });
    }

    // Calculate warranty status
    const today = new Date();
    let warrantyStatus: "active" | "expired" | "unknown" = "unknown";
    let daysRemaining = 0;
    let warrantyExpiry = latestImportItem.warrantyExpiry;

    // If we have warranty period but no expiry, calculate expiry date
    if (latestImportItem.warrantyPeriod && !warrantyExpiry) {
      warrantyExpiry = new Date(latestImportItem.import.createdAt);
      warrantyExpiry.setDate(warrantyExpiry.getDate() + latestImportItem.warrantyPeriod);
    }

    // Determine warranty status and days remaining
    if (warrantyExpiry) {
      if (warrantyExpiry > today) {
        warrantyStatus = "active";
        const diffTime = Math.abs(warrantyExpiry.getTime() - today.getTime());
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      } else {
        warrantyStatus = "expired";
        daysRemaining = 0;
      }
    }

    // Format the response
    const warrantyInfo: ProductWarrantyInfo = {
      importId: latestImportItem.import.id,
      importReference: latestImportItem.import.reference,
      importDate: latestImportItem.import.createdAt,
      warrantyPeriod: latestImportItem.warrantyPeriod || undefined,
      warrantyExpiry: warrantyExpiry || undefined,
      warrantyStatus,
      daysRemaining,
    };

    return NextResponse.json({ warrantyInfo });
  } catch (error) {
    console.error("Error fetching warranty information:", error);
    return NextResponse.json({ error: "Failed to fetch warranty information" }, { status: 500 });
  }
}
