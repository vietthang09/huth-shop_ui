"use client";

import { useEffect, useState } from "react";

import { getAllProducts } from "@/actions/product/product";
import { getTopSellingProducts, updateTopSellingProducts } from "@/actions/product/topSelling";
import TopSellingProductItem from "@/components/admin/topSelling/topSellingProductItem";
import Button from "@/components/UI/button";
import { TProductListItem } from "@/types/product";

const AdminTopSelling = () => {
  const [productsList, setProductsList] = useState<TProductListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    getProductsList();
  }, []);

  const getProductsList = async () => {
    setIsLoading(true);

    // Get all products
    const response = await getAllProducts();

    // Get current top selling products
    const topSellingResponse = await getTopSellingProducts();

    if (response.res) {
      setProductsList(response.res);

      // If we have top selling products, use those for selected products
      if (topSellingResponse.success && topSellingResponse.data) {
        const selectedIds = topSellingResponse.data.map((product) => product.id);
        setSelectedProducts(selectedIds);
      }
    }

    setIsLoading(false);
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSaveTopSelling = async () => {
    setIsSaving(true);
    setSuccessMessage(null);

    // Save the selected products to the database
    const response = await updateTopSellingProducts(selectedProducts);

    if (response.success) {
      setSuccessMessage("Top Selling products updated successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } else {
      setSuccessMessage(`Error: ${response.error || "Failed to update top selling products"}`);
    }

    setIsSaving(false);
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Manage Top Selling Products</h1>
        <div className="flex items-center gap-4">
          {successMessage && <span className="text-green-600">{successMessage}</span>}
          <Button
            onClick={handleSaveTopSelling}
            disabled={isSaving}
            className="bg-bitex-red-500 text-white hover:bg-bitex-red-600"
          >
            {isSaving ? "Saving..." : "Save Top Selling Products"}
          </Button>
        </div>
      </div>

      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">Select products to display in the Top Selling section on the home page.</p>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-12 gap-2 p-3 bg-gray-100 font-medium text-gray-700 border-b">
          <div className="col-span-1">Select</div>
          <div className="col-span-5">Product Name</div>
          <div className="col-span-2">Regular Price</div>
          <div className="col-span-2">Deal Price</div>
          <div className="col-span-2">Category</div>
        </div>
        <div className="max-h-[600px] overflow-y-auto">
          {isLoading ? (
            <div className="p-6 text-center">Loading products...</div>
          ) : productsList.length === 0 ? (
            <div className="p-6 text-center">No products found</div>
          ) : (
            productsList.map((product) => (
              <TopSellingProductItem
                key={product.id}
                product={product}
                isSelected={selectedProducts.includes(product.id)}
                onSelect={() => handleProductSelect(product.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTopSelling;
