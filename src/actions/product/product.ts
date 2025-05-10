"use server";
import { ProductSpec } from "@prisma/client";
import { z } from "zod";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import {
  TAddProductFormValues,
  TCartListItemDB,
  TPath,
  TProductListItem,
  TProductPageInfo,
  TSpecification,
} from "@/types/product";
import { parseAttributeHash } from "./helper";

const ValidateAddProduct = z.object({
  name: z.string().min(3),
  brandID: z.string().min(6),
  specialFeatures: z.array(z.string()),
  desc: z.string().optional(),
  richDesc: z.string().optional(), // Add validation for rich description
  images: z.array(z.string()),
  categoryID: z.string().min(6),
  price: z.string().min(1),
  salePrice: z.string(),
  specifications: z.array(
    z.object({
      specGroupID: z.string().min(6),
      specValues: z.array(z.string()),
    })
  ),
});

const convertStringToFloat = (str: string) => {
  str.replace(/,/, ".");
  return str ? parseFloat(str) : 0.0;
};

export const addProduct = async (formData: TAddProductFormValues) => {
  try {
    // Create the new product
    await db.product.create({
      data: {
        name: formData.name,
        desc: formData.desc,
        richDesc: formData.richDesc,
        isAvailable: formData.isAvailable,
        brandID: formData.brandID,
        price: parseFloat(formData.price),
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
        images: formData.images,
        specialFeatures: formData.specialFeatures.filter((feature) => feature.length > 0),
        categoryID: formData.categoryID,
        specifications: formData.specifications,
        fromColor: formData.fromColor, // Add these fields
        toColor: formData.toColor, // Add these fields
      },
    });

    // Revalidate paths to reflect changes
    revalidatePath("/");
    revalidatePath("/admin/products");
    revalidatePath("/list");

    return { res: "success" };
  } catch (error) {
    console.error("Error adding product:", error);
    return { error: "Failed to add product" };
  }
};

export const getAllProducts = async () => {
  try {
    const products = await db.products.findMany({
      include: {
        properties: {
          include: {
            attributeSet: true,
            inventory: true,
          },
        },
        supplier: true,
      },
    });

    const formattedProducts = products.map((product) => {
      return {
        id: product.id,
        sku: product.sku,
        title: product.title,
        supplier: product.supplier?.name || null,
        variants: product.properties.map((prop) => {
          // Parse the attribute hash into key-value pairs
          const attributeDetails = parseAttributeHash(prop.attributeSetHash);

          return {
            id: prop.id,
            attributeSetName: prop.attributeSet.name || "Default",
            attributeDetails, // Include parsed attributes
            net_price: prop.net_price,
            retail_price: prop.retail_price,
            stock: prop.inventory?.quantity || 0,
          };
        }),
      };
    });

    return { success: true, data: formattedProducts };
  } catch (error) {
    console.error("Error fetching products with properties:", error);
    return { success: false, error: "Failed to fetch products" };
  }
};

export const getOneProduct = async (productID: string) => {
  if (!productID || productID === "") return { error: "Invalid Product ID!" };

  try {
    const result = await db.products.findFirst({
      where: {
        id: productID,
      },
      select: {
        id: true,
        name: true,
        desc: true,
        richDesc: true,
        images: true,
        price: true,
        salePrice: true,
        specs: true,
        specialFeatures: true,
        isAvailable: true,
        brandID: true,
        fromColor: true, // Add these fields to ensure they're returned
        toColor: true, // Add these fields to ensure they're returned
        category: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!result) return { error: "Product not found!" };

    // Create a formatted product object with specifications properly formatted
    const formattedProduct = {
      ...result,
      specifications: result.specs || [],
      // Ensure specialFeatures is an array with at least 3 items
      specialFeatures:
        Array.isArray(result.specialFeatures) && result.specialFeatures.length >= 3
          ? result.specialFeatures
          : [...(result.specialFeatures || []), "", "", ""].slice(0, 3),
    };

    return { res: formattedProduct };
  } catch (error) {
    console.error("Get product error:", error);
    return { error: JSON.stringify(error) };
  }
};

export const getCartProducts = async (productIDs: string[]) => {
  if (!productIDs || productIDs.length === 0) return { error: "Invalid Product List" };

  try {
    const result: TCartListItemDB[] | null = await db.product.findMany({
      where: {
        id: { in: productIDs },
      },
      select: {
        id: true,
        name: true,
        images: true,
        price: true,
        salePrice: true,
      },
    });

    if (!result) return { error: "Can't Get Data from Database!" };
    return { res: result };
  } catch (error) {
    return { error: JSON.stringify(error) };
  }
};

export const deleteProduct = async (productID: string) => {
  if (!productID || productID === "") return { error: "Invalid Data!" };
  try {
    const result = await db.product.delete({
      where: {
        id: productID,
      },
    });

    if (!result) return { error: "Can't Delete!" };
    return { res: result };
  } catch (error) {
    return { error: JSON.stringify(error) };
  }
};

export const updateProduct = async (id: string, formData: TAddProductFormValues) => {
  try {
    // Update the product
    const updated = await db.product.update({
      where: { id },
      data: {
        name: formData.name,
        desc: formData.desc,
        richDesc: formData.richDesc,
        isAvailable: formData.isAvailable,
        brandID: formData.brandID,
        price: parseFloat(formData.price),
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
        images: formData.images,
        specialFeatures: formData.specialFeatures.filter((feature) => feature.length > 0),
        categoryID: formData.categoryID,
        specifications: formData.specifications,
        fromColor: formData.fromColor,
        toColor: formData.toColor,
      },
    });

    console.log("Update result:", updated);

    // Revalidate paths to reflect changes
    revalidatePath("/");
    revalidatePath("/admin/products");
    revalidatePath("/list");
    revalidatePath(`/product/${id}`);

    return { res: "success" };
  } catch (error) {
    console.error("Error updating product:", error);
    // Return the specific error message for debugging
    return { error: `Failed to update product: ${error.message}` };
  }
};
