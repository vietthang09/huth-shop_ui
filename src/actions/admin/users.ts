"use server";

import { db } from "@/lib/db";

// Types for user management
export type UserWithStats = {
  id: number;
  fullname: string | null;
  email: string;
  role: string | null;
  isActive: boolean;
  createdAt: Date;
  lastLogin: Date | null;
  orderCount: number;
  totalSpent: number;
};

// Get all users with their stats
export async function getUsersWithStats(): Promise<UserWithStats[]> {
  const users = await db.user.findMany({
    include: {
      orders: {
        select: {
          total: true,
        },
      },
      _count: {
        select: {
          orders: true,
        },
      },
    },
  });

  return users.map((user) => ({
    id: user.id,
    fullname: user.fullname,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
    orderCount: user._count.orders,
    totalSpent: user.orders.reduce((sum, order) => sum + Number(order.total), 0),
  }));
}

// Update user status (active/inactive)
export async function updateUserStatus(userId: number, isActive: boolean): Promise<void> {
  await db.user.update({
    where: { id: userId },
    data: { isActive },
  });
}

// Update user role
export async function updateUserRole(userId: number, role: string): Promise<void> {
  await db.user.update({
    where: { id: userId },
    data: { role },
  });
}

// Types for system logs
export type SystemLog = {
  id: number;
  userId: number | null;
  userEmail: string | null;
  title: string | null;
  description: string | null;
  relatedTo: string | null; // 'product', 'post', 'user', etc.
  relatedId: number | null;
  relatedName: string | null;
  createdAt: Date;
};

// Get recent system logs
export async function getRecentLogs(limit: number = 50): Promise<SystemLog[]> {
  const logs = await db.log.findMany({
    select: {
      id: true,
      userId: true,
      user: {
        select: {
          email: true,
        },
      },
      title: true,
      description: true,
      productId: true,
      product: {
        select: {
          title: true,
        },
      },
      postId: true,
      post: {
        select: {
          title: true,
        },
      },
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });

  return logs.map((log) => {
    let relatedTo: string | null = null;
    let relatedId: number | null = null;
    let relatedName: string | null = null;

    if (log.productId) {
      relatedTo = "product";
      relatedId = log.productId;
      relatedName = log.product?.title || null;
    } else if (log.postId) {
      relatedTo = "post";
      relatedId = log.postId;
      relatedName = log.post?.title || null;
    } else if (log.userId) {
      relatedTo = "user";
      relatedId = log.userId;
    }

    return {
      id: log.id,
      userId: log.userId,
      userEmail: log.user?.email || null,
      title: log.title,
      description: log.description,
      relatedTo,
      relatedId,
      relatedName,
      createdAt: log.createdAt,
    };
  });
}

// Create a new system log
export async function createSystemLog({
  userId,
  title,
  description,
  productId,
  postId,
}: {
  userId?: number;
  title: string;
  description?: string;
  productId?: number;
  postId?: number;
}): Promise<void> {
  await db.log.create({
    data: {
      userId: userId || null,
      title,
      description: description || null,
      productId: productId || null,
      postId: postId || null,
    },
  });
}
