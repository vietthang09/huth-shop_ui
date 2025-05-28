"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash, Save, AlertCircle } from "lucide-react";
import { createInventoryImport } from "@/actions/inventory/import";
import { getSuppliers } from "@/actions/supplier/supplier";
import Button from "@/components/UI/button";
import Input from "@/components/UI/input";
import { useSession } from "next-auth/react";
import {
  CreateInventoryImportDTO,
  CreateInventoryImportItemDTO,
  ImportPaymentStatus,
  ImportStatus,
} from "@/types/inventory";

// Helper function to get product properties with details
async function getProductProperties() {
  try {
    // Using fetch here to make a server request from the client component
    const response = await fetch("/api/inventory/properties");
    if (!response.ok) {
      throw new Error("Failed to fetch product properties");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching properties:", error);
    return { properties: [] };
  }
}

export default function NewImportPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [suppliers, setSuppliers] = useState<{ id: number; name: string }[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    supplierId: number;
    reference: string;
    description: string;
    paymentStatus: ImportPaymentStatus;
    importStatus: ImportStatus;
    items: Array<{
      propertyId: number;
      quantity: number;
      netPrice: number;
      warrantyPeriod?: number;
      notes?: string;
    }>;
  }>({
    supplierId: 0,
    reference: "",
    description: "",
    paymentStatus: ImportPaymentStatus.PENDING,
    importStatus: ImportStatus.DRAFT,
    items: [
      {
        propertyId: 0,
        quantity: 1,
        netPrice: 0,
        warrantyPeriod: undefined,
        notes: "",
      },
    ],
  });

  // Fetch suppliers and properties
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch suppliers
        const suppliersResult = await getSuppliers();
        if (suppliersResult.error) {
          setError(suppliersResult.error);
        } else {
          setSuppliers(suppliersResult.suppliers || []);
          // Set default supplier if available
          if (suppliersResult.suppliers && suppliersResult.suppliers.length > 0) {
            setFormData((prev) => ({ ...prev, supplierId: suppliersResult.suppliers[0].id }));
          }
        }

        // Fetch product properties
        const propertiesResult = await getProductProperties();
        setProperties(propertiesResult.properties || []);

        // Set default property if available
        if (propertiesResult.properties && propertiesResult.properties.length > 0) {
          setFormData((prev) => ({
            ...prev,
            items: [
              {
                ...prev.items[0],
                propertyId: propertiesResult.properties[0].id,
                netPrice: propertiesResult.properties[0].netPrice,
              },
            ],
          }));
        }
      } catch (err) {
        setError("Failed to load data. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update form field
  const updateFormField = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Update item field
  const updateItemField = (index: number, field: string, value: any) => {
    setFormData((prev) => {
      const updatedItems = [...prev.items];
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value,
      };
      return {
        ...prev,
        items: updatedItems,
      };
    });
  };

  // Add new item
  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          propertyId: properties.length > 0 ? properties[0].id : 0,
          quantity: 1,
          netPrice: properties.length > 0 ? properties[0].netPrice : 0,
          warrantyPeriod: undefined,
          notes: "",
        },
      ],
    }));
  };

  // Remove item
  const removeItem = (index: number) => {
    if (formData.items.length === 1) {
      setError("At least one item is required");
      return;
    }

    setFormData((prev) => {
      const updatedItems = [...prev.items];
      updatedItems.splice(index, 1);
      return {
        ...prev,
        items: updatedItems,
      };
    });
  };

  // Calculate total amount
  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      return total + item.quantity * item.netPrice;
    }, 0);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      // Validate form
      if (!formData.supplierId) {
        setError("Please select a supplier");
        setSaving(false);
        return;
      }

      if (formData.items.some((item) => !item.propertyId)) {
        setError("Please select a product for all items");
        setSaving(false);
        return;
      }
      if (!session) {
        return;
      }
      // Prepare data for API
      const importData: CreateInventoryImportDTO = {
        userId: session.user.id, // Assuming current user ID, should be retrieved from auth context
        supplierId: formData.supplierId,
        reference: formData.reference,
        description: formData.description,
        totalAmount: calculateTotal(),
        paymentStatus: formData.paymentStatus,
        importStatus: formData.importStatus,
        importItems: formData.items.map((item) => ({
          propertiesId: item.propertyId,
          quantity: item.quantity,
          netPrice: item.netPrice,
          warrantyPeriod: item.warrantyPeriod,
          notes: item.notes,
        })),
      };

      // Submit the import
      const result = await createInventoryImport(importData);

      // Handle success
      setSuccessMessage("Import created successfully");

      // Redirect to the import details page
      setTimeout(() => {
        router.push(`/admin/inventory/imports/${result.id}`);
      }, 1500);
    } catch (err) {
      console.error("Error creating import:", err);
      setError(err instanceof Error ? err.message : "Failed to create import");
    } finally {
      setSaving(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Find property details by ID
  const getPropertyDetails = (propertyId: number) => {
    return properties.find((p) => p.id === propertyId);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/admin/inventory/imports" className="flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft size={16} className="mr-1" /> Back to Imports
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <h1 className="text-xl font-bold text-gray-900">Create New Inventory Import</h1>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-6 mt-4 flex items-center">
            <AlertCircle size={20} className="mr-2" />
            {error}
          </div>
        )}

        {/* Success message */}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mx-6 mt-4 flex items-center">
            <AlertCircle size={20} className="mr-2" />
            {successMessage}
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 mb-2"></div>
            <p>Loading data...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            {/* Main import details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier*</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={formData.supplierId}
                  onChange={(e) => updateFormField("supplierId", parseInt(e.target.value))}
                  required
                >
                  <option value="">Select a supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
                <Input
                  type="text"
                  placeholder="e.g., INV-2025-001"
                  value={formData.reference}
                  onChange={(e) => updateFormField("reference", e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 min-h-[100px]"
                  placeholder="Optional notes about this import"
                  value={formData.description}
                  onChange={(e) => updateFormField("description", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Import Status</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={formData.importStatus}
                  onChange={(e) => updateFormField("importStatus", e.target.value)}
                >
                  <option value={ImportStatus.DRAFT}>Draft</option>
                  <option value={ImportStatus.PENDING}>Pending</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={formData.paymentStatus}
                  onChange={(e) => updateFormField("paymentStatus", e.target.value)}
                >
                  <option value={ImportPaymentStatus.PENDING}>Pending</option>
                  <option value={ImportPaymentStatus.PARTIALLY_PAID}>Partially Paid</option>
                  <option value={ImportPaymentStatus.PAID}>Paid</option>
                </select>
              </div>
            </div>

            {/* Item list */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Import Items</h2>
                <Button
                  type="button"
                  onClick={addItem}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-1"
                >
                  <Plus size={16} />
                  Add Item
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Net Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Warranty (days)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.items.map((item, index) => {
                      const property = getPropertyDetails(item.propertyId);
                      return (
                        <tr key={index}>
                          <td className="px-4 py-3">
                            <select
                              className="w-full border border-gray-300 rounded-md px-3 py-2"
                              value={item.propertyId}
                              onChange={(e) => {
                                const propertyId = parseInt(e.target.value);
                                const property = getPropertyDetails(propertyId);
                                updateItemField(index, "propertyId", propertyId);
                                // Auto-fill net price if available
                                if (property) {
                                  updateItemField(index, "netPrice", property.netPrice);
                                }
                              }}
                              required
                            >
                              <option value="">Select a product</option>
                              {properties.map((prop) => (
                                <option key={prop.id} value={prop.id}>
                                  {prop.product
                                    ? `${prop.product.title} - ${prop.attributeSet.name}: ${prop.attributeSet.value}`
                                    : `Property ID: ${prop.id}`}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItemField(index, "quantity", parseInt(e.target.value) || 1)}
                              required
                            />
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.netPrice}
                              onChange={(e) => updateItemField(index, "netPrice", parseFloat(e.target.value) || 0)}
                              required
                            />
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              type="number"
                              min="0"
                              placeholder="Optional"
                              value={item.warrantyPeriod || ""}
                              onChange={(e) =>
                                updateItemField(
                                  index,
                                  "warrantyPeriod",
                                  e.target.value ? parseInt(e.target.value) : undefined
                                )
                              }
                            />
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              type="text"
                              placeholder="Optional"
                              value={item.notes || ""}
                              onChange={(e) => updateItemField(index, "notes", e.target.value)}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <Button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="bg-red-600 hover:bg-red-700 p-2"
                              title="Remove item"
                            >
                              <Trash size={16} />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={2} className="px-4 py-3 text-right font-medium">
                        Total Amount:
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-900">{formatCurrency(calculateTotal())}</td>
                      <td colSpan={3}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Form actions */}
            <div className="mt-8 flex justify-end gap-3">
              <Button
                type="button"
                onClick={() => router.push("/admin/inventory/imports")}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
              >
                {saving ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-1"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Import
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
