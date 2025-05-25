"use server";

import { db } from "@/lib/db";

/**
 * Get warranty information for a product variant
 * @param propertyId ID of the product variant
 * @returns Warranty information if available
 */
export async function getProductWarrantyInfo(propertyId: number) {
  try {
    const inventory = await db.inventory.findUnique({
      where: { propertiesId: propertyId },
    });

    if (!inventory) {
      return null;
    }

    // First get the inventory ID
    const latestImport = await db.inventoryImport.findFirst({
      where: {
        importStatus: "COMPLETED",
        importItems: {
          some: {
            propertiesId: propertyId,
            OR: [{ warrantyPeriod: { not: null } }, { warrantyExpiry: { not: null } }],
          },
        },
      },
      include: {
        importItems: {
          where: {
            propertiesId: propertyId,
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!latestImport || !latestImport.importItems[0]) {
      return null;
    }

    const importItem = latestImport.importItems[0];

    // Calculate warranty status
    const now = new Date();
    let warrantyStatus = "active";
    let daysRemaining = 0;

    if (importItem.warrantyExpiry) {
      daysRemaining = Math.max(
        0,
        Math.ceil((importItem.warrantyExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      );
      warrantyStatus = daysRemaining > 0 ? "active" : "expired";
    } else if (importItem.warrantyPeriod) {
      const importDate = latestImport.createdAt;
      const expiryDate = new Date(importDate);
      expiryDate.setDate(expiryDate.getDate() + importItem.warrantyPeriod);

      daysRemaining = Math.max(0, Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      warrantyStatus = daysRemaining > 0 ? "active" : "expired";
    } else {
      return null;
    }

    return {
      importId: latestImport.id,
      importReference: latestImport.reference,
      importDate: latestImport.createdAt,
      warrantyPeriod: importItem.warrantyPeriod,
      warrantyExpiry: importItem.warrantyExpiry,
      warrantyStatus,
      daysRemaining,
    };
  } catch (error) {
    console.error("Error fetching product warranty info:", error);
    throw new Error("Failed to fetch warranty information");
  }
}
