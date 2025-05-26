import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ImportFilterParams, ImportDashboardSummary, ImportStatus, ImportPaymentStatus } from "@/types/inventory";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    // Parse filter parameters
    const filters: ImportFilterParams = {
      importStatus: (searchParams.get("importStatus") as ImportStatus) || undefined,
      paymentStatus: (searchParams.get("paymentStatus") as ImportPaymentStatus) || undefined,
      startDate: searchParams.get("startDate") ? new Date(searchParams.get("startDate") as string) : undefined,
      endDate: searchParams.get("endDate") ? new Date(searchParams.get("endDate") as string) : undefined,
      supplierId: searchParams.get("supplierId") ? parseInt(searchParams.get("supplierId") as string) : undefined,
      query: searchParams.get("query") || undefined,
    };

    // Build where clause based on filters
    const whereClause: any = {};

    if (filters.importStatus) {
      whereClause.importStatus = filters.importStatus;
    }

    if (filters.paymentStatus) {
      whereClause.paymentStatus = filters.paymentStatus;
    }

    if (filters.supplierId) {
      whereClause.supplierId = filters.supplierId;
    }

    // Date range filter
    if (filters.startDate || filters.endDate) {
      whereClause.createdAt = {};

      if (filters.startDate) {
        whereClause.createdAt.gte = filters.startDate;
      }

      if (filters.endDate) {
        // Set the end date to the end of the day
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        whereClause.createdAt.lte = endDate;
      }
    }

    // Search by reference or description
    if (filters.query) {
      whereClause.OR = [{ reference: { contains: filters.query } }, { description: { contains: filters.query } }];
    }

    // Get import status counts
    const statusCounts = await db.inventoryImport.groupBy({
      by: ["importStatus"],
      where: whereClause,
      _count: true,
    });

    // Get payment status counts
    const paymentCounts = await db.inventoryImport.groupBy({
      by: ["paymentStatus"],
      where: whereClause,
      _count: true,
    });

    // Get total value
    const totalValueResult = await db.inventoryImport.aggregate({
      _sum: {
        totalAmount: true,
      },
      where: whereClause,
    });

    // Get recent imports
    const recentImports = await db.inventoryImport.findMany({
      where: whereClause,
      include: {
        supplier: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            fullname: true,
            email: true,
          },
        },
        _count: {
          select: { importItems: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    // Format the data for the dashboard
    const formatRecentImports = recentImports.map((imp: any) => ({
      id: imp.id,
      reference: imp.reference,
      supplierName: imp.supplier.name,
      userName: imp.user.fullname || imp.user.email,
      totalAmount: Number(imp.totalAmount),
      itemCount: imp._count.importItems,
      paymentStatus: imp.paymentStatus,
      importStatus: imp.importStatus,
      createdAt: imp.createdAt,
    }));

    // Build the dashboard summary
    const dashboard: ImportDashboardSummary = {
      statusCounts: {
        draft: statusCounts.find((s) => s.importStatus === "DRAFT")?._count || 0,
        pending: statusCounts.find((s) => s.importStatus === "PENDING")?._count || 0,
        processing: statusCounts.find((s) => s.importStatus === "PROCESSING")?._count || 0,
        completed: statusCounts.find((s) => s.importStatus === "COMPLETED")?._count || 0,
        cancelled: statusCounts.find((s) => s.importStatus === "CANCELLED")?._count || 0,
      },
      paymentCounts: {
        pending: paymentCounts.find((p) => p.paymentStatus === "PENDING")?._count || 0,
        partiallyPaid: paymentCounts.find((p) => p.paymentStatus === "PARTIALLY_PAID")?._count || 0,
        paid: paymentCounts.find((p) => p.paymentStatus === "PAID")?._count || 0,
        cancelled: paymentCounts.find((p) => p.paymentStatus === "CANCELLED")?._count || 0,
      },
      recentImports: formatRecentImports,
      totalValue: Number(totalValueResult._sum.totalAmount || 0),
    };

    return NextResponse.json({ dashboard });
  } catch (error) {
    console.error("Error fetching import reports:", error);
    return NextResponse.json({ error: "Failed to fetch import reports" }, { status: 500 });
  }
}
