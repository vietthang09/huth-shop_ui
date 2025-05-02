"use client";
import { useEffect, useState } from "react";
import { TBlogCard } from "@/types/common";
import HomeBlogCard from "./BlogCard";
import { getPublishedBlogs } from "@/actions/blog";

export const LatestBlogPosts = () => {
  const [blogs, setBlogs] = useState<TBlogCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const result = await getPublishedBlogs(4);

        if (Array.isArray(result)) {
          setBlogs(
            result.map((blog) => ({
              _id: blog.id,
              title: blog.title,
              shortText: blog.shortText || "",
              imgUrl: blog.imgUrl || "/images/placeholder.jpg",
              slug: blog.slug,
              createdAt: new Date(blog.createdAt).toLocaleString(),
            }))
          );
          setError(null);
        } else {
          setError("Failed to load blog posts");
        }
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setError("Failed to load blog posts");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className="w-full mt-14">
        <h2 className="text-2xl font-medium text-gray-700">Bài viết mới nhất</h2>
        <div className="flex gap-6 flex-col md:flex-row mt-7">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-[350px] flex-1 bg-gray-200 animate-pulse rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full mt-14">
        <h2 className="text-2xl font-medium text-gray-700">Bài viết mới nhất</h2>
        <p className="mt-4 text-red-500">{error}</p>
      </div>
    );
  }

  if (blogs.length === 0) {
    return null;
  }

  return (
    <div className="w-full mt-14">
      <div className="flex w-full justify-between items-center mb-7">
        <h2 className="text-2xl font-medium text-gray-700">Bài viết mới nhất</h2>
      </div>
      <div className="flex gap-6 flex-col md:flex-row">
        {blogs.map((blog) => (
          <HomeBlogCard
            key={blog._id}
            imgUrl={blog.imgUrl}
            title={blog.title}
            shortText={blog.shortText}
            url={`/blog/${blog.slug}`}
          />
        ))}
      </div>
    </div>
  );
};
