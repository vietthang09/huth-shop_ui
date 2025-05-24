"use client";

import { useState, useEffect } from "react";
import { getUsers, deleteUser, updateUser, toggleUserActive, countUsers } from "@/actions/users/user";
import type { User } from "@prisma/client";
import Link from "next/link";
import Pagination from "@/components/UI/table/pagination";
import Input from "@/components/UI/input";
import Button from "@/components/UI/button";

type UserWithoutPassword = Omit<User, "password">;

export default function UsersPage() {
  const [users, setUsers] = useState<UserWithoutPassword[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [editData, setEditData] = useState({
    fullname: "",
    email: "",
    role: "",
  });

  const itemsPerPage = 10;

  // Fetch users with pagination
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const skip = (page - 1) * itemsPerPage;

      // Create search filter if searchTerm is not empty
      const where = searchTerm
        ? {
            OR: [
              { email: { contains: searchTerm } },
              { fullname: { contains: searchTerm } },
              { role: { contains: searchTerm } },
            ],
          }
        : {};

      const result = await getUsers({
        skip,
        take: itemsPerPage,
        orderBy: { createdAt: "desc" },
        where,
      });

      setUsers(result);

      // Count total users with the same filter for pagination
      const count = await countUsers(where);
      setTotalUsers(count);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Initial load and when page or search changes
  useEffect(() => {
    fetchUsers();
  }, [page, searchTerm]);

  // Handle user deletion
  const handleDeleteUser = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const success = await deleteUser(id);
        if (success) {
          setUsers(users.filter((user) => user.id !== id));
          // Re-fetch total count
          const count = await countUsers(
            searchTerm
              ? {
                  OR: [
                    { email: { contains: searchTerm } },
                    { fullname: { contains: searchTerm } },
                    { role: { contains: searchTerm } },
                  ],
                }
              : {}
          );
          setTotalUsers(count);
        } else {
          setError("Failed to delete user. Please try again.");
        }
      } catch (err) {
        console.error("Error deleting user:", err);
        setError("Failed to delete user. Please try again.");
      }
    }
  };

  // Handle toggling user active status
  const handleToggleActive = async (id: number) => {
    try {
      const updatedUser = await toggleUserActive(id);
      if (updatedUser) {
        setUsers(users.map((user) => (user.id === id ? { ...user, isActive: !user.isActive } : user)));
      } else {
        setError("Failed to update user status. Please try again.");
      }
    } catch (err) {
      console.error("Error toggling user status:", err);
      setError("Failed to update user status. Please try again.");
    }
  };
  // Set up edit mode
  const handleEdit = (user: UserWithoutPassword) => {
    setEditUserId(user.id);
    setEditData({
      fullname: user.fullname || "",
      email: user.email,
      role: user.role || "",
    });
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditUserId(null);
    setEditData({ fullname: "", email: "", role: "" });
  };

  // Save edited user
  const handleSaveEdit = async () => {
    if (!editUserId) return;

    try {
      const updatedUser = await updateUser(editUserId, editData);
      if (updatedUser) {
        setUsers(users.map((user) => (user.id === editUserId ? { ...user, ...editData } : user)));
        setEditUserId(null);
      } else {
        setError("Failed to update user. Please try again.");
      }
    } catch (err) {
      console.error("Error updating user:", err);
      setError("Failed to update user. Please try again.");
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page when search changes
  };

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Link href="/admin/users/create">
          <Button>Add New User</Button>
        </Link>
      </div>

      {/* Search and filter */}
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search by name, email or role..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full max-w-md"
        />
      </div>

      {/* Error display */}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No users found</p>
        </div>
      ) : (
        <>
          {/* Users table */}
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editUserId === user.id ? (
                        <Input
                          type="text"
                          value={editData.fullname}
                          onChange={(e) => setEditData({ ...editData, fullname: e.target.value })}
                        />
                      ) : (
                        user.fullname || "N/A"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editUserId === user.id ? (
                        <Input
                          type="email"
                          value={editData.email}
                          onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        />
                      ) : (
                        user.email
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editUserId === user.id ? (
                        <select
                          value={editData.role || ""}
                          onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        >
                          <option value="">Select role</option>
                          <option value="admin">Admin</option>
                          <option value="customer">Customer</option>
                          <option value="manager">Manager</option>
                        </select>
                      ) : (
                        user.role || "N/A"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editUserId === user.id ? (
                        <div className="flex space-x-2">
                          <button onClick={handleSaveEdit} className="text-indigo-600 hover:text-indigo-900">
                            Save
                          </button>
                          <button onClick={handleCancelEdit} className="text-gray-600 hover:text-gray-900">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <button onClick={() => handleEdit(user)} className="text-indigo-600 hover:text-indigo-900">
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleActive(user.id)}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            {user.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900">
                            Delete
                          </button>
                          <Link href={`/admin/users/${user.id}`}>
                            <span className="text-blue-600 hover:text-blue-900 cursor-pointer">View</span>
                          </Link>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6">
            <Pagination currentPage={page} totalItems={totalUsers} itemsPerPage={itemsPerPage} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}
