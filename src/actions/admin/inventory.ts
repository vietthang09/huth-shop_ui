"use server";

import { db } from "@/lib/db";

// Types for inventory management
export type ProductInventory = {
  id: number;
  productId: number;
  productTitle: string;
  productSku: string;
  attributeSetHash: string;
  attributes: {
    name: string | null;
    value: string | null;
    unit: string | null;
  };
  netPrice: number;
  retailPrice: number;
  salePrice: number | null;
  quantity: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
};

// Get all products with their inventory information
export async function getAllInventory(): Promise<ProductInventory[]> {
  const properties = await db.property.findMany({
    include: {
      product: {
        select: {
          id: true,
          title: true,
          sku: true,
        },
      },
      attributeSet: true,
      inventory: true,
    },
  });

  return properties.map((property) => {
    const quantity = property.inventory?.quantity || 0;
    let status: "In Stock" | "Low Stock" | "Out of Stock" = "In Stock";

    if (quantity === 0) {
      status = "Out of Stock";
    } else if (quantity < 5) {
      status = "Low Stock";
    }

    return {
      id: property.id,
      productId: property.product.id,
      productTitle: property.product.title,
      productSku: property.product.sku,
      attributeSetHash: property.attributeSetHash,
      attributes: {
        name: property.attributeSet.name,
        value: property.attributeSet.value,
        unit: property.attributeSet.unit,
      },
      netPrice: Number(property.netPrice),
      retailPrice: Number(property.retailPrice),
      salePrice: property.salePrice ? Number(property.salePrice) : null,
      quantity,
      status,
    };
  });
}

// Update inventory quantity
export async function updateInventoryQuantity(propertyId: number, quantity: number): Promise<void> {
  // First check if inventory record exists
  const inventory = await db.inventory.findUnique({
    where: {
      propertiesId: propertyId,
    },
  });

  if (inventory) {
    // Update existing inventory
    await db.inventory.update({
      where: {
        id: inventory.id,
      },
      data: {
        quantity,
      },
    });
  } else {
    // Create new inventory record
    await db.inventory.create({
      data: {
        propertiesId: propertyId,
        quantity,
      },
    });
  }

  // Log the inventory update
  const property = await db.property.findUnique({
    where: {
      id: propertyId,
    },
    include: {
      product: true,
    },
  });

  if (property) {
    await db.log.create({
      data: {
        title: "INVENTORY_UPDATED",
        description: `Inventory updated for product ${property.product.title} (SKU: ${property.product.sku}). New quantity: ${quantity}`,
        productId: property.product.id,
      },
    });
  }
}

// Get low stock products (less than specified threshold)
export async function getLowStockProducts(threshold: number = 5): Promise<ProductInventory[]> {
  const properties = await db.property.findMany({
    include: {
      product: {
        select: {
          id: true,
          title: true,
          sku: true,
        },
      },
      attributeSet: true,
      inventory: true,
    },
    where: {
      inventory: {
        quantity: {
          gt: 0,
          lte: threshold,
        },
      },
    },
  });

  return properties.map((property) => {
    const quantity = property.inventory?.quantity || 0;

    return {
      id: property.id,
      productId: property.product.id,
      productTitle: property.product.title,
      productSku: property.product.sku,
      attributeSetHash: property.attributeSetHash,
      attributes: {
        name: property.attributeSet.name,
        value: property.attributeSet.value,
        unit: property.attributeSet.unit,
      },
      netPrice: Number(property.netPrice),
      retailPrice: Number(property.retailPrice),
      salePrice: property.salePrice ? Number(property.salePrice) : null,
      quantity,
      status: "Low Stock",
    };
  });
}

// Get out of stock products
export async function getOutOfStockProducts(): Promise<ProductInventory[]> {
  const properties = await db.property.findMany({
    include: {
      product: {
        select: {
          id: true,
          title: true,
          sku: true,
        },
      },
      attributeSet: true,
      inventory: true,
    },
    where: {
      OR: [
        {
          inventory: {
            quantity: 0,
          },
        },
        {
          inventory: null,
        },
      ],
    },
  });

  return properties.map((property) => {
    return {
      id: property.id,
      productId: property.product.id,
      productTitle: property.product.title,
      productSku: property.product.sku,
      attributeSetHash: property.attributeSetHash,
      attributes: {
        name: property.attributeSet.name,
        value: property.attributeSet.value,
        unit: property.attributeSet.unit,
      },
      netPrice: Number(property.netPrice),
      retailPrice: Number(property.retailPrice),
      salePrice: property.salePrice ? Number(property.salePrice) : null,
      quantity: 0,
      status: "Out of Stock",
    };
  });
}
