"use server";

import { db } from "@/lib/db";
import { ImportStatus } from "@/types/inventory";

/**
 * Generate a report of inventory imports by period
 * @param startDate Start date for the report period
 * @param endDate End date for the report period
 * @returns Report data
 */
export async function generateImportReport(startDate: Date, endDate: Date) {
  try {
    // Get all completed imports in the period
    const imports = await db.inventoryImport.findMany({
      where: {
        importStatus: "COMPLETED",
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
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
        importItems: {
          include: {
            property: {
              include: {
                product: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Calculate total amount by supplier
    const supplierTotals: Record<string, { supplierId: number; name: string; total: number; count: number }> = {};

    // Calculate product category totals
    const productTotals: Record<string, { quantity: number; value: number }> = {};

    // Get daily import totals
    const dailyTotals: Record<string, number> = {};

    let totalImportValue = 0;
    let totalImportItems = 0;

    imports.forEach((imp) => {
      // Add to supplier totals
      if (!supplierTotals[imp.supplierId]) {
        supplierTotals[imp.supplierId] = {
          supplierId: imp.supplierId,
          name: imp.supplier.name,
          total: 0,
          count: 0,
        };
      }
      supplierTotals[imp.supplierId].total += Number(imp.totalAmount);
      supplierTotals[imp.supplierId].count += 1;

      // Add to daily totals
      const dateKey = imp.createdAt.toISOString().split("T")[0];
      if (!dailyTotals[dateKey]) {
        dailyTotals[dateKey] = 0;
      }
      dailyTotals[dateKey] += Number(imp.totalAmount);

      // Add to product totals
      imp.importItems.forEach((item) => {
        const productName = item.property.product.title;
        if (!productTotals[productName]) {
          productTotals[productName] = {
            quantity: 0,
            value: 0,
          };
        }
        productTotals[productName].quantity += item.quantity;
        productTotals[productName].value += Number(item.netPrice) * item.quantity;

        // Add to totals
        totalImportItems += item.quantity;
        totalImportValue += Number(item.netPrice) * item.quantity;
      });
    });

    return {
      period: {
        startDate,
        endDate,
      },
      summary: {
        totalImports: imports.length,
        totalImportValue,
        totalImportItems,
        averageImportValue: imports.length > 0 ? totalImportValue / imports.length : 0,
      },
      supplierAnalysis: Object.values(supplierTotals).sort((a, b) => b.total - a.total),
      productAnalysis: Object.entries(productTotals)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.value - a.value),
      dailyTrends: Object.entries(dailyTotals)
        .map(([date, value]) => ({ date, value }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    };
  } catch (error) {
    console.error("Error generating import report:", error);
    throw new Error("Failed to generate import report");
  }
}

/**
 * Get import statistics for dashboard
 * @returns Summary statistics for dashboard display
 */
export async function getImportStatistics() {
  try {
    // Get counts for each status
    const statusCounts = await Promise.all([
      db.inventoryImport.count({ where: { importStatus: "DRAFT" } }),
      db.inventoryImport.count({ where: { importStatus: "PENDING" } }),
      db.inventoryImport.count({ where: { importStatus: "PROCESSING" } }),
      db.inventoryImport.count({ where: { importStatus: "COMPLETED" } }),
      db.inventoryImport.count({ where: { importStatus: "CANCELLED" } }),
    ]);

    // Get total value of imports in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentImportsValue = await db.inventoryImport.aggregate({
      where: {
        importStatus: "COMPLETED",
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    // Get top suppliers by import value
    const topSuppliers = await db.supplier.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            inventoryImports: {
              where: {
                importStatus: "COMPLETED",
              },
            },
          },
        },
        inventoryImports: {
          where: {
            importStatus: "COMPLETED",
          },
          select: {
            totalAmount: true,
          },
        },
      },
      orderBy: {
        inventoryImports: {
          _count: "desc",
        },
      },
    });

    return {
      statusCounts: {
        draft: statusCounts[0],
        pending: statusCounts[1],
        processing: statusCounts[2],
        completed: statusCounts[3],
        cancelled: statusCounts[4],
      },
      recentValue: recentImportsValue._sum.totalAmount ? Number(recentImportsValue._sum.totalAmount) : 0,
      topSuppliers: topSuppliers
        .map((supplier) => ({
          id: supplier.id,
          name: supplier.name,
          importCount: supplier._count.inventoryImports,
          totalValue: supplier.inventoryImports.reduce((sum, imp) => sum + Number(imp.totalAmount), 0),
        }))
        .sort((a, b) => b.totalValue - a.totalValue),
    };
  } catch (error) {
    console.error("Error fetching import statistics:", error);
    throw new Error("Failed to fetch import statistics");
  }
}
