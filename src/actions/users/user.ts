"use server";

import { db } from "@/lib/db";
import { User } from "@prisma/client";
import bcrypt from "bcrypt";

/**
 * Create a new user
 */
export async function createUser(data: {
  fullname?: string;
  email: string;
  password: string;
  role?: string;
  isActive?: boolean;
}): Promise<Omit<User, "password"> | null> {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(data.password, 10); // Create the user with the hashed password
    const user = await db.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });

    // Return the created user (without exposing the password)
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
}

/**
 * Get a user by ID
 */
export async function getUserById(id: number): Promise<Omit<User, "password"> | null> {
  try {
    const user = await db.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    // Don't expose the password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error("Error getting user by ID:", error);
    return null;
  }
}

/**
 * Get a user by email
 */
export async function getUserByEmail(email: string): Promise<Omit<User, "password"> | null> {
  try {
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    // Don't expose the password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error("Error getting user by email:", error);
    return null;
  }
}

/**
 * Get all users with optional pagination
 */
export async function getUsers(options?: {
  skip?: number;
  take?: number;
  orderBy?: {
    [key: string]: "asc" | "desc";
  };
  where?: any;
}): Promise<Omit<User, "password">[]> {
  try {
    const { skip = 0, take = 10, orderBy = { createdAt: "desc" }, where = {} } = options || {};

    const users = await db.user.findMany({
      skip,
      take,
      orderBy,
      where,
    });

    // Remove passwords from all users
    return users.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  } catch (error) {
    console.error("Error getting users:", error);
    return [];
  }
}

/**
 * Update a user by ID
 */
export async function updateUser(
  id: number,
  data: {
    fullname?: string;
    email?: string;
    password?: string;
    role?: string;
    isActive?: boolean;
  }
): Promise<Omit<User, "password"> | null> {
  try {
    // If password is being updated, hash it
    let updatedData = { ...data };
    if (data.password) {
      updatedData.password = await bcrypt.hash(data.password, 10);
    }

    const user = await db.user.update({
      where: { id },
      data: updatedData,
    });

    // Don't expose the password in the returned data
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error("Error updating user:", error);
    return null;
  }
}

/**
 * Delete a user by ID
 */
export async function deleteUser(id: number): Promise<boolean> {
  try {
    await db.user.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    console.error("Error deleting user:", error);
    return false;
  }
}

/**
 * Update the last login time for a user
 */
export async function updateLastLogin(id: number): Promise<boolean> {
  try {
    await db.user.update({
      where: { id },
      data: {
        lastLogin: new Date(),
      },
    });
    return true;
  } catch (error) {
    console.error("Error updating last login:", error);
    return false;
  }
}

/**
 * Toggle user active status
 */
export async function toggleUserActive(id: number): Promise<Omit<User, "password"> | null> {
  try {
    // First get the current user to check their active status
    const currentUser = await db.user.findUnique({
      where: { id },
      select: { isActive: true },
    });

    if (!currentUser) {
      return null;
    }

    // Toggle the active status
    const user = await db.user.update({
      where: { id },
      data: {
        isActive: !currentUser.isActive,
      },
    });

    // Don't expose the password in the returned data
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error("Error toggling user active status:", error);
    return null;
  }
}

/**
 * Get users with their associated posts
 */
export async function getUsersWithPosts(options?: { skip?: number; take?: number }): Promise<any[]> {
  try {
    const { skip = 0, take = 10 } = options || {};

    const users = await db.user.findMany({
      skip,
      take,
      include: {
        posts: true,
      },
    });

    // Remove passwords from all users
    return users.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  } catch (error) {
    console.error("Error getting users with posts:", error);
    return [];
  }
}

/**
 * Get users with their associated orders
 */
export async function getUsersWithOrders(options?: { skip?: number; take?: number }): Promise<any[]> {
  try {
    const { skip = 0, take = 10 } = options || {};

    const users = await db.user.findMany({
      skip,
      take,
      include: {
        orders: true,
      },
    });

    // Remove passwords from all users
    return users.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  } catch (error) {
    console.error("Error getting users with orders:", error);
    return [];
  }
}

