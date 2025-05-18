"use client";

import { useState, useEffect } from "react";
import { Search, Edit, AlertCircle, PlusCircle, Save, X } from "lucide-react";
import { 
  getAllInventory, 
  updateInventoryQuantity, 
  getLowStockInventory,
  createInventory
} from "@/actions/inventory";
import Button from "@/components/UI/button";
import Input from "@/components/UI/input";
import { InventoryItem } from "@/types/inventory";

export default function InventoryPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editMode, setEditMode] = useState<Record<number, boolean>>({});
  const [editValues, setEditValues] = useState<Record<number, number>>({});
  const [showLowStock, setShowLowStock] = useState(false);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [showAddNew, setShowAddNew] = useState(false);
  const [newInventory, setNewInventory] = useState({
    propertiesId: "",
    quantity: ""
  });
  const [addError, setAddError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch inventory data
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const data = showLowStock 
          ? await getLowStockInventory(lowStockThreshold)
          : await getAllInventory();
        
        setInventoryItems(data);
        setFilteredItems(data);
      } catch (err) {
        setError("Failed to fetch inventory data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [showLowStock, lowStockThreshold]);

  // Handle search
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredItems(inventoryItems);
    } else {
      const filtered = inventoryItems.filter(item => {
        const productName = item.property?.product?.title.toLowerCase() || "";
        const sku = item.property?.product?.sku.toLowerCase() || "";
        const searchLower = searchTerm.toLowerCase();
        
        return productName.includes(searchLower) || sku.includes(searchLower);
      });
      setFilteredItems(filtered);
    }
  }, [searchTerm, inventoryItems]);

  // Handle quantity edit
  const handleEdit = (id: number, currentQuantity: number) => {
    setEditMode({ ...editMode, [id]: true });
    setEditValues({ ...editValues, [id]: currentQuantity });
  };

  // Save edited quantity
  const handleSave = async (id: number) => {
    try {
      const newQuantity = editValues[id];
      await updateInventoryQuantity(id, newQuantity);
      
      // Update local state
      const updatedItems = inventoryItems.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      );
      
      setInventoryItems(updatedItems);
      setFilteredItems(updatedItems.filter(item => {
        if (showLowStock) {
          return item.quantity <= lowStockThreshold;
        }
        return true;
      }));
      
      // Reset edit mode
      const newEditMode = { ...editMode };
      delete newEditMode[id];
      setEditMode(newEditMode);
      
      // Show success message
      setSuccessMessage("Inventory updated successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setError("Failed to update inventory");
      console.error(error);
    }
  };

  // Cancel edit
  const handleCancel = (id: number) => {
    const newEditMode = { ...editMode };
    delete newEditMode[id];
    setEditMode(newEditMode);
  };

  // Handle adding new inventory
  const handleAddNew = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    
    try {
      const propertiesId = parseInt(newInventory.propertiesId);
      const quantity = parseInt(newInventory.quantity);
      
      if (isNaN(propertiesId) || isNaN(quantity)) {
        setAddError("Please enter valid numbers for Property ID and Quantity");
        return;
      }
      
      if (quantity < 0) {
        setAddError("Quantity cannot be negative");
        return;
      }
      
      await createInventory({
        propertiesId,
        quantity
      });
      
      // Refresh inventory data
      const updatedInventory = await getAllInventory();
      setInventoryItems(updatedInventory);
      setFilteredItems(updatedInventory);
      
      // Reset form
      setNewInventory({
        propertiesId: "",
        quantity: ""
      });
      setShowAddNew(false);
      
      // Show success message
      setSuccessMessage("New inventory item added successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setAddError(error.message || "Failed to add inventory item");
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-medium text-gray-800">Inventory Management</h2>
        <div className="flex gap-4">
          <Button 
            className={`${showLowStock ? 'bg-red-50 text-red-600 border-red-200' : ''}`}
            onClick={() => setShowLowStock(!showLowStock)}
          >
            <AlertCircle size={18} className={showLowStock ? 'text-red-500' : ''} />
            {showLowStock ? 'Show All Stock' : 'Show Low Stock'}
          </Button>
          <Button 
            className="bg-blue-50 text-blue-600 border-blue-200"
            onClick={() => setShowAddNew(!showAddNew)}
          >
            <PlusCircle size={18} />
            Add Inventory
          </Button>
        </div>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-md">
          {successMessage}
        </div>
      )}
      
      {/* Search and low stock threshold */}
      <div className="flex justify-between mb-6">
        <div className="relative w-64">
          <Search className="absolute left-3 top-2 text-gray-400" size={20} />
          <Input
            placeholder="Search by product or SKU"
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {showLowStock && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Low Stock Threshold:</label>
            <Input
              type="number"
              className="w-20"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 10)}
              min={1}
            />
          </div>
        )}
      </div>
      
      {/* Add new inventory form */}
      {showAddNew && (
        <div className="mb-6 p-4 border border-blue-200 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-medium text-blue-700 mb-4">Add New Inventory Item</h3>
          {addError && (
            <div className="mb-4 p-2 bg-red-50 text-red-700 border border-red-200 rounded-md">
              {addError}
            </div>
          )}
          <form onSubmit={handleAddNew} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property ID <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Enter property ID"
                value={newInventory.propertiesId}
                onChange={(e) => setNewInventory({...newInventory, propertiesId: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                placeholder="Enter quantity"
                value={newInventory.quantity}
                onChange={(e) => setNewInventory({...newInventory, quantity: e.target.value})}
                min={0}
                required
              />
            </div>
            <div className="flex items-end">
              <Button 
                type="submit" 
                className="bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
              >
                Add Inventory
              </Button>
            </div>
          </form>
          <p className="text-xs text-gray-500 mt-2">
            Note: Make sure the Property ID exists in the system before adding inventory.
          </p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md">
          {error}
        </div>
      )}
      
      {/* Inventory table */}
      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
          <p className="mt-2 text-gray-600">Loading inventory data...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-10 border rounded-lg">
          <p className="text-gray-500">No inventory items found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variant
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {item.property?.product?.title || "Unknown Product"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {item.property?.product?.sku || "N/A"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {item.property?.attributeSet?.name 
                      ? `${item.property.attributeSet.name}: ${item.property.attributeSet.value}` 
                      : "Default"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    {editMode[item.id] ? (
                      <Input
                        type="number"
                        className="w-24 text-center mx-auto"
                        value={editValues[item.id]}
                        onChange={(e) => setEditValues({
                          ...editValues,
                          [item.id]: parseInt(e.target.value) || 0
                        })}
                        min={0}
                      />
                    ) : (
                      <span className={`font-medium ${
                        item.quantity <= lowStockThreshold ? 'text-red-600' : 'text-gray-800'
                      }`}>
                        {item.quantity}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      item.quantity === 0
                        ? 'bg-red-100 text-red-800'
                        : item.quantity <= lowStockThreshold
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {item.quantity === 0
                        ? 'Out of Stock'
                        : item.quantity <= lowStockThreshold
                        ? 'Low Stock'
                        : 'In Stock'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    {editMode[item.id] ? (
                      <div className="flex justify-center gap-2">
                        <Button
                          className="bg-green-50 text-green-600 border-green-200 py-1 px-2"
                          onClick={() => handleSave(item.id)}
                        >
                          <Save size={16} />
                        </Button>
                        <Button
                          className="bg-gray-50 text-gray-600 border-gray-200 py-1 px-2"
                          onClick={() => handleCancel(item.id)}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        className="bg-gray-50 text-gray-600 border-gray-200 py-1 px-2"
                        onClick={() => handleEdit(item.id, item.quantity)}
                      >
                        <Edit size={16} />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}