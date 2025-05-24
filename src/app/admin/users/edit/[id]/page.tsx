"use client";

import { useState, useEffect } from "react";
import { getUserById, updateUser, changeUserPassword } from "@/actions/users/user";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";
import Input from "@/components/UI/input";
import Button from "@/components/UI/button";

export default function EditUserPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [userData, setUserData] = useState({
    fullname: "",
    email: "",
    role: "",
    isActive: true,
  });
  const [passwordData, setPasswordData] = useState({
    password: "",
    confirmPassword: "",
  });

  const userId = Number(params.id);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        // Validate that id is a number
        if (isNaN(userId)) {
          notFound();
        }

        const user = await getUserById(userId);

        if (!user) {
          notFound();
        }

        setUserData({
          fullname: user.fullname || "",
          email: user.email,
          role: user.role || "",
          isActive: user.isActive,
        });
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to load user data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setUserData({ ...userData, [name]: checked });
    } else {
      setUserData({ ...userData, [name]: value });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const validateUserForm = () => {
    if (!userData.email) {
      setError("Email is required.");
      return false;
    }

    if (!userData.email.includes("@")) {
      setError("Please enter a valid email address.");
      return false;
    }

    return true;
  };

  const validatePasswordForm = () => {
    if (!passwordData.password) {
      setError("New password is required.");
      return false;
    }

    if (passwordData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return false;
    }

    if (passwordData.password !== passwordData.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }

    return true;
  };

  const handleUserUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!validateUserForm()) {
      return;
    }

    setSaving(true);

    try {
      const updatedUser = await updateUser(userId, userData);

      if (updatedUser) {
        setSuccessMessage("User information updated successfully.");
      } else {
        setError("Failed to update user information. Please try again.");
      }
    } catch (err) {
      console.error("Error updating user:", err);
      setError("An error occurred while updating user information.");
    } finally {
      setSaving(false);
    }
  };
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!validatePasswordForm()) {
      return;
    }

    setSaving(true);

    try {
      // Since this is an admin updating a user's password, we use updateUser instead of
      // changeUserPassword which would require the current password
      const result = await updateUser(userId, { password: passwordData.password });

      if (result) {
        setSuccessMessage("Password updated successfully.");
        setPasswordData({ password: "", confirmPassword: "" });
      } else {
        setError("Failed to update password. Please try again.");
      }
    } catch (err) {
      console.error("Error updating password:", err);
      setError("An error occurred while updating the password.");
    } finally {
      setSaving(false);
    }
  };

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit User</h1>
        <div className="flex space-x-2">
          <Link href={`/admin/users/${userId}`}>
            <Button variant="secondary">View User</Button>
          </Link>
          <Link href="/admin/users">
            <Button variant="secondary">Back to Users</Button>
          </Link>
        </div>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Information Form */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">User Information</h2>

          <form onSubmit={handleUserUpdate}>
            <div className="space-y-4">
              <div>
                <label htmlFor="fullname" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <Input
                  id="fullname"
                  name="fullname"
                  type="text"
                  value={userData.fullname}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={userData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={userData.role}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                  <option value="">Select role</option>
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  id="isActive"
                  name="isActive"
                  type="checkbox"
                  checked={userData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Active Account
                </label>
              </div>
            </div>

            <div className="mt-6">
              <Button type="submit" disabled={saving} className="w-full flex justify-center items-center">
                {saving && (
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                Update User Information
              </Button>
            </div>
          </form>
        </div>

        {/* Password Update Form */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Change Password</h2>

          <form onSubmit={handlePasswordUpdate}>
            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password <span className="text-red-500">*</span>
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={passwordData.password}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long.</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  className="w-full"
                />
              </div>
            </div>

            <div className="mt-6">
              <Button type="submit" disabled={saving} className="w-full flex justify-center items-center">
                {saving && (
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                Update Password
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
