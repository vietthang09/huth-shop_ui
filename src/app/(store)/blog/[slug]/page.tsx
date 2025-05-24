import { getPostBySlug, getAllPosts } from "@/actions/post/post";
import { notFound } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { Metadata } from "next";
import ShareButtons from "@/components/blog/ShareButtons";
import TableOfContents from "@/components/blog/TableOfContents";
import BlogPostCard from "@/components/blog/BlogPostCard";

export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const result = await getPostBySlug(params.slug);
  const post = result.success ? result.data : null;

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
  // Get all posts for static generation
  const result = await getAllPosts(1, 100); // Adjust limit as needed

  if (!result.success) {
    return [];
  }

  return result.data.map((post) => ({
    slug: post.slug,
  }));
}

const BlogDetailPage = async ({ params }: { params: { slug: string } }) => {
  const postResult = await getPostBySlug(params.slug);

  if (!postResult.success) {
    notFound();
  }

  const post = postResult.data;

  // Get related posts (same topic, excluding current post)
  let relatedPosts = [];
  if (post.topicId) {
    const relatedResult = await getAllPosts(1, 4);
    if (relatedResult.success) {
      relatedPosts = relatedResult.data.filter((p) => p.id !== post.id).slice(0, 3);
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Post header */}
      <div className="max-w-4xl mx-auto mb-10">
        {post.topic && (
          <a
            href={`/blog/topic/${post.topic.slug}`}
            className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-4 inline-block"
          >
            {post.topic.name}
          </a>
        )}
        <h1 className="text-4xl font-bold text-gray-900 mb-6">{post.title}</h1>

        <div className="flex items-center text-gray-600 mb-8">
          <div className="flex-shrink-0 mr-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
              <span className="font-medium text-sm">
                {post.user?.fullname ? post.user.fullname.charAt(0).toUpperCase() : "A"}
              </span>
            </div>
          </div>
          <div>
            <p className="font-medium text-gray-900">{post.user?.fullname || "Admin"}</p>
            <p className="text-sm text-gray-500">{format(new Date(post.createdAt), "MMM d, yyyy")}</p>
          </div>
        </div>
      </div>

      {/* Cover image */}
      {post.cover && (
        <div className="mb-12 relative h-[500px] rounded-xl overflow-hidden">
          <Image
            src={post.cover}
            alt={post.title}
            fill
            sizes="(max-width: 1280px) 100vw, 1280px"
            priority
            className="object-cover"
          />
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-12 max-w-7xl mx-auto">
        {/* Main content */}
        <div className="lg:w-2/3">
          {/* Post content */}
          {post.content ? (
            <article
              className="prose lg:prose-xl max-w-none mb-12"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          ) : (
            <p className="text-gray-500 italic">No content available for this post.</p>
          )}

          {/* Share buttons for mobile */}
          <div className="lg:hidden mt-8">
            <ShareButtons url={`/blog/${post.slug}`} title={post.title} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-1/3 space-y-12">
          {/* Share buttons for desktop */}
          <div className="hidden lg:block sticky top-24">
            <ShareButtons url={`/blog/${post.slug}`} title={post.title} />
          </div>

          {/* Table of contents */}
          {post.content && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-4">Table of Contents</h3>
              <TableOfContents html={post.content} />
            </div>
          )}
        </div>
      </div>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <div className="mt-16 pt-12 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedPosts.map((relatedPost) => (
              <BlogPostCard key={relatedPost.id} post={relatedPost} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogDetailPage;
