"use client";

import { useEffect, useState } from "react";
import { getAllTopics, createTopic, updateTopic, deleteTopic } from "@/actions/post";
import { Topic } from "@/types/blog";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash } from "lucide-react";
import Image from "next/image";

interface TopicFormData {
  name: string;
  slug: string;
  image?: string;
}

const AdminTopicsPage = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [formData, setFormData] = useState<TopicFormData>({
    name: "",
    slug: "",
    image: "",
  });

  const fetchTopics = async () => {
    setLoading(true);
    const response = await getAllTopics();
    if (response.success && response.data) {
      setTopics(response.data as Topic[]);
    } else {
      toast.error(response.error || "Failed to load topics");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await createTopic(formData);
    if (response.success) {
      toast.success("Topic added successfully");
      setIsAddModalOpen(false);
      setFormData({ name: "", slug: "", image: "" });
      fetchTopics();
    } else {
      toast.error(response.error || "Failed to add topic");
    }
  };

  const handleEditTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTopic) return;

    const response = await updateTopic(currentTopic.id, formData);
    if (response.success) {
      toast.success("Topic updated successfully");
      setIsEditModalOpen(false);
      setCurrentTopic(null);
      fetchTopics();
    } else {
      toast.error(response.error || "Failed to update topic");
    }
  };

  const handleDeleteTopic = async () => {
    if (!currentTopic) return;

    const response = await deleteTopic(currentTopic.id);
    if (response.success) {
      toast.success("Topic deleted successfully");
      setIsDeleteModalOpen(false);
      setCurrentTopic(null);
      fetchTopics();
    } else {
      toast.error(response.error || "Failed to delete topic");
    }
  };

  const openEditModal = (topic: Topic) => {
    setCurrentTopic(topic);
    setFormData({
      name: topic.name,
      slug: topic.slug,
      image: topic.image || "",
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (topic: Topic) => {
    setCurrentTopic(topic);
    setIsDeleteModalOpen(true);
  };

  const generateSlug = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, "-");
    setFormData((prev) => ({ ...prev, slug }));
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Topics Management</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center gap-2"
        >
          <Plus size={16} />
          <span>Add Topic</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Topic
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Posts Count
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topics.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No topics found. Add a new topic to get started.
                    </td>
                  </tr>
                ) : (
                  topics.map((topic) => (
                    <tr key={topic.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {topic.image && (
                            <div className="flex-shrink-0 h-10 w-10 mr-3">
                              <Image
                                src={topic.image}
                                alt={topic.name}
                                className="h-10 w-10 rounded-md object-cover"
                                width={40}
                                height={40}
                              />
                            </div>
                          )}
                          <div className="text-sm font-medium text-gray-900">{topic.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{topic.slug}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{topic._count?.posts || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(topic)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Edit topic"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(topic)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Delete topic"
                          >
                            <Trash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Topic Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Add New Topic</h2>
            <form onSubmit={handleAddTopic}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Topic Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={(e) => {
                    if (e.target.value && !formData.slug) {
                      generateSlug(e.target.value);
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="slug" className="block text-sm font-medium mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="image" className="block text-sm font-medium mb-1">
                  Image URL (optional)
                </label>
                <input
                  type="text"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Add Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Topic Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Edit Topic</h2>
            <form onSubmit={handleEditTopic}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Topic Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="slug" className="block text-sm font-medium mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="image" className="block text-sm font-medium mb-1">
                  Image URL (optional)
                </label>
                <input
                  type="text"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Update Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
            <p className="mb-6">
              Are you sure you want to delete &quot;{currentTopic?.name}&quot;? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTopic}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
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

export default AdminTopicsPage;
