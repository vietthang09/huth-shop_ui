"use server";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { z } from "zod";

// Define the property input schema for validation
const propertySchema = z.object({
    productId: z.number().int().positive(),
    attributeSetHash: z.string().min(1),
    netPrice: z.number().nonnegative(),
    retailPrice: z.number().nonnegative(),
    salePrice: z.number().nonnegative().optional().nullable(),
});

// Interface for property data
export interface PropertyData {
    id?: number;
    productId: number;
    attributeSetHash: string;
    netPrice: number;
    retailPrice: number;
    salePrice?: number | null;
}

// Create a new property
export async function createProperty(data: PropertyData) {
    try {
        const validatedData = propertySchema.parse(data);

        const property = await db.property.create({
            data: {
                productId: validatedData.productId,
                attributeSetHash: validatedData.attributeSetHash,
                netPrice: validatedData.netPrice,
                retailPrice: validatedData.retailPrice,
                salePrice: validatedData.salePrice || null,
            },
        });

        revalidatePath("/admin/properties");
        revalidatePath(`/admin/products/${property.productId}`);

        return { success: true, data: property };
    } catch (error) {
        console.error("[CREATE_PROPERTY_ERROR]", error);
        return { success: false, error: "Failed to create property" };
    }
}

// Get a property by ID
export async function getProperty(id: number) {
    try {
        const property = await db.property.findUnique({
            where: { id },
            include: {
                product: true,
                attributeSet: true,
                inventory: true,
            },
        });

        if (!property) {
            return { success: false, error: "Property not found" };
        }

        return { success: true, data: property };
    } catch (error) {
        console.error("[GET_PROPERTY_ERROR]", error);
        return { success: false, error: "Failed to get property" };
    }
}

// Get properties by product ID
export async function getPropertiesByProduct(productId: number) {
    try {
        const properties = await db.property.findMany({
            where: { productId },
            include: {
                attributeSet: true,
                inventory: true,
            },
            orderBy: { createdAt: "desc" },
        });

        return { success: true, data: properties };
    } catch (error) {
        console.error("[GET_PROPERTIES_BY_PRODUCT_ERROR]", error);
        return { success: false, error: "Failed to get properties" };
    }
}

// Update a property
export async function updateProperty(id: number, data: Partial<PropertyData>) {
    try {
        const existingProperty = await db.property.findUnique({
            where: { id },
        });

        if (!existingProperty) {
            return { success: false, error: "Property not found" };
        }

        const property = await db.property.update({
            where: { id },
            data: {
                netPrice: data.netPrice !== undefined ? data.netPrice : undefined,
                retailPrice: data.retailPrice !== undefined ? data.retailPrice : undefined,
                salePrice: data.salePrice !== undefined ? data.salePrice : undefined,
            },
        });

        revalidatePath("/admin/properties");
        revalidatePath(`/admin/products/${property.productId}`);

        return { success: true, data: property };
    } catch (error) {
        console.error("[UPDATE_PROPERTY_ERROR]", error);
        return { success: false, error: "Failed to update property" };
    }
}

// Delete a property
export async function deleteProperty(id: number) {
    try {
        const property = await db.property.findUnique({
            where: { id },
        });

        if (!property) {
            return { success: false, error: "Property not found" };
        }

        const productId = property.productId;

        await db.property.delete({
            where: { id },
        });

        revalidatePath("/admin/properties");
        revalidatePath(`/admin/products/${productId}`);

        return { success: true };
    } catch (error) {
        console.error("[DELETE_PROPERTY_ERROR]", error);
        return { success: false, error: "Failed to delete property" };
    }
}

// Update property inventory
export async function updatePropertyInventory(propertyId: number, quantity: number) {
    try {
        const property = await db.property.findUnique({
            where: { id: propertyId },
            include: { inventory: true },
        });

        if (!property) {
            return { success: false, error: "Property not found" };
        }

        // If inventory exists, update it; otherwise, create it
        if (property.inventory) {
            await db.inventory.update({
                where: { propertiesId: propertyId },
                data: { quantity },
            });
        } else {
            await db.inventory.create({
                data: {
                    propertiesId: propertyId,
                    quantity,
                },
            });
        }

        revalidatePath("/admin/properties");
        revalidatePath(`/admin/products/${property.productId}`);

        return { success: true };
    } catch (error) {
        console.error("[UPDATE_PROPERTY_INVENTORY_ERROR]", error);
        return { success: false, error: "Failed to update inventory" };
    }
}
