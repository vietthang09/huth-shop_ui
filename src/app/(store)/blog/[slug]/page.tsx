import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { getBlogBySlug } from "@/actions/blog";
import TableOfContents from "@/components/blog/TableOfContents";

interface BlogDetailPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const result = await getBlogBySlug(params.slug);

  if ("error" in result || !result.blog) {
    return {
      title: "Blog not found | BITEX",
    };
  }

  return {
    title: `${result.blog.title} | BITEX Blog`,
    description: result.blog.shortText,
    openGraph: {
      title: result.blog.title,
      description: result.blog.shortText || undefined,
      images: result.blog.imgUrl ? [{ url: result.blog.imgUrl }] : undefined,
    },
  };
}

const BlogDetailPage = async ({ params }: BlogDetailPageProps) => {
  const result = await getBlogBySlug(params.slug);

  if ("error" in result || !result.blog) {
    notFound();
  }

  const { blog } = result;

  if (!blog.isPublished) {
    notFound();
  }

  // Format date properly
  const formattedDate = blog.createdAt
    ? new Date(blog.createdAt).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <>
      <div className="mt-28 py-12 bg-gray-50">
        {/* Magazine-style header with featured image */}
        <div className="max-w-5xl mx-auto mb-10">
          <div className="flex items-center text-sm mb-6 bg-white p-3 rounded-lg shadow-sm">
            <Link href="/" className="text-gray-500 hover:text-primary transition-colors flex items-center gap-1">
              <span>Trang chủ</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M9 18L15 12L9 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <Link href="/blog" className="text-gray-500 hover:text-primary transition-colors flex items-center gap-1">
              <span>Blog</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M9 18L15 12L9 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <span className="text-gray-800 font-medium truncate max-w-[300px]">{blog.title}</span>
          </div>

          {/* Magazine style title section */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12">
              {/* Image section - takes 7/12 columns on md screens */}
              {blog.imgUrl ? (
                <div className="md:col-span-7 relative h-[300px] md:h-[500px]">
                  <Image
                    src={blog.imgUrl}
                    alt={blog.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 60vw"
                    priority
                  />
                </div>
              ) : null}

              {/* Content intro section - takes 5/12 columns or full width if no image */}
              <div className={`p-8 flex flex-col justify-center ${blog.imgUrl ? "md:col-span-5" : "md:col-span-12"}`}>
                <div className="mb-4 flex items-center space-x-2">
                  <span className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">Blog</span>
                  <span className="text-gray-500 text-sm">{formattedDate}</span>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">{blog.title}</h1>

                {blog.shortText && <div className="text-lg text-gray-600 mb-6">{blog.shortText}</div>}

                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 mr-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M18 20C18 17.7909 15.3137 16 12 16C8.68629 16 6 17.7909 6 20"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Author</p>
                      <p className="font-medium">{blog.author?.name || "BITEX Team"}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex space-x-2">
                      {/* Social share buttons */}
                      <button className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-200 transition-colors">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z" />
                        </svg>
                      </button>
                      <button className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-400 hover:bg-blue-200 transition-colors">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                        </svg>
                      </button>
                      <button className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 hover:bg-green-200 transition-colors">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Article content with table of contents for longer articles */}
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Table of contents - only on desktop and if content is long enough */}
            <div className="hidden md:block md:col-span-3">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
                <h3 className="font-semibold text-gray-900 mb-4 text-lg">Table of Contents</h3>
                <div className="space-y-2 text-sm">
                  {/* This would be populated with extracted headings in a client component */}
                  <p className="text-gray-500 text-xs italic">
                    Contents automatically generated based on headings in the article
                  </p>
                  <div className="w-full h-px bg-gray-200 my-3"></div>
                  <TableOfContents html={blog.content} />
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="md:col-span-9">
              <article className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-8">
                  <div
                    className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 
                              prose-p:text-gray-700 prose-a:text-primary prose-a:font-medium prose-a:no-underline
                              prose-a:hover:underline prose-img:rounded-md prose-img:shadow-sm
                              prose-h2:pt-6 prose-h2:border-t prose-h2:border-gray-100 prose-h2:mt-8
                              prose-h3:text-gray-700"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                  />

                  {/* Article footer with tags and related posts */}
                  <div className="mt-12 pt-8 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2 mb-8">
                      <span className="text-sm font-medium text-gray-700 mr-2">Topics:</span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">BITEX</span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Blog</span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Tips</span>
                    </div>

                    <div className="flex justify-between items-center mt-8">
                      <button className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M12 20L4 12L12 4M4 12H20"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>Previous Article</span>
                      </button>
                      <Link href="/blog" className="text-primary font-medium hover:underline">
                        View All Posts
                      </Link>
                      <button className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors">
                        <span>Next Article</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M12 4L20 12L12 20M20 12H4"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogDetailPage;
