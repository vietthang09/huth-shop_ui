"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import {
  CreateInventoryImportDTO,
  ImportPaymentStatus,
  ImportStatus,
  UpdateImportPaymentStatusDTO,
  UpdateImportStatusDTO,
} from "@/types/inventory";

/**
 * Create a new inventory import record with items
 * @param data Import data with items
 * @returns Created import record
 */
export async function createInventoryImport(data: CreateInventoryImportDTO) {
  try {
    console.log("Creating inventory import with data:", data);
    // Validate if user exists
    const user = await db.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Validate if supplier exists
    const supplier = await db.supplier.findUnique({
      where: { id: data.supplierId },
    });

    if (!supplier) {
      throw new Error("Supplier not found");
    }

    // Create the import record with a transaction to ensure all or nothing
    const result = await db.$transaction(async (tx) => {
      // Create the main import record
      const importRecord = await tx.inventoryImport.create({
        data: {
          userId: data.userId,
          supplierId: data.supplierId,
          reference: data.reference,
          description: data.description,
          totalAmount: data.totalAmount,
          paymentStatus: data.paymentStatus || "PENDING",
          importStatus: data.importStatus || "DRAFT",
          // Create items as nested creation
          importItems: {
            create: await Promise.all(
              data.importItems.map(async (item) => {
                // Get the inventory record for this property
                const inventory = await tx.inventory.findUnique({
                  where: { propertiesId: item.propertiesId },
                });

                if (!inventory) {
                  throw new Error(`Inventory not found for property ID: ${item.propertiesId}`);
                }

                return {
                  propertiesId: item.propertiesId,
                  inventoryId: inventory.id,
                  quantity: item.quantity,
                  netPrice: item.netPrice,
                  warrantyPeriod: item.warrantyPeriod,
                  warrantyExpiry: item.warrantyExpiry,
                  notes: item.notes,
                };
              })
            ),
          },
        },
        include: {
          importItems: true,
        },
      });

      return importRecord;
    });

    revalidatePath("/admin/inventory/imports");
    return result;
  } catch (error) {
    console.error("Error creating inventory import:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to create inventory import");
  }
}

/**
 * Process an import by updating inventory quantities
 * @param importId ID of the import to process
 * @returns Updated import record
 */
export async function processInventoryImport(importId: number) {
  try {
    // Get the import record with items
    const importRecord = await db.inventoryImport.findUnique({
      where: { id: importId },
      include: {
        importItems: true,
      },
    });

    if (!importRecord) {
      throw new Error("Import record not found");
    }

    // Verify the import is in a valid state to process
    if (importRecord.importStatus !== "PENDING") {
      throw new Error(`Import cannot be processed. Current status: ${importRecord.importStatus}`);
    }

    // Process the import in a transaction
    const result = await db.$transaction(async (tx) => {
      // Update each inventory item
      for (const item of importRecord.importItems) {
        // Get current inventory
        const inventory = await tx.inventory.findUnique({
          where: { id: item.inventoryId },
        });

        if (!inventory) {
          throw new Error(`Inventory record not found for ID: ${item.inventoryId}`);
        }

        // Update inventory quantity
        await tx.inventory.update({
          where: { id: item.inventoryId },
          data: {
            quantity: inventory.quantity + item.quantity,
          },
        });
      }

      // Update import status to COMPLETED
      const updatedImport = await tx.inventoryImport.update({
        where: { id: importId },
        data: {
          importStatus: "COMPLETED",
        },
        include: {
          importItems: true,
        },
      });

      return updatedImport;
    });

    // Create a log entry for this operation
    await db.log.create({
      data: {
        userId: importRecord.userId,
        title: "INVENTORY_IMPORT_PROCESSED",
        description: `Processed inventory import ID: ${importId} with ${importRecord.importItems.length} items`,
      },
    });

    revalidatePath("/admin/inventory/imports");
    return result;
  } catch (error) {
    console.error("Error processing inventory import:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to process inventory import");
  }
}

/**
 * Update the status of an import
 * @param data Object containing importId and new status
 * @returns Updated import record
 */
