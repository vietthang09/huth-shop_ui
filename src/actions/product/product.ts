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
    const result: TProductListItem[] | null = await db.product.findMany({
      select: {
        id: true,
        name: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!result) return { error: "Can't Get Data from Database!" };
    return { res: result };
  } catch (error) {
    return { error: JSON.stringify(error) };
  }
};

export const getOneProduct = async (productID: string) => {
  if (!productID || productID === "") return { error: "Invalid Product ID!" };

  try {
    const result = await db.product.findFirst({
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
    // Log the formData to check what we're trying to update
    console.log("Updating product with data:", {
      id,
      name: formData.name,
      fromColor: formData.fromColor,
      toColor: formData.toColor,
    });

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

const generateSpecTable = async (rawSpec: ProductSpec[]) => {
  try {
    const specGroupIDs = rawSpec.map((spec) => spec.specGroupID);

    const result = await db.specGroup.findMany({
      where: {
        id: { in: specGroupIDs },
      },
    });
    if (!result || result.length === 0) return null;

    const specifications: TSpecification[] = [];

    rawSpec.forEach((spec) => {
      const groupSpecIndex = result.findIndex((g) => g.id === spec.specGroupID);
      const tempSpecs: { name: string; value: string }[] = [];
      spec.specValues.forEach((s, index) => {
        tempSpecs.push({
          name: result[groupSpecIndex].specs[index] || "",
          value: s || "",
        });
      });

      specifications.push({
        groupName: result[groupSpecIndex].title || "",
        specs: tempSpecs,
      });
    });
    if (specifications.length === 0) return null;

    return specifications;
  } catch {
    return null;
  }
};

const getPathByCategoryID = async (categoryID: string, parentID: string | null) => {
  try {
    if (!categoryID || categoryID === "") return null;
    if (!parentID || parentID === "") return null;
    const result: TPath[] = await db.category.findMany({
      where: {
        OR: [{ id: categoryID }, { id: parentID }, { parentID: null }],
      },
      select: {
        id: true,
        parentID: true,
        name: true,
        url: true,
      },
    });
    if (!result || result.length === 0) return null;

    const path: TPath[] = [];
    let tempCatID: string | null = categoryID;
    let searchCount = 0;

    const generatePath = () => {
      const foundCatIndex = result.findIndex((cat) => cat.id === tempCatID);
      if (foundCatIndex === -1) return;
      path.unshift(result[foundCatIndex]);
      tempCatID = result[foundCatIndex].parentID;
      if (!tempCatID) return;
      searchCount++;
      if (searchCount <= 3) generatePath();
      return;
    };
    generatePath();

    if (!path || path.length === 0) return null;
    return path;
  } catch {
    return null;
  }
};
