"use client";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

import Button from "@/components/UI/button";
import Input from "@/components/UI/input";
import { SignInFormValues, validateCredentials } from "@/actions/auth/auth";

const Login = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState<SignInFormValues>({
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset error
    setError("");

    // Simple validation
    if (!loginData.email || !loginData.password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);

    try {
      const callback = await signIn("credentials", {
        ...loginData,
        redirect: false,
      });

      console.log("SignIn callback:", callback);

      if (callback?.error) {
        setError(callback.error);
        setLoading(false);
        return;
      }

      if (callback?.ok) {
        const session = await validateCredentials(loginData);
        const sessionData = session.user;
        if (sessionData?.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/");
        }
        router.refresh();
      }
    } catch (err) {
      console.error("Error during login:", err);
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-screen justify-center items-center min-h-screen bg-gray-100 py-12">
      <div className="w-5/6 lg:w-[600px] p-8 rounded-lg shadow-md flex flex-col gap-6 bg-white">
        <h1 className="text-2xl font-semibold text-center text-gray-800">Sign In</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">{error}</div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email Address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={loginData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              className="p-3"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              value={loginData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              className="p-3"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded transition-colors"
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>

        <div className="text-center text-gray-600 mt-4">
          Don't have an account?{" "}
          <Link href="/signup" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
