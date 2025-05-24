"use client";

import { useEffect, useState } from "react";
import { getAllCategories, addCategory, updateCategory, deleteCategory, CategoryFormData } from "@/actions/category/category";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash } from "lucide-react";
import Image from "next/image";

interface Category {
  id: number;
  name: string;
  slug: string;
  image: string;
}

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>();
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    slug: "",
    image: "",
  });

  const fetchCategories = async () => {
    setLoading(true);
    const response = await getAllCategories();
    if (response.success) {
      setCategories(response.data);
    } else {
      toast.error(response.error || "Failed to load categories");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await addCategory(formData);
    if (response.success) {
      toast.success("Category added successfully");
      setIsAddModalOpen(false);
      setFormData({ name: "", slug: "", image: "" });
      fetchCategories();
    } else {
      toast.error(response.error || "Failed to add category");
    }
  };

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCategory) return;

    const response = await updateCategory(currentCategory.id, formData);
    if (response.success) {
      toast.success("Category updated successfully");
      setIsEditModalOpen(false);
      setCurrentCategory(null);
      fetchCategories();
    } else {
      toast.error(response.error || "Failed to update category");
    }
  };

  const handleDeleteCategory = async () => {
    if (!currentCategory) return;

    const response = await deleteCategory(currentCategory.id);
    if (response.success) {
      toast.success("Category deleted successfully");
      setIsDeleteModalOpen(false);
      setCurrentCategory(null);
      fetchCategories();
    } else {
      toast.error(response.error || "Failed to delete category");
    }
  };

  const openEditModal = (category: Category) => {
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      image: category.image || "",
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (category: Category) => {
    setCurrentCategory(category);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Category Management</h1>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
          onClick={() => {
            setFormData({ name: "", slug: "", image: "" });
            setIsAddModalOpen(true)
          }}
        >
          <span className="mr-2"><Plus className="h-4 w-4" /></span>
          Add Category
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
                <th className="px-4 py-2 text-left">Image</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Slug</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 border-t">
                    No categories found
                  </td>
                </tr>
              ) : (
                categories?.map((category) => (
                  <tr key={category.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{category.id}</td>
                    <td className="px-4 py-2">
                      {category.image ? (
                        <div className="relative h-10 w-10">
                          <Image
                            src={category.image}
                            alt={category.name}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      ) : (
                        <div className="h-10 w-10 bg-gray-200 rounded" />
                      )}
                    </td>
                    <td className="px-4 py-2">{category.name}</td>
                    <td className="px-4 py-2">{category.slug}</td>
                    <td className="px-4 py-2 text-right">
                      <button
                        className="text-gray-600 hover:text-blue-500 p-1 mx-1"
                        onClick={() => openEditModal(category)}
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        className="text-gray-600 hover:text-red-500 p-1 mx-1"
                        onClick={() => openDeleteModal(category)}
                        aria-label="Delete"
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

      {/* Add Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
            <div className="mb-4">
              <h3 className="text-lg font-medium">Add New Category</h3>
            </div>
            <form onSubmit={handleAddCategory}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">Category Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label htmlFor="slug" className="block text-sm font-medium mb-1">Slug</label>
                  <input
                    id="slug"
                    name="slug"
                    type="text"
                    value={formData.slug}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label htmlFor="image" className="block text-sm font-medium mb-1">Image URL (Optional)</label>
                  <input
                    id="image"
                    name="image"
                    type="text"
                    value={formData.image || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
            <div className="mb-4">
              <h3 className="text-lg font-medium">Edit Category</h3>
            </div>
            <form onSubmit={handleEditCategory}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="edit-name" className="block text-sm font-medium mb-1">Category Name</label>
                  <input
                    id="edit-name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label htmlFor="edit-slug" className="block text-sm font-medium mb-1">Slug</label>
                  <input
                    id="edit-slug"
                    name="slug"
                    type="text"
                    value={formData.slug}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label htmlFor="edit-image" className="block text-sm font-medium mb-1">Image URL (Optional)</label>
                  <input
                    id="edit-image"
                    name="image"
                    type="text"
                    value={formData.image || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Update Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
            <div className="mb-4">
              <h3 className="text-lg font-medium">Delete Category</h3>
            </div>
            <div className="py-4">
              <p>Are you sure you want to delete the category "{currentCategory?.name}"?</p>
              <p className="text-sm text-gray-500 mt-2">
                This action cannot be undone if the category is in use.
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
                onClick={handleDeleteCategory}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminCategories;
