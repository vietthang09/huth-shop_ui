"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Validation schemas
const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
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
    const existingUser = await db.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return { error: "Email already in use" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        hashedPassword,
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
    const user = await db.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !user.hashedPassword) {
      return { error: "Invalid credentials" };
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(data.password, user.hashedPassword);
    if (!passwordMatch) {
      return { error: "Invalid credentials" };
    }

    // Return success with user data (excluding the hashed password)
    const { hashedPassword: _, ...userData } = user;
    return { success: true, user: userData };
  } catch (error) {
    console.error("Error validating credentials:", error);
    return { error: "An error occurred during authentication" };
  }
};
