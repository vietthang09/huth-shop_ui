import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { getPublishedBlogs } from "@/actions/blog";

export const metadata: Metadata = {
  title: "BITEX - Blog",
  description: "Latest news, updates, and articles from BITEX",
};

const BlogListPage = async () => {
  const blogs = await getPublishedBlogs();

  return (
    <div className="max-w-5xl mx-auto pt-8 pb-16">
      <div className="flex items-center text-sm mb-8">
        <Link
          href="/"
          className="text-gray-500 hover:text-gray-900 after:content-[''] after:w-1 after:h-2 after:ml-2 after:inline-block after:bg-no-repeat after:bg-center after:bg-[url('/icons/arrowIcon01.svg')]"
        >
          Trang chủ
        </Link>
        <span className="text-gray-800">Blog</span>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Latest Articles</h1>

      {Array.isArray(blogs) && blogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <Link
              key={blog.id}
              href={`/blog/${blog.slug}`}
              className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {blog.imgUrl && (
                <div className="w-full h-48 relative">
                  <Image
                    src={blog.imgUrl}
                    alt={blog.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              )}
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{blog.title}</h2>
                <div className="text-sm text-gray-500 mb-4">
                  <time dateTime={blog.createdAt?.toISOString()}>{new Date(blog.createdAt).toString()}</time>
                </div>
                <p className="text-gray-700">{blog.shortText}</p>
                <div className="mt-4 text-blue-600 font-medium">Read more</div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 p-8 text-center rounded-lg">
          <p className="text-gray-600">No articles published yet. Check back later!</p>
        </div>
      )}
    </div>
  );
};

export default BlogListPage;
