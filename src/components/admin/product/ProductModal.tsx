"use client";

import { useState, useEffect } from "react";
import { addProduct, updateProduct } from "@/actions/product/product";
import { getAllCategories } from "@/actions/category/category";
import { getAttributes } from "@/actions/attribute/attribute";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: {
    id: number;
    sku: string;
    title: string;
    description?: string;
    cardColor?: string;
    categoryId?: number;
    properties: Array<{
      id: number;
      attributeSetHash: string;
      netPrice: number;
      retailPrice: number;
      salePrice?: number | null;
      attributeSet?: Attribute;
    }>;
  };
}

// Add interface for attribute
interface Attribute {
  id: number;
  name: string | null;
  value: string | null;
  unit: string | null;
  propertiesHash: string;
}

// Add interface for attribute with price
interface AttributeWithPrice extends Attribute {
  netPrice: number | "";
  retailPrice: number | "";
  discount: number | "";
}

export default function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
  const isEditMode = !!product;
  const [formData, setFormData] = useState({
    sku: "",
    title: "",
    description: "",
    image: "",
    cardColor: "",
    categoryId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [attributes, setAttributes] = useState<AttributeWithPrice[]>([]);
  const [loadingAttributes, setLoadingAttributes] = useState(false);

  // Add state for selected attributes and their prices
  const [selectedAttributes, setSelectedAttributes] = useState<Set<number>>(new Set());
  const [attributePrices, setAttributePrices] = useState<
    Record<
      number,
      {
        netPrice: number | null;
        retailPrice: number | null;
        discount: number | null;
      }
    >
  >({});
  useEffect(() => {
    const fetchAttributes = async () => {
      setLoadingAttributes(true);
      try {
        const response = await getAttributes();
        if (response.success) {
          // Initialize attributes with empty price fields
          const attributesWithPrice = (response.data || []).map((attr) => ({
            ...attr,
            netPrice: "" as const,
            retailPrice: "" as const,
            discount: "" as const,
          }));

          // Set attributes first
          setAttributes(attributesWithPrice as AttributeWithPrice[]);

          // If in edit mode, match properties with attributes by hash
          if (product && product.properties && product.properties.length > 0) {
            const selectedAttributeIds = new Set<number>();
            const attributePricesData: Record<
              number,
              {
                netPrice: number | null;
                retailPrice: number | null;
                discount: number | null;
              }
            > = {};

            // Create a map of attribute hash to attribute ID for quick lookup
            const hashToAttributeId = new Map<string, number>();
            attributesWithPrice.forEach((attr) => {
              hashToAttributeId.set(attr.propertiesHash, attr.id);
            });

            // Process properties and match them with attributes by hash
            product.properties.forEach((property) => {
              const attributeId = hashToAttributeId.get(property.attributeSetHash);

              if (attributeId) {
                selectedAttributeIds.add(attributeId);

                // Calculate discount percentage if salePrice exists
                let discount = null;
                if (property.salePrice && property.retailPrice > 0) {
                  discount = ((property.retailPrice - property.salePrice) / property.retailPrice) * 100;
                }

                attributePricesData[attributeId] = {
                  netPrice: property.netPrice,
                  retailPrice: property.retailPrice,
                  discount: discount,
                };
              }
            });

            // Update selected attributes and their prices
            setSelectedAttributes(selectedAttributeIds);
            setAttributePrices(attributePricesData);
          }
        } else {
          console.error("Failed to fetch attributes:", response.error);
        }
      } catch (err) {
        console.error("Error fetching attributes:", err);
      } finally {
        setLoadingAttributes(false);
      }
    };
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await getAllCategories();
        if (response.success) {
          setCategories(response.data || []);
        } else {
          console.error("Failed to fetch categories:", response.error);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };

    if (isOpen) {
      fetchCategories();
      fetchAttributes(); // If in edit mode, populate form with existing product data
      if (product) {
        setFormData({
          sku: product.sku || "",
          title: product.title || "",
          description: product.description || "",
          image: product.image || "",
          cardColor: product.cardColor || "",
          categoryId: product.categoryId?.toString() || "",
        });
      } else {
        // Reset form if not in edit mode
        setFormData({
          sku: "",
          title: "",
          description: "",
          image: "",
          cardColor: "",
          categoryId: "",
        });
        setSelectedAttributes(new Set());
        setAttributePrices({});
      }
    }
  }, [isOpen, product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Add handler for attribute selection
  const handleAttributeToggle = (attributeId: number) => {
    setSelectedAttributes((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(attributeId)) {
        newSelection.delete(attributeId);
      } else {
        newSelection.add(attributeId);
      }
      return newSelection;
    });
  }; // Add handler for attribute price change
  const handleAttributePriceChange = (
    attributeId: number,
    priceType: "netPrice" | "retailPrice" | "discount",
    value: string
  ) => {
    const numericValue = value === "" ? "" : parseFloat(value);

    // Update the prices record for submission first - this is what's used for form submission
    setAttributePrices((prev) => {
      const currentPrices = prev[attributeId] || {
        netPrice: null,
        retailPrice: null,
        discount: null,
      };

      return {
        ...prev,
        [attributeId]: {
          ...currentPrices,
          [priceType]: numericValue === "" ? null : (numericValue as number),
        },
      };
    });

    // Also update the attribute in the attributes state for backward compatibility
    // This isn't strictly necessary as our UI now uses attributePrices directly
    setAttributes((prev) =>
      prev.map((attr) => (attr.id === attributeId ? { ...attr, [priceType]: numericValue } : attr))
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Convert IDs to numbers where needed and include attribute prices
      const attributeIds = Array.from(selectedAttributes);

      // Prepare attribute prices data - only include selected attributes
      const attributePricesData = Object.entries(attributePrices)
        .filter(([id]) => selectedAttributes.has(parseInt(id))) // Only include selected attributes
        .map(([id, prices]) => {
          // Find the attribute to get its hash
          const attribute = attributes.find((attr) => attr.id === parseInt(id));
          return {
            attributeId: parseInt(id),
            attributeSetHash: attribute?.propertiesHash || "",
            netPrice: prices.netPrice || 0,
            retailPrice: prices.retailPrice || 0,
            discount: prices.discount || 0,
          };
        })
        .filter((attr) => attr.attributeSetHash); // Only include attributes with valid hash

      const productData = {
        ...formData,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : undefined,
        attributeIds: attributeIds,
        attributePrices: attributePricesData,
      };

      // If in edit mode, update the product; otherwise create a new one
      const response = isEditMode
        ? await updateProduct({
            id: product!.id,
            ...productData,
            attributes: attributePricesData, // For update, use the complete attribute data
          })
        : await addProduct(productData);
      if (response.success) {
        // Reset form and close modal
        setFormData({
          sku: "",
          title: "",
          description: "",
          image: "",
          cardColor: "",
          categoryId: "",
        });
        setSelectedAttributes(new Set());
        setAttributePrices({});
        onClose();
      } else {
        setError(
          response.error
            ? Array.isArray(response.error)
              ? response.error.map((e) => e.message).join(", ")
              : response.error
            : "Failed to create product"
        );
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {" "}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{isEditMode ? "Edit Product" : "Add New Product"}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        {error && <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">
                SKU*
              </label>
              <input
                type="text"
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title*
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                Image URL*
              </label>
              <input
                type="url"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                required
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="cardColor" className="block text-sm font-medium text-gray-700 mb-1">
                Card Color
              </label>
              <input
                type="text"
                id="cardColor"
                name="cardColor"
                value={formData.cardColor}
                onChange={handleChange}
                placeholder="#ffffff or color name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={loadingCategories}
              >
                <option value="">{loadingCategories ? "Loading categories..." : "Select Category"}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Attribute Selection Section */}
          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-semibold mb-3">Select Product Attributes</h3>
            {loadingAttributes ? (
              <p>Loading attributes...</p>
            ) : attributes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Select
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Value
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Unit
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Net Price
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Retail Price
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Discount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attributes.map((attribute) => (
                      <tr
                        key={attribute.id}
                        className={`hover:bg-gray-50 ${selectedAttributes.has(attribute.id) ? "bg-blue-50" : ""}`}
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedAttributes.has(attribute.id)}
                            onChange={() => handleAttributeToggle(attribute.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{attribute.name || "-"}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{attribute.value || "-"}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {attribute.unit || "-"}
                        </td>{" "}
                        {/* Net Price Input */}
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {selectedAttributes.has(attribute.id) && (
                            <div className="flex items-center">
                              <span className="mr-2">$</span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                  attributePrices[attribute.id]?.netPrice !== null
                                    ? attributePrices[attribute.id]?.netPrice
                                    : attribute.netPrice
                                }
                                disabled
                                onChange={(e) => handleAttributePriceChange(attribute.id, "netPrice", e.target.value)}
                                className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="0.00"
                              />
                            </div>
                          )}
                        </td>
                        {/* Retail Price Input */}
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {selectedAttributes.has(attribute.id) && (
                            <div className="flex items-center">
                              <span className="mr-2">$</span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                  attributePrices[attribute.id]?.retailPrice !== null
                                    ? attributePrices[attribute.id]?.retailPrice
                                    : attribute.retailPrice
                                }
                                onChange={(e) =>
                                  handleAttributePriceChange(attribute.id, "retailPrice", e.target.value)
                                }
                                className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="0.00"
                              />
                            </div>
                          )}
                        </td>
                        {/* Discount Input */}
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {selectedAttributes.has(attribute.id) && (
                            <div className="flex items-center">
                              <span className="mr-2">%</span>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="1"
                                value={
                                  attributePrices[attribute.id]?.discount !== null
                                    ? attributePrices[attribute.id]?.discount
                                    : attribute.discount
                                }
                                onChange={(e) => handleAttributePriceChange(attribute.id, "discount", e.target.value)}
                                className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="0"
                              />
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-400 text-yellow-700 p-4 rounded">
                <p>No attributes available. You need to create attributes to add product properties.</p>
                <p className="mt-2">Product properties allow you to define variations like color, size, etc.</p>
              </div>
            )}

            {/* Show count of selected attributes */}
            {attributes.length > 0 && (
              <div className="mt-3 text-sm text-gray-600">
                Selected attributes: <span className="font-medium">{selectedAttributes.size}</span> of{" "}
                {attributes.length}
              </div>
            )}
          </div>

          <div className="flex justify-end mt-6 space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>{" "}
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Saving..." : isEditMode ? "Update Product" : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
