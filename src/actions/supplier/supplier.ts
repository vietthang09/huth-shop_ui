"use server";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { z } from "zod";

// Validation schemas
const CreateSupplierSchema = z.object({
    name: z.string().min(1, { message: "Supplier name is required" }),
});

const UpdateSupplierSchema = z.object({
    id: z.number(),
    name: z.string().min(1, { message: "Supplier name is required" }),
});

const DeleteSupplierSchema = z.object({
    id: z.number(),
});

// Create a new supplier
export async function createSupplier(data: z.infer<typeof CreateSupplierSchema>) {
    try {
        const validatedData = CreateSupplierSchema.parse(data);

        // Check if supplier with the same name already exists
        const existingSupplier = await db.supplier.findUnique({
            where: { name: validatedData.name }
        });

        if (existingSupplier) {
            return { error: "Supplier with this name already exists" };
        }

        await db.supplier.create({
            data: {
                name: validatedData.name,
            },
        });

        revalidatePath("/admin/suppliers");
        return { success: "Supplier created successfully" };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { error: error.errors[0].message };
        }
        return { error: "Failed to create supplier" };
    }
}

// Update an existing supplier
export async function updateSupplier(data: z.infer<typeof UpdateSupplierSchema>) {
    try {
        const validatedData = UpdateSupplierSchema.parse(data);

        // Check if supplier exists
        const existingSupplier = await db.supplier.findUnique({
            where: { id: validatedData.id }
        });

        if (!existingSupplier) {
            return { error: "Supplier not found" };
        }

        // Check if name is being changed and if it conflicts with another supplier
        if (existingSupplier.name !== validatedData.name) {
            const nameConflict = await db.supplier.findUnique({
                where: { name: validatedData.name }
            });

            if (nameConflict) {
                return { error: "Another supplier with this name already exists" };
            }
        }

        await db.supplier.update({
            where: { id: validatedData.id },
            data: {
                name: validatedData.name,
            },
        });

        revalidatePath("/admin/suppliers");
        return { success: "Supplier updated successfully" };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { error: error.errors[0].message };
        }
        return { error: "Failed to update supplier" };
    }
}

// Delete a supplier
export async function deleteSupplier(data: z.infer<typeof DeleteSupplierSchema>) {
    try {
        const validatedData = DeleteSupplierSchema.parse(data);

        // Check if supplier exists
        const existingSupplier = await db.supplier.findUnique({
            where: { id: validatedData.id },
            include: { products: true }
        });

        if (!existingSupplier) {
            return { error: "Supplier not found" };
        }

        // Check if supplier has products
        if (existingSupplier.products.length > 0) {
            return { error: "Cannot delete supplier with associated products" };
        }

        await db.supplier.delete({
            where: { id: validatedData.id },
        });

        revalidatePath("/admin/suppliers");
        return { success: "Supplier deleted successfully" };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { error: error.errors[0].message };
        }
        return { error: "Failed to delete supplier" };
    }
}

// Get all suppliers
export async function getSuppliers(query = "") {
    try {
        const suppliers = await db.supplier.findMany({
            where: query ? {
                name: {
                    contains: query,
                },
            } : undefined,
            orderBy: {
                name: "asc"
            },
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });

        return { suppliers };
    } catch (error) {
        return { error: "Failed to fetch suppliers" };
    }
}

// Get a single supplier by ID
export async function getSupplierById(id: number) {
    try {
        const supplier = await db.supplier.findUnique({
            where: { id },
            include: {
                products: true,
            }
        });

        if (!supplier) {
            return { error: "Supplier not found" };
        }

        return { supplier };
    } catch (error) {
        return { error: "Failed to fetch supplier" };
    }
}