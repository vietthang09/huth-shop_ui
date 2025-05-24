"use client";

import { useState } from "react";
import { createUser, userExists } from "@/actions/users/user";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/components/UI/input";
import Button from "@/components/UI/button";

export default function CreateUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "customer", // Default role
    isActive: true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setUserData({ ...userData, [name]: checked });
    } else {
      setUserData({ ...userData, [name]: value });
    }
  };

  const validateForm = () => {
    if (!userData.email || !userData.password) {
      setError("Email and password are required.");
      return false;
    }

    if (!userData.email.includes("@")) {
      setError("Please enter a valid email address.");
      return false;
    }

    if (userData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return false;
    }

    if (userData.password !== userData.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Check if email already exists
      const exists = await userExists(userData.email);
      if (exists) {
        setError("A user with this email already exists.");
        setLoading(false);
        return;
      }

      // Create user (exclude confirmPassword from the data)
      const { confirmPassword, ...userDataToSave } = userData;
      const user = await createUser(userDataToSave);

      if (user) {
        router.push("/admin/users");
      } else {
        setError("Failed to create user. Please try again.");
      }
    } catch (err) {
      console.error("Error creating user:", err);
      setError("An error occurred while creating the user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Create New User</h1>
        <Link href="/admin/users">
          <Button variant="secondary">Cancel</Button>
        </Link>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={userData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                  className="w-full"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long.</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={userData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm password"
                  className="w-full"
                  required
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Button type="submit" disabled={loading} className="flex items-center">
              {loading && (
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              Create User
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