/**
 * Get a user with all their related data (posts, orders, logs)
 */
export async function getUserWithAllData(id: number): Promise<any | null> {
  try {
    const user = await db.user.findUnique({
      where: { id },
      include: {
        posts: true,
        orders: true,
        logs: true,
      },
    });

    if (!user) return null;

    // Don't expose the password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error("Error getting user with all data:", error);
    return null;
  }
}

/**
 * Count total users with optional filtering
 */
export async function countUsers(where?: any): Promise<number> {
  try {
    const count = await db.user.count({
      where: where || undefined,
    });

    return count;
  } catch (error) {
    console.error("Error counting users:", error);
    return 0;
  }
}

/**
 * Check if a user exists by email
 */
export async function userExists(email: string): Promise<boolean> {
  try {
    const count = await db.user.count({
      where: { email },
    });

    return count > 0;
  } catch (error) {
    console.error("Error checking if user exists:", error);
    return false;
  }
}

/**
 * Validate user credentials (for login)
 */
export async function validateUserCredentials(
  email: string,
  password: string
): Promise<{ valid: boolean; user: Omit<User, "password"> | null; message?: string }> {
  try {
    // Find the user by email
    const user = await db.user.findUnique({
      where: { email },
    });

    // If no user found with this email
    if (!user) {
      return { valid: false, user: null, message: "Invalid email or password" };
    }

    // Check if user is active
    if (!user.isActive) {
      return { valid: false, user: null, message: "This account has been deactivated" };
    }

    // Compare the provided password with the stored hash
    const passwordValid = await bcrypt.compare(password, user.password);

    // If password is valid, update the last login time
    if (passwordValid) {
      await updateLastLogin(user.id);

      // Log successful login
      await logUserActivity(user.id, "USER_LOGIN", "User logged in successfully");

      // Don't expose the password
      const { password: userPassword, ...userWithoutPassword } = user;
      return { valid: true, user: userWithoutPassword };
    }

    // Log failed login attempt
    await logUserActivity(user.id, "LOGIN_FAILED", "Failed login attempt");

    return { valid: false, user: null, message: "Invalid email or password" };
  } catch (error) {
    console.error("Error validating user credentials:", error);
    return { valid: false, user: null, message: "An error occurred during login" };
  }
}

/**
 * Change user password
 */
export async function changeUserPassword(
  id: number,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Get the user
    const user = await db.user.findUnique({
      where: { id },
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return { success: false, message: "Current password is incorrect" };
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password
    await db.user.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
    });

    return { success: true, message: "Password changed successfully" };
  } catch (error) {
    console.error("Error changing user password:", error);
    return { success: false, message: "An error occurred while changing the password" };
  }
}

/**
 * Generate a password reset token for a user (would typically be used with an email service)
 * Note: This is a simplified version and would need to be expanded with actual token storage and email integration
 */
export async function requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
  try {
    // Check if user exists
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists or not for security reasons
      return { success: true, message: "If the email exists, a reset link will be sent" };
    }

    // In a real implementation, you would:
    // 1. Generate a secure token
    // 2. Store it in a database with an expiry
    // 3. Send an email with a reset link containing the token
    // For this example, we'll just return success

    return { success: true, message: "If the email exists, a reset link will be sent" };
  } catch (error) {
    console.error("Error requesting password reset:", error);
    return { success: false, message: "An error occurred while processing your request" };
  }
}

/**
 * Create a log entry for user activity
 */
export async function logUserActivity(
  userId: number,
  title: string,
  description?: string,
  relatedData?: {
    productId?: number;
    postId?: number;
  }
): Promise<boolean> {
  try {
    await db.log.create({
      data: {
        userId,
        title,
        description,
        productId: relatedData?.productId,
        postId: relatedData?.postId,
      },
    });

    return true;
  } catch (error) {
    console.error("Error logging user activity:", error);
    return false;
  }
}
