"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { createBlog } from "@/actions/blog";
import BlogForm from "@/components/admin/blog/blogForm";
import { useEffect, useState } from "react";

const NewBlogPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if the user is authenticated
    if (status === "unauthenticated") {
      router.push("/admin/login");
    } else if (status === "authenticated") {
      setIsLoading(false);
    }
  }, [status, router]);

  const handleSubmit = async (formData: any) => {
    try {
      // Get the author ID from the session
      const authorId = session?.user?.id || undefined;

      // Simply pass the form data and author ID to createBlog
      // The function will handle cases where authorId is undefined
      return await createBlog(formData, authorId);
    } catch (error) {
      console.error("Error creating blog:", error);
      return { error: "Failed to create blog post" };
    }
  };

  if (isLoading || status === "loading") {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-light text-gray-700 mb-6">Create New Blog Post</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-light text-gray-700 mb-6">Create New Blog Post</h1>
      <BlogForm onSubmit={handleSubmit} buttonText="Create Blog Post" />
    </div>
  );
};

export default NewBlogPage;
