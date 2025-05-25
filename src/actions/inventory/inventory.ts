"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Get inventory by property ID
 * @param propertyId - ID of the property variant
 * @returns Inventory data with property info or null if not found
 */
export async function getInventoryByPropertyId(propertyId: number) {
  try {
    const inventory = await db.inventory.findUnique({
      where: { propertiesId: propertyId },
      include: {
        property: {
          include: {
            product: true,
            attributeSet: true,
          },
        },
      },
    });
    return inventory;
  } catch (error) {
    console.error("Error fetching inventory:", error);
    throw new Error("Failed to fetch inventory");
  }
}

/**
 * Get all inventory items with their related property and product data
 * @returns Array of inventory items with product details
 */
export async function getAllInventory() {
  try {
    const inventoryItems = await db.inventory.findMany({
      include: {
        property: {
          include: {
            product: true,
            attributeSet: true,
          },
        },
      },
    });
    return inventoryItems;
  } catch (error) {
    console.error("Error fetching all inventory:", error);
    throw new Error("Failed to fetch inventory items");
  }
}

/**
 * Create a new inventory record for a product variant (property)
 * @param data - Object containing propertiesId and quantity
 * @returns Created inventory record
 */
export async function createInventory({ propertiesId, quantity }: { propertiesId: number; quantity: number }) {
  try {
    // Check if property exists
    const property = await db.property.findUnique({
      where: { id: propertiesId },
    });

    if (!property) {
      throw new Error("Property not found");
    }

    // Check if inventory already exists for this property
    const existingInventory = await db.inventory.findUnique({
      where: { propertiesId },
    });

    if (existingInventory) {
      throw new Error("Inventory already exists for this property");
    }

    const inventory = await db.inventory.create({
      data: {
        propertiesId,
        quantity,
      },
    });

    revalidatePath("/admin/inventory");
    return inventory;
  } catch (error) {
    console.error("Error creating inventory:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to create inventory");
  }
}

/**
 * Update inventory quantity for a specific product variant
 * @param id - ID of the inventory record
 * @param quantity - New quantity value
 * @returns Updated inventory record
 */
export async function updateInventoryQuantity(id: number, quantity: number) {
  try {
    const inventory = await db.inventory.update({
      where: { id },
      data: { quantity },
    });

    revalidatePath("/admin/inventory");
    return inventory;
  } catch (error) {
    console.error("Error updating inventory quantity:", error);
    throw new Error("Failed to update inventory quantity");
  }
}

/**
 * Update inventory quantity by property ID
 * @param propertyId - ID of the property (product variant)
 * @param quantity - New quantity value
 * @returns Updated inventory record
 */
export async function updateInventoryQuantityByPropertyId(propertyId: number, quantity: number) {
  try {
    const inventory = await db.inventory.update({
      where: { propertiesId: propertyId },
      data: { quantity },
    });

    revalidatePath("/admin/inventory");
    return inventory;
  } catch (error) {
    console.error("Error updating inventory quantity:", error);
    throw new Error("Failed to update inventory quantity");
  }
}

/**
 * Adjust inventory quantity by adding or subtracting a specified amount
 * @param propertyId - ID of the property (product variant)
 * @param adjustment - Amount to adjust (positive for increase, negative for decrease)
 * @returns Updated inventory record
 */
export async function adjustInventoryQuantity(propertyId: number, adjustment: number) {
  try {
    // First get the current inventory
    const currentInventory = await db.inventory.findUnique({
      where: { propertiesId: propertyId },
    });

    if (!currentInventory) {
      throw new Error("Inventory not found for this property");
    }

    // Calculate new quantity, prevent negative quantities
    const newQuantity = Math.max(0, currentInventory.quantity + adjustment);

    // Update with new quantity
    const updatedInventory = await db.inventory.update({
      where: { propertiesId: propertyId },
      data: { quantity: newQuantity },
    });

    revalidatePath("/admin/inventory");
    return updatedInventory;
  } catch (error) {
    console.error("Error adjusting inventory quantity:", error);
    throw new Error("Failed to adjust inventory quantity");
  }
}

/**
 * Delete inventory record
 * @param id - ID of the inventory record to delete
 * @returns Deleted inventory record
 */
export async function deleteInventory(id: number) {
  try {
    const deleted = await db.inventory.delete({
      where: { id },
    });

    revalidatePath("/admin/inventory");
    return deleted;
  } catch (error) {
    console.error("Error deleting inventory:", error);
    throw new Error("Failed to delete inventory");
  }
}

/**
 * Check if a product variant has sufficient inventory
 * @param propertyId - ID of the property (product variant)
 * @param requestedQuantity - Quantity requested
 * @returns Object indicating if stock is sufficient and available quantity
 */
export async function checkInventoryAvailability(propertyId: number, requestedQuantity: number) {
  try {
    const inventory = await db.inventory.findUnique({
      where: { propertiesId: propertyId },
    });

    if (!inventory) {
      return {
        isAvailable: false,
        availableQuantity: 0,
        requestedQuantity,
        message: "Product variant not found in inventory",
      };
    }

    const isAvailable = inventory.quantity >= requestedQuantity;

    return {
      isAvailable,
      availableQuantity: inventory.quantity,
      requestedQuantity,
      message: isAvailable ? "Stock available" : `Only ${inventory.quantity} items available`,
    };
  } catch (error) {
    console.error("Error checking inventory availability:", error);
    throw new Error("Failed to check inventory availability");
  }
}

