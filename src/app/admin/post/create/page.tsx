"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPost } from "@/actions/post";
import { getAllTopics } from "@/actions/post";
import { toast } from "sonner";
import { Topic, TBlogFormValues } from "@/types/blog";
import BlogForm from "@/components/admin/blog/blogForm";
import { Loader2 } from "lucide-react";

const CreatePostPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [formData, setFormData] = useState<TBlogFormValues>({
    title: "",
    slug: "",
    shortText: "",
    content: "",
    imgUrl: "",
    isPublished: false,
  });

  useEffect(() => {
    const fetchTopics = async () => {
      const response = await getAllTopics();
      if (response.success && response.data) {
        setTopics(response.data as Topic[]);
      }
    };

    fetchTopics();
  }, []);

  const handleFormChange = (updatedData: TBlogFormValues) => {
    setFormData(updatedData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert form data to match the PostFormData expected by the createPost function
      const postData = {
        title: formData.title,
        slug: formData.slug,
        shortDescription: formData.shortText,
        content: formData.content,
        cover: formData.imgUrl,
        topicId: formData.topicId,
      };

      // For demo, we'll use userId 1. In a real app, this would come from auth context
      const userId = 1;

      const response = await createPost(postData, userId);

      if (response.success) {
        toast.success("Post created successfully");
        router.push("/admin/post");
      } else {
        toast.error(response.error || "Failed to create post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Create New Post</h1>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="topicSelect" className="block text-sm font-medium mb-2">
              Topic
            </label>
            <select
              id="topicSelect"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.topicId || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  topicId: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
            >
              <option value="">Select a topic</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </div>

          <BlogForm blog={formData} onChange={handleFormChange} />

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => router.push("/admin/post")}
              className="mr-4 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostPage;
