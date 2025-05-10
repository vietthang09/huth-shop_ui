"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Validation schemas
const signUpSchema = z.object({
  fullName: z.string().optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type SignUpFormValues = z.infer<typeof signUpSchema>;
export type SignInFormValues = z.infer<typeof signInSchema>;

export const registerUser = async (data: SignUpFormValues) => {
  try {
    // Validate input data
    const validationResult = signUpSchema.safeParse(data);
    if (!validationResult.success) {
      return { error: validationResult.error.errors[0].message };
    }

    // Check if user already exists
    const existingUser = await db.users.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return { error: "Email already in use" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await db.users.create({
      data: {
        fullname: data.fullName,
        email: data.email,
        password: hashedPassword,
        role: "admin",
      },
    });

    // Return success without exposing sensitive data
    return { success: true, userId: user.id };
  } catch (error) {
    console.error("Error during registration:", error);
    return { error: "An error occurred during registration" };
  }
};

export const validateCredentials = async (data: SignInFormValues) => {
  try {
    // Validate input data
    const validationResult = signInSchema.safeParse(data);
    if (!validationResult.success) {
      return { error: validationResult.error.errors[0].message };
    }

    // Check if user exists
    const user = await db.users.findUnique({
      where: { email: data.email },
    });

    if (!user || !user.password) {
      return { error: "Invalid credentials" };
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(data.password, user.password);
    if (!passwordMatch) {
      return { error: "Invalid credentials" };
    }

    // Return success with user data (excluding the hashed password)
    const { password: _, ...userData } = user;
    return { success: true, user: userData };
  } catch (error) {
    console.error("Error validating credentials:", error);
    return { error: "An error occurred during authentication" };
  }
};