/**
 * Get low stock inventory items
 * @param threshold - Quantity threshold to consider as low stock
 * @returns Array of low stock inventory items with product details
 */
export async function getLowStockInventory(threshold: number = 10) {
  try {
    const lowStockItems = await db.inventory.findMany({
      where: {
        quantity: {
          lte: threshold,
        },
      },
      include: {
        property: {
          include: {
            product: true,
            attributeSet: true,
          },
        },
      },
    });

    return lowStockItems;
  } catch (error) {
    console.error("Error fetching low stock inventory:", error);
    throw new Error("Failed to fetch low stock inventory items");
  }
}

/**
 * Process inventory changes for order fulfillment
 * @param orderItems - Array of order items with property IDs and quantities
 * @returns Object indicating success or failure with details
 */
export async function processOrderInventory(orderItems: { propertyId: number; quantity: number }[]) {
  try {
    // Check if all items have sufficient inventory first
    for (const item of orderItems) {
      const availability = await checkInventoryAvailability(item.propertyId, item.quantity);

      if (!availability.isAvailable) {
        return {
          success: false,
          message: `Insufficient stock for property ID ${item.propertyId}. ${availability.message}`,
          item,
        };
      }
    }

    // Process all inventory updates in a transaction
    const results = await db.$transaction(
      orderItems.map((item) =>
        db.inventory.update({
          where: { propertiesId: item.propertyId },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        })
      )
    );

    revalidatePath("/admin/inventory");

    return {
      success: true,
      message: "Inventory updated successfully for all order items",
      results,
    };
  } catch (error) {
    console.error("Error processing order inventory:", error);
    throw new Error("Failed to process order inventory");
  }
}

/**
 * Restore inventory quantities (e.g., for cancelled orders)
 * @param orderItems - Array of order items with property IDs and quantities to restore
 * @returns Object indicating success or failure with details
 */
export async function restoreOrderInventory(orderItems: { propertyId: number; quantity: number }[]) {
  try {
    const results = await db.$transaction(
      orderItems.map((item) =>
        db.inventory.update({
          where: { propertiesId: item.propertyId },
          data: {
            quantity: {
              increment: item.quantity,
            },
          },
        })
      )
    );

    revalidatePath("/admin/inventory");

    return {
      success: true,
      message: "Inventory restored successfully for all order items",
      results,
    };
  } catch (error) {
    console.error("Error restoring order inventory:", error);
    throw new Error("Failed to restore inventory");
  }
}

/**
 * Check if a product variant has any pending imports
 * @param propertyId - ID of the product variant (Property)
 * @returns Boolean indicating if there are pending imports
 */
export async function hasPendingImports(propertyId: number) {
  try {
    const pendingImports = await db.inventoryImportItem.findMany({
      where: {
        propertiesId: propertyId,
        import: {
          importStatus: {
            in: ["PENDING", "PROCESSING"],
          },
        },
      },
      include: {
        import: {
          select: {
            id: true,
            importStatus: true,
            reference: true,
          },
        },
      },
    });

    return {
      hasPending: pendingImports.length > 0,
      pendingImports: pendingImports.map((item: any) => ({
        importId: item.import.id,
        importStatus: item.import.importStatus,
        reference: item.import.reference,
        quantity: item.quantity,
      })),
    };
  } catch (error) {
    console.error("Error checking pending imports:", error);
    return { hasPending: false, pendingImports: [] };
  }
}

/**
 * Get inventory history for a product variant
 * @param propertyId - ID of the product variant (Property)
 * @returns Array of import records for this variant
 */
export async function getInventoryHistory(propertyId: number) {
  try {
    const inventory = await db.inventory.findUnique({
      where: { propertiesId: propertyId },
    });

    if (!inventory) {
      return [];
    }

    const importItems = await db.inventoryImportItem.findMany({
      where: {
        inventoryId: inventory.id,
        import: {
          importStatus: "COMPLETED",
        },
      },
      include: {
        import: {
          include: {
            supplier: {
              select: {
                id: true,
                name: true,
              },
            },
            user: {
              select: {
                id: true,
                fullname: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        import: {
          createdAt: "desc",
        },
      },
    });
    return importItems.map((item: any) => ({
      id: item.id,
      importId: item.importId,
      date: item.import.createdAt,
      quantity: item.quantity,
      netPrice: Number(item.netPrice),
      supplier: item.import.supplier.name,
      createdBy: item.import.user.fullname || item.import.user.email,
      reference: item.import.reference,
      warrantyPeriod: item.warrantyPeriod,
      warrantyExpiry: item.warrantyExpiry,
    }));
  } catch (error) {
    console.error("Error fetching inventory history:", error);
    throw new Error("Failed to fetch inventory history");
  }
}
