"use server";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { z } from "zod";

// Schema for creating/updating attributes
const attributeSchema = z.object({
    name: z.string().optional(),
    value: z.string().optional(),
    unit: z.string().optional(),
    propertiesHash: z.string(),
});

// Get all attributes
export async function getAttributes() {
    try {
        const attributes = await db.attribute.findMany({
            orderBy: {
                id: "desc",
            },
        });

        return { success: true, data: attributes };
    } catch (error) {
        return { success: false, error: "Failed to fetch attributes." };
    }
}

// Get a specific attribute by ID
export async function getAttributeById(id: number) {
    try {
        const attribute = await db.attribute.findUnique({
            where: { id },
            include: {
                propertyEntries: true,
            },
        });

        if (!attribute) {
            return { success: false, error: "Attribute not found." };
        }

        return { success: true, data: attribute };
    } catch (error) {
        return { success: false, error: "Failed to fetch attribute." };
    }
}

// Get a specific attribute by hash
export async function getAttributeByHash(propertiesHash: string) {
    try {
        const attribute = await db.attribute.findUnique({
            where: { propertiesHash },
            include: {
                propertyEntries: true,
            },
        });

        if (!attribute) {
            return { success: false, error: "Attribute not found." };
        }

        return { success: true, data: attribute };
    } catch (error) {
        return { success: false, error: "Failed to fetch attribute." };
    }
}

// Create a new attribute
export async function createAttribute(data: z.infer<typeof attributeSchema>) {
    try {
        const validatedData = attributeSchema.parse(data);

        const attribute = await db.attribute.create({
            data: validatedData,
        });

        revalidatePath("/admin/attributes");
        return { success: true, data: attribute };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors };
        }

        return { success: false, error: "Failed to create attribute." };
    }
}

// Update an existing attribute
export async function updateAttribute(id: number, data: z.infer<typeof attributeSchema>) {
    try {
        const validatedData = attributeSchema.parse(data);

        const attribute = await db.attribute.update({
            where: { id },
            data: validatedData,
        });

        revalidatePath("/admin/attributes");
        return { success: true, data: attribute };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors };
        }

        return { success: false, error: "Failed to update attribute." };
    }
}

// Delete an attribute
export async function deleteAttribute(id: number) {
    try {
        // Check if attribute has associated properties
        const attribute = await db.attribute.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { propertyEntries: true },
                },
            },
        });

        if (!attribute) {
            return { success: false, error: "Attribute not found." };
        }

        if (attribute._count.propertyEntries > 0) {
            return {
                success: false,
                error: "Cannot delete attribute that is being used by properties. Remove all associated properties first."
            };
        }

        await db.attribute.delete({
            where: { id },
        });

        revalidatePath("/admin/attributes");
        return { success: true };
    } catch (error) {

        return { success: false, error: "Failed to delete attribute." };
    }
}