"use server";

import { db } from "@/lib/db";
import { ImportPaymentStatus, ImportStatus, ImportSummary } from "@/types/inventory";

/**
 * Get a summary of imports for admin dashboard
 * @returns Object with counts and recent imports
 */
export async function getImportSummary() {
  try {
    // Get count of imports by status
    const importStatusCounts = await Promise.all([
      db.inventoryImport.count({ where: { importStatus: "DRAFT" } }),
      db.inventoryImport.count({ where: { importStatus: "PENDING" } }),
      db.inventoryImport.count({ where: { importStatus: "PROCESSING" } }),
      db.inventoryImport.count({ where: { importStatus: "COMPLETED" } }),
      db.inventoryImport.count({ where: { importStatus: "CANCELLED" } }),
    ]);

    // Get count of imports by payment status
    const paymentStatusCounts = await Promise.all([
      db.inventoryImport.count({ where: { paymentStatus: "PENDING" } }),
      db.inventoryImport.count({ where: { paymentStatus: "PARTIALLY_PAID" } }),
      db.inventoryImport.count({ where: { paymentStatus: "PAID" } }),
      db.inventoryImport.count({ where: { paymentStatus: "CANCELLED" } }),
    ]);

    // Get recent imports
    const recentImports = await db.inventoryImport.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
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
          select: { id: true },
        },
      },
    });

    // Get total value of all completed imports
    const totalImportValue = await db.inventoryImport.aggregate({
      where: { importStatus: "COMPLETED" },
      _sum: { totalAmount: true },
    });

    return {
      statusCounts: {
        draft: importStatusCounts[0],
        pending: importStatusCounts[1],
        processing: importStatusCounts[2],
        completed: importStatusCounts[3],
        cancelled: importStatusCounts[4],
      },
      paymentCounts: {
        pending: paymentStatusCounts[0],
        partiallyPaid: paymentStatusCounts[1],
        paid: paymentStatusCounts[2],
        cancelled: paymentStatusCounts[3],
      },
      recentImports: recentImports.map((imp: any) => ({
        id: imp.id,
        reference: imp.reference,
        supplierName: imp.supplier.name,
        userName: imp.user.fullname || imp.user.email,
        totalAmount: Number(imp.totalAmount),
        itemCount: imp.importItems.length,
        paymentStatus: imp.paymentStatus,
        importStatus: imp.importStatus,
        createdAt: imp.createdAt,
      })) as ImportSummary[],
      totalValue: totalImportValue._sum.totalAmount ? Number(totalImportValue._sum.totalAmount) : 0,
    };
  } catch (error) {
    console.error("Error fetching import summary:", error);
    throw new Error("Failed to fetch import summary");
  }
}

/**
 * Get imports by supplier
 * @param supplierId ID of the supplier
 * @returns Array of imports from this supplier
 */
export async function getImportsBySupplier(supplierId: number) {
  try {
    const imports = await db.inventoryImport.findMany({
      where: { supplierId },
      include: {
        user: {
          select: {
            id: true,
            fullname: true,
            email: true,
          },
        },
        importItems: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return imports.map((imp: any) => ({
      id: imp.id,
      reference: imp.reference,
      userName: imp.user.fullname || imp.user.email,
      totalAmount: Number(imp.totalAmount),
      itemCount: imp.importItems.length,
      paymentStatus: imp.paymentStatus,
      importStatus: imp.importStatus,
      createdAt: imp.createdAt,
    }));
  } catch (error) {
    console.error("Error fetching imports by supplier:", error);
    throw new Error("Failed to fetch imports by supplier");
  }
}

/**
 * Search imports by reference or description
 * @param query Search query string
 * @returns Array of matching imports
 */
export async function searchImports(query: string) {
  try {
    const imports = await db.inventoryImport.findMany({
      where: {
        OR: [
          { reference: { contains: query } },
          { description: { contains: query } },
          { supplier: { name: { contains: query } } },
        ],
      },
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
          select: { id: true },
        },
      },
      orderBy: { createdAt: "desc" },
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
    console.error("Error searching imports:", error);
    throw new Error("Failed to search imports");
  }
}

/**
 * Filter imports by status and date range
 * @param params Filter parameters
 * @returns Array of filtered imports
 */
export async function filterImports({
  importStatus,
  paymentStatus,
  startDate,
  endDate,
}: {
  importStatus?: ImportStatus;
  paymentStatus?: ImportPaymentStatus;
  startDate?: Date;
  endDate?: Date;
}) {
  try {
    const where: any = {};

    if (importStatus) {
      where.importStatus = importStatus;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    const imports = await db.inventoryImport.findMany({
      where,
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
          select: { id: true },
        },
      },
      orderBy: { createdAt: "desc" },
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
    console.error("Error filtering imports:", error);
    throw new Error("Failed to filter imports");
  }
}