export async function updateImportStatus(data: UpdateImportStatusDTO) {
  try {
    const importRecord = await db.inventoryImport.findUnique({
      where: { id: data.importId },
      include: {
        importItems: true,
      },
    });

    if (!importRecord) {
      throw new Error("Import record not found");
    }

    // Add business logic for status transitions
    if (
      (importRecord.importStatus === "COMPLETED" && data.importStatus !== "CANCELLED") ||
      (importRecord.importStatus === "CANCELLED" && data.importStatus !== "DRAFT")
    ) {
      throw new Error(`Invalid status transition from ${importRecord.importStatus} to ${data.importStatus}`);
    }

    // If updating to COMPLETED status, we need to update inventory quantities
    if (data.importStatus === "COMPLETED" && importRecord.importStatus !== "COMPLETED") {
      // Verify the import is in a valid state to process
      if (!["DRAFT", "PENDING", "PROCESSING"].includes(importRecord.importStatus)) {
        throw new Error(`Import cannot be completed. Current status: ${importRecord.importStatus}`);
      }

      // Process the status update and inventory update in a transaction
      const result = await db.$transaction(async (tx) => {
        // Update each inventory item
        for (const item of importRecord.importItems) {
          // Get current inventory
          const inventory = await tx.inventory.findUnique({
            where: { id: item.inventoryId },
          });

          if (!inventory) {
            throw new Error(`Inventory record not found for ID: ${item.inventoryId}`);
          }

          // Update inventory quantity
          await tx.inventory.update({
            where: { id: item.inventoryId },
            data: {
              quantity: inventory.quantity + item.quantity,
            },
          });
        }

        // Update import status to COMPLETED
        const updatedImport = await tx.inventoryImport.update({
          where: { id: data.importId },
          data: {
            importStatus: data.importStatus,
          },
        });

        return updatedImport;
      });

      // Create a log entry for this operation
      await db.log.create({
        data: {
          userId: importRecord.userId,
          title: "INVENTORY_IMPORT_STATUS_UPDATED",
          description: `Updated inventory import ID: ${data.importId} to ${data.importStatus} and processed ${importRecord.importItems.length} items`,
        },
      });

      revalidatePath("/admin/inventory/imports");
      return result;
    } else {
      // Regular status update without inventory changes
      const updatedImport = await db.inventoryImport.update({
        where: { id: data.importId },
        data: {
          importStatus: data.importStatus,
        },
      });

      // Create a log entry for status change
      await db.log.create({
        data: {
          userId: importRecord.userId,
          title: "INVENTORY_IMPORT_STATUS_UPDATED",
          description: `Updated inventory import ID: ${data.importId} status to ${data.importStatus}`,
        },
      });

      revalidatePath("/admin/inventory/imports");
      return updatedImport;
    }
  } catch (error) {
    console.error("Error updating import status:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to update import status");
  }
}

/**
 * Update the payment status of an import
 * @param data Object containing importId and new payment status
 * @returns Updated import record
 */
export async function updateImportPaymentStatus(data: UpdateImportPaymentStatusDTO) {
  try {
    const importRecord = await db.inventoryImport.findUnique({
      where: { id: data.importId },
    });

    if (!importRecord) {
      throw new Error("Import record not found");
    }

    const updatedImport = await db.inventoryImport.update({
      where: { id: data.importId },
      data: {
        paymentStatus: data.paymentStatus,
      },
    });

    revalidatePath("/admin/inventory/imports");
    return updatedImport;
  } catch (error) {
    console.error("Error updating import payment status:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to update import payment status");
  }
}

/**
 * Get all imports with summary information
 * @returns Array of import summaries
 */
export async function getAllImports() {
  try {
    const imports = await db.inventoryImport.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullname: true,
            email: true,
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
        importItems: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return imports.map((imp: any) => ({
      id: imp.id,
      reference: imp.reference,
      supplierName: imp.supplier.name,
      userName: imp.user.fullname || imp.user.email,
      totalAmount: Number(imp.totalAmount),
      itemCount: imp.importItems.length,
      paymentStatus: imp.paymentStatus,
      importStatus: imp.importStatus,
      createdAt: imp.createdAt,
    }));
  } catch (error) {
    console.error("Error fetching all imports:", error);
    throw new Error("Failed to fetch imports");
  }
}

/**
 * Get detailed information about a specific import
 * @param importId ID of the import to fetch
 * @returns Detailed import information with items
 */
