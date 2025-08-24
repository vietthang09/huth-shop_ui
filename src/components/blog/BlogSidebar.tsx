"use client";

import { Post } from "@/types/blog";
import BlogPostCard from "./BlogPostCard";

interface BlogSidebarProps {
  recentPosts: Post[];
  featuredPosts: Post[];
}

const BlogSidebar = ({ recentPosts, featuredPosts }: BlogSidebarProps) => {
  return (
    <div className="space-y-8">
      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Articles</h3>
          <div className="space-y-4">
            {featuredPosts.slice(0, 3).map((post) => (
              <BlogPostCard key={post.id} post={post} variant="compact" />
            ))}
          </div>
        </div>
      )}

      {/* Recent Posts */}
      {recentPosts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Articles</h3>
          <div className="space-y-4">
            {recentPosts.slice(0, 5).map((post) => (
              <BlogPostCard key={post.id} post={post} variant="compact" />
            ))}
          </div>
        </div>
      )}

      {/* Newsletter Signup */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Stay Updated</h3>
        <p className="text-sm text-gray-600 mb-4">
          Subscribe to our newsletter for the latest gaming tips, market insights, and platform updates.
        </p>
        <div className="space-y-3">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
            Subscribe
          </button>
        </div>
      </div>

      {/* Popular Tags */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Tags</h3>
        <div className="flex flex-wrap gap-2">
          {[
            "Gaming",
            "Security",
            "Trading",
            "Tips",
            "Guides",
            "Market",
            "Accounts",
            "Investment",
            "Strategy",
            "News",
          ].map((tag) => (
            <span
              key={tag}
              className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium hover:bg-gray-200 cursor-pointer transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogSidebar;
