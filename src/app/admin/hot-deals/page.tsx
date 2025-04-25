"use client";

import { useEffect, useState } from "react";

import { getAllProducts, getOneProduct } from "@/actions/product/product";
import { getHotDeals, updateHotDeals } from "@/actions/product/hotdeals";
import HotDealProductItem from "@/components/admin/hotDeal/hotDealProductItem";
import Button from "@/components/UI/button";
import { TProductListItem } from "@/types/product";

const AdminHotDeals = () => {
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
    
    // Get current hot deals
    const hotDealsResponse = await getHotDeals();
    
    if (response.res) {
      setProductsList(response.res);
      
      // If we have hot deals, use those for selected products
      if (hotDealsResponse.success && hotDealsResponse.data) {
        const selectedIds = hotDealsResponse.data.map(deal => deal.id);
        setSelectedProducts(selectedIds);
      } else {
        // Fallback to products with deal prices if no hot deals are set yet
        const currentHotDeals = response.res
          .filter(product => product.dealPrice !== null)
          .map(product => product.id);
        
        setSelectedProducts(currentHotDeals.slice(0, 5)); // Limit to 5 by default
      }
    }
    
    setIsLoading(false);
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSaveHotDeals = async () => {
    setIsSaving(true);
    setSuccessMessage(null);
    
    // Save the selected products to the database
    const response = await updateHotDeals(selectedProducts);
    
    if (response.success) {
      setSuccessMessage("Hot Deals updated successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } else {
      setSuccessMessage(`Error: ${response.error || "Failed to update hot deals"}`);
    }
    
    setIsSaving(false);
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Manage Hot Deals</h1>
        <div className="flex items-center gap-4">
          {successMessage && (
            <span className="text-green-600">{successMessage}</span>
          )}
          <Button 
            onClick={handleSaveHotDeals} 
            disabled={isSaving}
            className="bg-bitex-red-500 text-white hover:bg-bitex-red-600"
          >
            {isSaving ? "Saving..." : "Save Hot Deals"}
          </Button>
        </div>
      </div>
      
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          Select products to display in the Hot Deals section on the home page. 
          Products must have a deal price (sale price) to be eligible.
        </p>
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
              <HotDealProductItem
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

export default AdminHotDeals;
