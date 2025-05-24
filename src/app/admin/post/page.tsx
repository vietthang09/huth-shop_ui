"use client";

import { useEffect, useState } from "react";
import { getAllPosts, deletePost } from "@/actions/post";
import { Post } from "@/types/blog";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash, Eye } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
// Format date helper function
const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const AdminPostsPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const fetchPosts = async (page = 1) => {
    setLoading(true);
    const response = await getAllPosts(page, pageSize);
    if (response.success && response.data) {
      setPosts(response.data as Post[]);
      setTotalPages(response.pagination?.totalPages || 1);
      setCurrentPage(page);
    } else {
      toast.error(response.error || "Failed to load posts");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDeletePost = async () => {
    if (!currentPost) return;

    const response = await deletePost(currentPost.id, currentPost.userId || 1); // Using 1 as fallback userId if not available
    if (response.success) {
      toast.success("Post deleted successfully");
      setIsDeleteModalOpen(false);
      setCurrentPost(null);
      fetchPosts(currentPage);
    } else {
      toast.error(response.error || "Failed to delete post");
    }
  };

  const openDeleteModal = (post: Post) => {
    setCurrentPost(post);
    setIsDeleteModalOpen(true);
  };

  const changePage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    fetchPosts(page);
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Posts Management</h1>
        <Link
          href="/admin/post/create"
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center gap-2"
        >
          <Plus size={16} />
          <span>Add Post</span>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <>
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Topic
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {posts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        No posts found.
                      </td>
                    </tr>
                  ) : (
                    posts.map((post) => (
                      <tr key={post.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {post.cover && (
                              <div className="flex-shrink-0 h-10 w-10 mr-3">
                                <Image
                                  src={post.cover}
                                  alt={post.title}
                                  className="h-10 w-10 rounded-md object-cover"
                                  width={40}
                                  height={40}
                                />
                              </div>
                            )}
                            <div className="text-sm font-medium text-gray-900">{post.title}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{post.topic?.name ?? "No Topic"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {post.user?.fullname ?? "Unknown"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(post.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              className="text-indigo-600 hover:text-indigo-900 p-1"
                              title="View post"
                            >
                              <Eye size={18} />
                            </Link>
                            <Link
                              href={`/admin/post/${post.id}/edit`}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Edit post"
                            >
                              <Pencil size={18} />
                            </Link>
                            <button
                              onClick={() => openDeleteModal(post)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Delete post"
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

          {totalPages > 1 && (
            <div className="flex items-center justify-center mt-6">
              <button
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
                className="mr-2 px-4 py-2 border border-gray-300 rounded-md bg-white disabled:opacity-50"
              >
                Previous
              </button>
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => changePage(page)}
                    className={`px-4 py-2 border rounded-md ${
                      page === currentPage ? "bg-blue-600 text-white" : "border-gray-300 bg-white"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-2 px-4 py-2 border border-gray-300 rounded-md bg-white disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
            <p className="mb-6">
              Are you sure you want to delete &quot;{currentPost?.title}&quot;? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePost}
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

export default AdminPostsPage;
