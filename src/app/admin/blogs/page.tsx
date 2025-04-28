"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAllBlogs, deleteBlog, toggleBlogPublished } from "@/actions/blog";
import Button from "@/components/UI/button";
import { SK_Box } from "@/components/UI/skeleton";
import { Pagination } from "@/components/UI/table/pagination";

interface Blog {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  createdAt: Date;
  author: {
    name: string | null;
  } | null;
}

const BlogsAdmin = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    loadBlogs(currentPage);
  }, [currentPage]);

  const loadBlogs = async (page: number) => {
    setLoading(true);
    const response = await getAllBlogs(page);

    if ("error" in response) {
      setError(response.error);
    } else {
      setBlogs(response.blogs);
      setTotalPages(response.totalPages);
      setError(null);
    }

    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this blog post? This action cannot be undone.")) {
      setDeletingId(id);
      const response = await deleteBlog(id);

      if ("error" in response) {
        alert(response.error);
      } else {
        // Refresh the list
        loadBlogs(currentPage);
      }

      setDeletingId(null);
    }
  };

  const handleTogglePublished = async (id: string, currentStatus: boolean) => {
    setTogglingId(id);
    const response = await toggleBlogPublished(id, !currentStatus);

    if ("error" in response) {
      alert(response.error);
    } else {
      // Update the local state
      setBlogs(blogs.map((blog) => (blog.id === id ? { ...blog, isPublished: !currentStatus } : blog)));
    }

    setTogglingId(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const paginationList = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-light text-gray-700">Blog Management</h1>
        <Link href="/admin/blogs/new">
          <Button>Create New Blog Post</Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="p-4 border border-gray-200 rounded-md">
              <SK_Box width="100%" height="24px" />
              <div className="mt-2 flex gap-2">
                <SK_Box width="80px" height="16px" />
                <SK_Box width="100px" height="16px" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-500 rounded-md">{error}</div>
      ) : blogs.length === 0 ? (
        <div className="p-4 bg-gray-50 text-gray-500 rounded-md">No blog posts found.</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {blogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{blog.title}</span>
                        <span className="text-xs text-gray-500">{blog.slug}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">{blog.author?.name || "Unknown"}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{new Date(blog.createdAt).toString()}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          blog.isPublished ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {blog.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-sm font-medium space-x-2">
                      <Link
                        href={`/blog/${blog.slug}`}
                        className="text-indigo-600 hover:text-indigo-900"
                        target="_blank"
                      >
                        View
                      </Link>
                      <Link href={`/admin/blogs/edit/${blog.id}`} className="text-blue-600 hover:text-blue-900">
                        Edit
                      </Link>
                      <button
                        onClick={() => handleTogglePublished(blog.id, blog.isPublished)}
                        disabled={togglingId === blog.id}
                        className="text-yellow-600 hover:text-yellow-900 disabled:opacity-50"
                      >
                        {blog.isPublished ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        onClick={() => handleDelete(blog.id)}
                        disabled={deletingId === blog.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              routeBase="/admin/blogs/"
              pagesList={paginationList}
              onChange={handlePageChange}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default BlogsAdmin;
