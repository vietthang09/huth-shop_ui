"use client";

import { useEffect, useState } from "react";
import {
  getAttributes,
  createAttribute,
  updateAttribute,
  deleteAttribute,
  getAttributeByHash,
} from "@/actions/attribute/attribute";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash, Search } from "lucide-react";

interface Attribute {
  id: number;
  name: string | null;
  value: string | null;
  unit: string | null;
  propertiesHash: string;
  propertyEntries?: any[];
  _count?: {
    propertyEntries: number;
  };
}

interface AttributeFormData {
  name?: string;
  value?: string;
  unit?: string;
  propertiesHash: string;
}

const AdminAttributes = () => {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentAttribute, setCurrentAttribute] = useState<Attribute | null>(null);
  const [searchHash, setSearchHash] = useState("");
  const [formData, setFormData] = useState<AttributeFormData>({
    name: "",
    value: "",
    unit: "",
    propertiesHash: "",
  });
  const fetchAttributes = async () => {
    setLoading(true);
    const response = await getAttributes();
    if (response.success && response.data) {
      setAttributes(response.data);
    } else {
      const errorMessage = Array.isArray(response.error)
        ? response.error.map((e) => e.message).join(", ")
        : response.error || "Failed to load attributes";
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAttributes();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddAttribute = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await createAttribute(formData);
    if (response.success) {
      toast.success("Attribute added successfully");
      setIsAddModalOpen(false);
      setFormData({ name: "", value: "", unit: "", propertiesHash: "" });
      fetchAttributes();
    } else {
      const errorMessage = Array.isArray(response.error)
        ? response.error.map((e) => e.message).join(", ")
        : response.error || "Failed to add attribute";
      toast.error(errorMessage);
    }
  };

  const handleEditAttribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAttribute) return;

    const response = await updateAttribute(currentAttribute.id, formData);
    if (response.success) {
      toast.success("Attribute updated successfully");
      setIsEditModalOpen(false);
      setCurrentAttribute(null);
      fetchAttributes();
    } else {
      const errorMessage = Array.isArray(response.error)
        ? response.error.map((e) => e.message).join(", ")
        : response.error || "Failed to update attribute";
      toast.error(errorMessage);
    }
  };

  const handleDeleteAttribute = async () => {
    if (!currentAttribute) return;

    const response = await deleteAttribute(currentAttribute.id);
    if (response.success) {
      toast.success("Attribute deleted successfully");
      setIsDeleteModalOpen(false);
      setCurrentAttribute(null);
      fetchAttributes();
    } else {
      const errorMessage = Array.isArray(response.error)
        ? response.error.map((e) => e.message).join(", ")
        : response.error || "Failed to delete attribute";
      toast.error(errorMessage);
    }
  };

  const handleSearchByHash = async () => {
    if (!searchHash.trim()) {
      toast.error("Please enter a properties hash");
      return;
    }
    setLoading(true);
    const response = await getAttributeByHash(searchHash);
    if (response.success && response.data) {
      setAttributes([response.data]);
      toast.success("Attribute found");
    } else {
      const errorMessage = Array.isArray(response.error)
        ? response.error.map((e) => e.message).join(", ")
        : response.error || "Attribute not found";
      toast.error(errorMessage);
      setAttributes([]);
    }
    setLoading(false);
  };

  const resetSearch = () => {
    setSearchHash("");
    fetchAttributes();
  };

  const openEditModal = (attribute: Attribute) => {
    setCurrentAttribute(attribute);
    setFormData({
      name: attribute.name || "",
      value: attribute.value || "",
      unit: attribute.unit || "",
      propertiesHash: attribute.propertiesHash,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (attribute: Attribute) => {
    setCurrentAttribute(attribute);
    setIsDeleteModalOpen(true);
  };

  const openViewModal = (attribute: Attribute) => {
    setCurrentAttribute(attribute);
    setIsViewModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Attribute Management</h1>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
          onClick={() => {
            setFormData({ name: "", value: "", unit: "", propertiesHash: "" });
            setIsAddModalOpen(true);
          }}
        >
          <span className="mr-2">
            <Plus className="h-4 w-4" />
          </span>
          Add Attribute
        </button>
      </div>

      {/* Search Section */}
      <div className="mb-6 flex gap-4 items-end">
        <div className="flex-1">
          <label htmlFor="search-hash" className="block text-sm font-medium mb-1">
            Search by Properties Hash
          </label>
          <input
            id="search-hash"
            type="text"
            value={searchHash}
            onChange={(e) => setSearchHash(e.target.value)}
            placeholder="Enter properties hash to search..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <button
          onClick={handleSearchByHash}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center"
        >
          <Search className="h-4 w-4 mr-2" />
          Search
        </button>
        <button onClick={resetSearch} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
          Reset
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Value</th>
                <th className="px-4 py-2 text-left">Unit</th>
                <th className="px-4 py-2 text-left">Properties Hash</th>
                <th className="px-4 py-2 text-center">Property Count</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {attributes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 border-t">
                    No attributes found
                  </td>
                </tr>
              ) : (
                attributes.map((attribute) => (
                  <tr key={attribute.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{attribute.id}</td>
                    <td className="px-4 py-2">
                      {attribute.name || <span className="text-gray-400 italic">No name</span>}
                    </td>
                    <td className="px-4 py-2">
                      {attribute.value || <span className="text-gray-400 italic">No value</span>}
                    </td>
                    <td className="px-4 py-2">
                      {attribute.unit || <span className="text-gray-400 italic">No unit</span>}
                    </td>
                    <td className="px-4 py-2">
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">{attribute.propertiesHash}</code>
                    </td>
                    <td className="px-4 py-2 text-center">
                      {attribute._count?.propertyEntries || attribute.propertyEntries?.length || 0}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        className="text-gray-600 hover:text-blue-500 p-1 mx-1"
                        onClick={() => openViewModal(attribute)}
                        aria-label="View"
                        title="View Details"
                      >
                        <Search className="h-4 w-4" />
                      </button>
                      <button
                        className="text-gray-600 hover:text-blue-500 p-1 mx-1"
                        onClick={() => openEditModal(attribute)}
                        aria-label="Edit"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        className="text-gray-600 hover:text-red-500 p-1 mx-1"
                        onClick={() => openDeleteModal(attribute)}
                        aria-label="Delete"
                        title="Delete"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Attribute Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
            <div className="mb-4">
              <h3 className="text-lg font-medium">Add New Attribute</h3>
            </div>
            <form onSubmit={handleAddAttribute}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Name (Optional)
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Attribute name"
                  />
                </div>
                <div>
                  <label htmlFor="value" className="block text-sm font-medium mb-1">
                    Value (Optional)
                  </label>
                  <input
                    id="value"
                    name="value"
                    type="text"
                    value={formData.value}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Attribute value"
                  />
                </div>
                <div>
                  <label htmlFor="unit" className="block text-sm font-medium mb-1">
                    Unit (Optional)
                  </label>
                  <input
                    id="unit"
                    name="unit"
                    type="text"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Unit of measurement"
                  />
                </div>
                <div>
                  <label htmlFor="propertiesHash" className="block text-sm font-medium mb-1">
                    Properties Hash *
                  </label>
                  <input
                    id="propertiesHash"
                    name="propertiesHash"
                    type="text"
                    value={formData.propertiesHash}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Properties hash (required)"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-6 space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                  Add Attribute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Attribute Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
            <div className="mb-4">
              <h3 className="text-lg font-medium">Edit Attribute</h3>
            </div>
            <form onSubmit={handleEditAttribute}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="edit-name" className="block text-sm font-medium mb-1">
                    Name (Optional)
                  </label>
                  <input
                    id="edit-name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Attribute name"
                  />
                </div>
                <div>
                  <label htmlFor="edit-value" className="block text-sm font-medium mb-1">
                    Value (Optional)
                  </label>
                  <input
                    id="edit-value"
                    name="value"
                    type="text"
                    value={formData.value}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Attribute value"
                  />
                </div>
                <div>
                  <label htmlFor="edit-unit" className="block text-sm font-medium mb-1">
                    Unit (Optional)
                  </label>
                  <input
                    id="edit-unit"
                    name="unit"
                    type="text"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Unit of measurement"
                  />
                </div>
                <div>
                  <label htmlFor="edit-propertiesHash" className="block text-sm font-medium mb-1">
                    Properties Hash *
                  </label>
                  <input
                    id="edit-propertiesHash"
                    name="propertiesHash"
                    type="text"
                    value={formData.propertiesHash}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Properties hash (required)"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-6 space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                  Update Attribute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Attribute Modal */}
      {isViewModalOpen && currentAttribute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
            <div className="mb-4">
              <h3 className="text-lg font-medium">Attribute Details</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
                <p className="text-sm text-gray-900">{currentAttribute.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <p className="text-sm text-gray-900">
                  {currentAttribute.name || <span className="italic text-gray-400">No name</span>}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                <p className="text-sm text-gray-900">
                  {currentAttribute.value || <span className="italic text-gray-400">No value</span>}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <p className="text-sm text-gray-900">
                  {currentAttribute.unit || <span className="italic text-gray-400">No unit</span>}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Properties Hash</label>
                <p className="text-sm text-gray-900 break-all">
                  <code className="bg-gray-100 px-2 py-1 rounded">{currentAttribute.propertiesHash}</code>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Entries Count</label>
                <p className="text-sm text-gray-900">
                  {currentAttribute._count?.propertyEntries || currentAttribute.propertyEntries?.length || 0}
                </p>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
            <div className="mb-4">
              <h3 className="text-lg font-medium">Delete Attribute</h3>
            </div>
            <div className="py-4">
              <p>Are you sure you want to delete this attribute?</p>
              {currentAttribute && (
                <div className="mt-2 p-3 bg-gray-50 rounded">
                  <p className="text-sm">
                    <strong>ID:</strong> {currentAttribute.id}
                  </p>
                  <p className="text-sm">
                    <strong>Name:</strong> {currentAttribute.name || "No name"}
                  </p>
                  <p className="text-sm">
                    <strong>Hash:</strong> {currentAttribute.propertiesHash}
                  </p>
                </div>
              )}
              <p className="text-sm text-gray-500 mt-2">
                This action cannot be undone if the attribute has associated properties.
              </p>
            </div>
            <div className="flex justify-end mt-6 space-x-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAttribute}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAttributes;
