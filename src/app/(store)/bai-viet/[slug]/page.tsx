// Temporarily using mock data - replace with real data actions later
import { mockPosts, getRecentPosts } from "@/data/mockBlogData";
import { notFound } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { Metadata } from "next";
import ShareButtons from "@/components/blog/ShareButtons";
import TableOfContents from "@/components/blog/TableOfContents";
import BlogPostCard from "@/components/blog/BlogPostCard";
import Link from "next/link";

export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // Use mock data for now
  const post = mockPosts.find((p) => p.slug === params.slug);

  if (!post) {
    return {
      title: "Post Not Found",
      description: "The requested blog post could not be found.",
    };
  }

  return {
    title: post.title,
    description: post.shortDescription || "",
    openGraph: post.cover
      ? {
          images: [{ url: post.cover, width: 1200, height: 630, alt: post.title }],
        }
      : undefined,
  };
}

export async function generateStaticParams() {
  // Use mock data for static generation
  return mockPosts.map((post) => ({
    slug: post.slug,
  }));
}

const BlogDetailPage = async ({ params }: { params: { slug: string } }) => {
  // Use mock data for now
  const post = mockPosts.find((p) => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  // Get related posts using mock data
  const relatedPosts = getRecentPosts(4)
    .filter((p) => p.id !== post.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <nav className="flex text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/bai-viet" className="hover:text-blue-600">
            Blog
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{post.title}</span>
        </nav>
      </div>

      <div className="mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <article className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Cover image */}
              {post.cover && (
                <div className="relative aspect-video">
                  <Image
                    src={post.cover}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 66vw"
                    className="object-cover"
                    priority
                  />
                </div>
              )}

              <div className="p-8">
                {/* Meta Info */}
                <div className="flex items-center mb-6">
                  {post.topic && (
                    <Link
                      href={`/bai-viet?topic=${post.topic.slug}`}
                      className="text-sm font-semibold text-blue-600 uppercase tracking-wider hover:text-blue-700"
                    >
                      {post.topic.name}
                    </Link>
                  )}
                  <span className="mx-3 text-gray-300">•</span>
                  <time className="text-sm text-gray-600">{format(new Date(post.createdAt), "MMM d, yyyy")}</time>
                  {post.user?.fullname && (
                    <>
                      <span className="mx-3 text-gray-300">•</span>
                      <span className="text-sm text-gray-600">By {post.user.fullname}</span>
                    </>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">{post.title}</h1>

                {/* Short Description */}
                {post.shortDescription && (
                  <p className="text-xl text-gray-600 mb-8 leading-relaxed">{post.shortDescription}</p>
                )}

                {/* Share Buttons */}
                <div className="mb-8">
                  <ShareButtons url={`/bai-viet/${post.slug}`} title={post.title} />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  {post.content ? (
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                  ) : (
                    <div className="space-y-6 text-gray-700 leading-relaxed">
                      <p>
                        This is a comprehensive guide about {post.title.toLowerCase()}. In this article, we'll explore
                        the key concepts, best practices, and actionable strategies you can implement right away.
                      </p>
                      <p>
                        Our team of experts has carefully researched and compiled this information to provide you with
                        the most up-to-date and relevant insights in the gaming and account trading industry.
                      </p>
                      <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Key Takeaways</h3>
                      <ul className="space-y-2">
                        <li>• Security should always be your top priority when handling accounts</li>
                        <li>• Stay informed about market trends and platform updates</li>
                        <li>• Build a reputation through consistent and trustworthy practices</li>
                        <li>• Use proper tools and resources to enhance your experience</li>
                      </ul>
                      <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Best Practices</h3>
                      <p>
                        Following industry best practices ensures that you maximize your potential while minimizing
                        risks. Always verify information from multiple sources and stay updated with the latest security
                        measures.
                      </p>
                      <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Conclusion</h3>
                      <p>
                        This article provides a solid foundation for understanding the topic. For more detailed guides
                        and regular updates, make sure to bookmark our blog and follow our newsletter for exclusive
                        content.
                      </p>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm font-medium text-gray-700 mr-2">Tags:</span>
                    {["Gaming", "Security", "Trading", "Tips", "Guide"].map((tag) => (
                      <span
                        key={tag}
                        className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 cursor-pointer transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* Table of Contents */}
              {post.content && (
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Table of Contents</h3>
                  <TableOfContents html={post.content} />
                </div>
              )}

              {/* Author Info */}
              {post.user?.fullname && (
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About the Author</h3>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">{post.user.fullname.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{post.user.fullname}</p>
                      <p className="text-sm text-gray-600">Content Expert</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Newsletter */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Stay Updated</h3>
                <p className="text-sm text-gray-600 mb-4">Get the latest articles delivered to your inbox.</p>
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
            </div>
          </div>
        </div>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <BlogPostCard key={relatedPost.id} post={relatedPost} variant="default" />
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <Link href="/bai-viet" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              Back to Blog
            </Link>

            <div className="hidden md:block text-sm text-gray-600">
              Share this article:
              <div className="inline-block ml-2">
                <ShareButtons url={`/bai-viet/${post.slug}`} title={post.title} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetailPage;