export async function getImportDetails(importId: number) {
  try {
    const importRecord = await db.inventoryImport.findUnique({
      where: { id: importId },
      include: {
        user: {
          select: {
            id: true,
            fullname: true,
            email: true,
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
        importItems: {
          include: {
            property: {
              include: {
                product: true,
                attributeSet: true,
              },
            },
          },
        },
      },
    });

    if (!importRecord) {
      throw new Error("Import record not found");
    }

    return importRecord;
  } catch (error) {
    console.error("Error fetching import details:", error);
    throw new Error("Failed to fetch import details");
  }
}

/**
 * Cancel an import
 * @param importId ID of the import to cancel
 * @returns Cancelled import record
 */
export async function cancelImport(importId: number) {
  try {
    const importRecord = await db.inventoryImport.findUnique({
      where: { id: importId },
    });

    if (!importRecord) {
      throw new Error("Import record not found");
    }

    // Only drafts and pending imports can be cancelled
    if (!["DRAFT", "PENDING"].includes(importRecord.importStatus)) {
      throw new Error(`Cannot cancel import with status: ${importRecord.importStatus}`);
    }

    const cancelledImport = await db.inventoryImport.update({
      where: { id: importId },
      data: {
        importStatus: "CANCELLED",
        paymentStatus: "CANCELLED",
      },
    });

    revalidatePath("/admin/inventory/imports");
    return cancelledImport;
  } catch (error) {
    console.error("Error cancelling import:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to cancel import");
  }
}

/**
 * Process multiple imports at once
 * @param importIds Array of import IDs to process
 * @returns Results of the bulk operation
 */
export async function bulkProcessImports(importIds: number[]) {
  try {
    const results = [];
    let successCount = 0;
    let failCount = 0;

    // Process each import sequentially to avoid conflicts
    for (const importId of importIds) {
      try {
        const result = await processInventoryImport(importId);
        results.push({
          importId,
          success: true,
          message: `Import #${importId} processed successfully`,
        });
        successCount++;
      } catch (error) {
        results.push({
          importId,
          success: false,
          message: error instanceof Error ? error.message : `Failed to process import #${importId}`,
        });
        failCount++;
      }
    }

    revalidatePath("/admin/inventory/imports");

    return {
      success: failCount === 0,
      message: `Processed ${successCount} import(s) successfully, ${failCount} failed`,
      results,
    };
  } catch (error) {
    console.error("Error processing bulk imports:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to process bulk imports");
  }
}

/**
 * Bulk update import payment status
 * @param importIds Array of import IDs
 * @param paymentStatus New payment status
 * @returns Results of the bulk operation
 */
export async function bulkUpdatePaymentStatus(importIds: number[], paymentStatus: ImportPaymentStatus) {
  try {
    const results = [];
    let successCount = 0;
    let failCount = 0;

    // Update each import sequentially
    for (const importId of importIds) {
      try {
        await updateImportPaymentStatus({ importId, paymentStatus });
        results.push({
          importId,
          success: true,
          message: `Payment status updated to ${paymentStatus} for import #${importId}`,
        });
        successCount++;
      } catch (error) {
        results.push({
          importId,
          success: false,
          message: error instanceof Error ? error.message : `Failed to update payment status for import #${importId}`,
        });
        failCount++;
      }
    }

    revalidatePath("/admin/inventory/imports");

    return {
      success: failCount === 0,
      message: `Updated payment status for ${successCount} import(s) successfully, ${failCount} failed`,
      results,
    };
  } catch (error) {
    console.error("Error updating bulk payment status:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to update bulk payment status");
  }
}

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
    // Get the most recent completed import with warranty information
    const latestImport = await db.inventoryImportItem.findFirst({
      where: {
        propertiesId: propertyId,
        import: {
          importStatus: "COMPLETED",
        },
        OR: [{ warrantyPeriod: { not: null } }, { warrantyExpiry: { not: null } }],
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
      orderBy: {
        import: {
          createdAt: "desc",
        },
      },
    });

    if (!latestImport) {
      return null;
    }

    // Calculate warranty status
    const now = new Date();
    let warrantyStatus = "active";
    let daysRemaining = 0;

    if (latestImport.warrantyExpiry) {
      daysRemaining = Math.max(
        0,
        Math.ceil((latestImport.warrantyExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      );
      warrantyStatus = daysRemaining > 0 ? "active" : "expired";
    } else if (latestImport.warrantyPeriod) {
      const importDate = latestImport.import.createdAt;
      const expiryDate = new Date(importDate);
      expiryDate.setDate(expiryDate.getDate() + latestImport.warrantyPeriod);

      daysRemaining = Math.max(0, Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      warrantyStatus = daysRemaining > 0 ? "active" : "expired";
    } else {
      return null;
    }

    return {
      importId: latestImport.import.id,
      importReference: latestImport.import.reference,
      importDate: latestImport.import.createdAt,
      warrantyPeriod: latestImport.warrantyPeriod,
      warrantyExpiry: latestImport.warrantyExpiry,
      warrantyStatus,
      daysRemaining,
    };
  } catch (error) {
    console.error("Error fetching product warranty info:", error);
    throw new Error("Failed to fetch warranty information");
  }
}
