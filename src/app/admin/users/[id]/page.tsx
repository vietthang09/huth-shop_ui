"use client";

import { useState, useEffect } from "react";
import { getUserWithAllData, logUserActivity } from "@/actions/users/user";
import { notFound } from "next/navigation";
import Link from "next/link";
import Button from "@/components/UI/button";

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"posts" | "orders" | "logs">("orders");

  const userId = Number(params.id);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Validate that id is a number
        if (isNaN(userId)) {
          notFound();
        }

        const userData = await getUserWithAllData(userId);

        if (!userData) {
          notFound();
        }

        setUser(userData);

        // Log this view in activity logs
        await logUserActivity(userId, "USER_DETAILS_VIEWED", `Admin viewed details of user #${userId}`);
      } catch (err) {
        console.error("Error fetching user details:", err);
        setError("Failed to load user details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Details</h1>
        <div className="flex space-x-2">
          <Link href="/admin/users">
            <Button variant="secondary">Back to Users</Button>
          </Link>
          <Link href={`/admin/users/edit/${user.id}`}>
            <Button>Edit User</Button>
          </Link>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-500">Full Name:</span>
                <p className="font-medium">{user.fullname || "N/A"}</p>
              </div>
              <div>
                <span className="text-gray-500">Email:</span>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <span className="text-gray-500">Role:</span>
                <p className="font-medium">{user.role || "N/A"}</p>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Account Information</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-500">User ID:</span>
                <p className="font-medium">{user.id}</p>
              </div>
              <div>
                <span className="text-gray-500">Registered On:</span>
                <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-gray-500">Last Updated:</span>
                <p className="font-medium">{new Date(user.updatedAt).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-gray-500">Last Login:</span>
                <p className="font-medium">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("orders")}
              className={`${
                activeTab === "orders"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Orders ({user.orders.length})
            </button>
            <button
              onClick={() => setActiveTab("posts")}
              className={`${
                activeTab === "posts"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Posts ({user.posts.length})
            </button>
            <button
              onClick={() => setActiveTab("logs")}
              className={`${
                activeTab === "logs"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Activity Logs ({user.logs.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow rounded-lg p-6">
        {activeTab === "orders" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Order History</h2>
            {user.orders.length === 0 ? (
              <p className="text-gray-500">No orders found for this user.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {user.orders.map((order: any) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${Number(order.total).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              order.status === "DELIVERED"
                                ? "bg-green-100 text-green-800"
                                : order.status === "PROCESSING"
                                ? "bg-blue-100 text-blue-800"
                                : order.status === "CANCELLED"
                                ? "bg-red-100 text-red-800"
                                : order.status === "REFUNDED"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link href={`/admin/orders/${order.id}`}>
                            <span className="text-indigo-600 hover:text-indigo-900 cursor-pointer">View Details</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "posts" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">User Posts</h2>
            {user.posts.length === 0 ? (
              <p className="text-gray-500">No posts found for this user.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Topic
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {user.posts.map((post: any) => (
                      <tr key={post.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{post.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {post.topic?.name || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link href={`/admin/posts/${post.id}`}>
                            <span className="text-indigo-600 hover:text-indigo-900 cursor-pointer">View</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "logs" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Activity Logs</h2>
            {user.logs.length === 0 ? (
              <p className="text-gray-500">No activity logs found for this user.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Activity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Related
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {user.logs.map((log: any) => (
                      <tr key={log.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.title || "N/A"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.description
                            ? log.description.length > 50
                              ? `${log.description.substring(0, 50)}...`
                              : log.description
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(log.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.productId ? `Product #${log.productId}` : log.postId ? `Post #${log.postId}` : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
