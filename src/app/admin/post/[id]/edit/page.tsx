"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPostById, updatePost, getAllTopics } from "@/actions/post";
import { toast } from "sonner";
import { Post, Topic, TBlogFormValues } from "@/types/blog";
import BlogForm from "@/components/admin/blog/blogForm";
import { Loader2 } from "lucide-react";

interface EditPostPageProps {
  params: {
    id: string;
  };
}

const EditPostPage = ({ params }: EditPostPageProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [post, setPost] = useState<Post | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [formData, setFormData] = useState<TBlogFormValues>({
    title: "",
    slug: "",
    shortText: "",
    content: "",
    imgUrl: "",
    isPublished: true,
  });

  const postId = parseInt(params.id, 10);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [postResponse, topicsResponse] = await Promise.all([getPostById(postId), getAllTopics()]);
        if (postResponse.success && postResponse.data) {
          // We need to explicitly cast the data to Post type with empty logs array if needed
          const postData = postResponse.data as any;
          setPost({
            ...postData,
            logs: [], // Default empty array for logs if not available
          } as Post);

          setFormData({
            title: postData.title,
            slug: postData.slug,
            shortText: postData.shortDescription || "",
            content: postData.content || "",
            imgUrl: postData.cover || "",
            isPublished: true, // Assuming all existing posts are published
            topicId: postData.topicId || undefined,
          });
        } else {
          toast.error(postResponse.error || "Failed to load post");
          router.push("/admin/post");
        }

        if (topicsResponse.success && topicsResponse.data) {
          setTopics(topicsResponse.data as Topic[]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("An unexpected error occurred");
        router.push("/admin/post");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [postId, router]);

  const handleFormChange = (updatedData: TBlogFormValues) => {
    setFormData(updatedData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Convert form data to match the PostFormData expected by the updatePost function
      const postData = {
        title: formData.title,
        slug: formData.slug,
        shortDescription: formData.shortText,
        content: formData.content,
        cover: formData.imgUrl,
        topicId: formData.topicId,
      };

      // For demo, we'll use userId 1 or keep the existing one. In a real app, this would come from auth context
      const userId = post?.userId || 1;

      const response = await updatePost(postId, postData, userId);

      if (response.success) {
        toast.success("Post updated successfully");
        router.push("/admin/post");
      } else {
        toast.error(response.error || "Failed to update post");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Edit Post</h1>
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
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostPage;
