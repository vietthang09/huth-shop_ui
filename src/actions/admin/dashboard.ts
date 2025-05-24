"use server";

import { db } from "@/lib/db";
import { OrderStatus } from "@prisma/client";

// Types for dashboard data
export type DashboardSummary = {
  users: {
    total: number;
    activeUsers: number;
    newUsersThisMonth: number;
  };
  products: {
    total: number;
    outOfStock: number;
    lowStock: number; // Less than 5 in stock
  };
  orders: {
    total: number;
    totalRevenue: number;
    byStatus: {
      [key in OrderStatus]: number;
    };
    thisMonth: number;
    thisMonthRevenue: number;
  };
  categories: {
    total: number;
    topCategories: {
      id: number;
      name: string;
      count: number;
    }[];
  };
  posts: {
    total: number;
    recentPosts: {
      id: number;
      title: string;
      createdAt: Date;
    }[];
  };
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
  // Get current date and first day of current month for filtering
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Get users stats
  const totalUsers = await db.user.count();
  const activeUsers = await db.user.count({ where: { isActive: true } });
  const newUsersThisMonth = await db.user.count({
    where: {
      createdAt: {
        gte: firstDayOfMonth,
      },
    },
  });

  // Get products stats
  const totalProducts = await db.product.count();

  // Get products with inventory info
  const productsWithInventory = await db.property.findMany({
    include: {
      inventory: true,
    },
  });

  const outOfStock = productsWithInventory.filter((p) => p.inventory?.quantity === 0).length;

  const lowStock = productsWithInventory.filter(
    (p) => p.inventory && p.inventory.quantity > 0 && p.inventory.quantity < 5
  ).length;

  // Get orders stats
  const totalOrders = await db.order.count();

  const ordersWithTotal = await db.order.findMany({
    select: {
      total: true,
      status: true,
      createdAt: true,
    },
  });

  const totalRevenue = ordersWithTotal.reduce((sum, order) => sum + Number(order.total), 0);

  // Orders grouped by status
  const ordersByStatus = await db.order.groupBy({
    by: ["status"],
    _count: {
      id: true,
    },
  });

  const byStatus = Object.values(OrderStatus).reduce((acc, status) => {
    acc[status] = ordersByStatus.find((o) => o.status === status)?._count.id || 0;
    return acc;
  }, {} as { [key in OrderStatus]: number });

  // Orders for this month
  const thisMonthOrders = ordersWithTotal.filter((order) => order.createdAt >= firstDayOfMonth);

  const thisMonth = thisMonthOrders.length;
  const thisMonthRevenue = thisMonthOrders.reduce((sum, order) => sum + Number(order.total), 0);

  // Get categories stats
  const totalCategories = await db.category.count();

  const categoriesWithProductCount = await db.category.findMany({
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          products: true,
        },
      },
    },
    orderBy: {
      products: {
        _count: "desc",
      },
    },
    take: 5, // Top 5 categories
  });

  const topCategories = categoriesWithProductCount.map((category) => ({
    id: category.id,
    name: category.name,
    count: category._count.products,
  }));

  // Get posts stats
  const totalPosts = await db.post.count();

  const recentPosts = await db.post.findMany({
    select: {
      id: true,
      title: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5, // Recent 5 posts
  });

  return {
    users: {
      total: totalUsers,
      activeUsers,
      newUsersThisMonth,
    },
    products: {
      total: totalProducts,
      outOfStock,
      lowStock,
    },
    orders: {
      total: totalOrders,
      totalRevenue,
      byStatus,
      thisMonth,
      thisMonthRevenue,
    },
    categories: {
      total: totalCategories,
      topCategories,
    },
    posts: {
      total: totalPosts,
      recentPosts,
    },
  };
}

// Get recent orders for dashboard
export type RecentOrder = {
  id: number;
  userId: number | null;
  userEmail: string | null;
  total: number;
  status: OrderStatus;
  createdAt: Date;
  itemCount: number;
};

export async function getRecentOrders(limit: number = 10): Promise<RecentOrder[]> {
  const orders = await db.order.findMany({
    select: {
      id: true,
      userId: true,
      user: {
        select: {
          email: true,
        },
      },
      total: true,
      status: true,
      createdAt: true,
      orderItems: {
        select: {
          quantity: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });

  return orders.map((order) => ({
    id: order.id,
    userId: order.userId,
    userEmail: order.user?.email || null,
    total: Number(order.total),
    status: order.status,
    createdAt: order.createdAt,
    itemCount: order.orderItems.reduce((sum, item) => sum + item.quantity, 0),
  }));
}

// Get sales data for chart display
export type SalesByDate = {
  date: string;
  revenue: number;
  orders: number;
};

export async function getSalesData(days: number = 30): Promise<SalesByDate[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const orders = await db.order.findMany({
    where: {
      createdAt: {
        gte: startDate,
      },
    },
    select: {
      createdAt: true,
      total: true,
    },
  });

  // Group by date
  const salesByDate: { [date: string]: SalesByDate } = {};

  // Initialize all dates in the range
  for (let i = 0; i <= days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    salesByDate[dateStr] = {
      date: dateStr,
      revenue: 0,
      orders: 0,
    };
  }

  // Fill in the data
  orders.forEach((order) => {
    const dateStr = order.createdAt.toISOString().split("T")[0];
    if (salesByDate[dateStr]) {
      salesByDate[dateStr].revenue += Number(order.total);
      salesByDate[dateStr].orders += 1;
    }
  });

  return Object.values(salesByDate);
}

// Get top selling products
export type TopSellingProduct = {
  id: number;
  title: string;
  sku: string;
  sales: number;
  revenue: number;
};

export async function getTopSellingProducts(limit: number = 5): Promise<TopSellingProduct[]> {
  // This query needs to join across multiple tables
  const orderItems = await db.orderItem.findMany({
    select: {
      property: {
        select: {
          product: {
            select: {
              id: true,
              title: true,
              sku: true,
            },
          },
        },
      },
      quantity: true,
      netPrice: true,
    },
  });

  // Group by product
  const productSales: { [productId: number]: TopSellingProduct } = {};

  orderItems.forEach((item) => {
    if (!item.property.product) return;

    const { id, title, sku } = item.property.product;

    if (!productSales[id]) {
      productSales[id] = {
        id,
        title,
        sku,
        sales: 0,
        revenue: 0,
      };
    }

    productSales[id].sales += item.quantity;
    productSales[id].revenue += Number(item.netPrice) * item.quantity;
  });

  // Sort by sales and take the top N
  return Object.values(productSales)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, limit);
}
