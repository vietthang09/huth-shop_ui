"use client";

import { Post } from "@/types/blog";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

type BlogPostCardProps = {
  post: Post;
  variant?: "default" | "featured" | "compact";
};

const BlogPostCard = ({ post, variant = "default" }: BlogPostCardProps) => {
  const formattedDate = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  if (variant === "featured") {
    return (
      <div className="relative flex flex-col md:flex-row group rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-lg transition-all duration-300">
        <div className="relative aspect-video md:aspect-auto md:w-1/2 overflow-hidden">
          <Image
            src={post.cover || "/images/blog/placeholder.jpg"}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="p-6 md:w-1/2 flex flex-col justify-between">
          <div>
            {post.topic && (
              <Link
                href={`/blog/topic/${post.topic.slug}`}
                className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2 inline-block"
              >
                {post.topic.name}
              </Link>
            )}
            <Link href={`/bai-viet/${post.slug}`} className="block group">
              <h2 className="text-2xl font-semibold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors">
                {post.title}
              </h2>
            </Link>
            <p className="text-gray-600 mb-4 line-clamp-3">{post.shortDescription}</p>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {post.user?.fullname ? (
                <span className="font-medium text-sm text-gray-800">{post.user.fullname}</span>
              ) : (
                <span className="font-medium text-sm text-gray-800">Admin</span>
              )}
            </div>
            <span className="mx-2 text-gray-500">·</span>
            <time className="text-sm text-gray-500">{formattedDate}</time>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="flex group items-start space-x-4">
        <div className="relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden">
          <Image
            src={post.cover || "/images/blog/placeholder.jpg"}
            alt={post.title}
            fill
            sizes="64px"
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <Link href={`/blog/${post.slug}`}>
            <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
              {post.title}
            </h3>
          </Link>
          <time className="text-xs text-gray-500 block mt-1">{formattedDate}</time>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex flex-col rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300">
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={post.cover || "/images/blog/placeholder.jpg"}
          alt={post.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-5">
        {post.topic && (
          <Link
            href={`/blog/topic/${post.topic.slug}`}
            className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2 inline-block"
          >
            {post.topic.name}
          </Link>
        )}
        <Link href={`/blog/${post.slug}`} className="block group">
          <h2 className="text-xl font-semibold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {post.title}
          </h2>
        </Link>
        {post.shortDescription && <p className="text-gray-600 mb-4 line-clamp-2">{post.shortDescription}</p>}
        <div className="flex items-center pt-2 border-t border-gray-100">
          <div className="flex-shrink-0">
            {post.user?.fullname ? (
              <span className="font-medium text-sm text-gray-800">{post.user.fullname}</span>
            ) : (
              <span className="font-medium text-sm text-gray-800">Admin</span>
            )}
          </div>
          <span className="mx-2 text-gray-500">·</span>
          <time className="text-sm text-gray-500">{formattedDate}</time>
        </div>
      </div>
    </div>
  );
};

export default BlogPostCard;
