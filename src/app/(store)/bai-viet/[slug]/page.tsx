import { notFound } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { Metadata } from "next";
import Link from "next/link";
import ShareButtons from "@/components/blog/ShareButtons";
import TableOfContents from "@/components/blog/TableOfContents";
import BlogPostCard from "@/components/blog/BlogPostCard";
import { findAll, findOneBySlug } from "@/services/blog";
import { Blog } from "@/services/type";
import { Post } from "@/types/blog";

export const revalidate = 3600;

const toTopicSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

const normalizePost = (blog: Blog): Post => {
  const unknownBlog = blog as Blog & {
    shortDescription?: string;
    cover?: string;
    userId?: number;
    user?: any;
    topicId?: number;
    topic?: any;
  };

  const author = unknownBlog.user || (blog as Blog & { author?: any }).author;
  const topic = unknownBlog.topic;
  const firstTag = blog.tags?.[0];
  const fallbackTopic = firstTag
    ? {
        id: -blog.id,
        name: firstTag,
        slug: toTopicSlug(firstTag),
        image: null,
        _count: { posts: 0 },
      }
    : null;

  return {
    id: blog.id,
    userId: unknownBlog.userId || author?.id || null,
    user: author
      ? {
          id: author.id || 0,
          fullname: author.fullname || [author.firstName, author.lastName].filter(Boolean).join(" ") || null,
          email: author.email || "",
          password: "",
          role: author.role || null,
          createdAt: author.createdAt ? new Date(author.createdAt) : new Date(),
          updatedAt: author.updatedAt ? new Date(author.updatedAt) : new Date(),
          isActive: author.isActive ?? true,
          lastLogin: author.lastLogin ? new Date(author.lastLogin) : null,
          posts: [],
          logs: [],
          orders: [],
          inventoryImports: [],
        }
      : null,
    topicId: unknownBlog.topicId || topic?.id || fallbackTopic?.id || null,
    topic: topic
      ? {
          id: topic.id || 0,
          name: topic.name || "",
          slug: topic.slug || toTopicSlug(topic.name || "topic"),
          image: topic.image || null,
          _count: topic._count,
        }
      : fallbackTopic,
    slug: blog.slug,
    title: blog.title,
    shortDescription: unknownBlog.shortDescription || blog.excerpt || null,
    content: blog.content || null,
    cover: unknownBlog.cover || blog.thumbnail || null,
    createdAt: new Date(blog.createdAt),
    updatedAt: new Date(blog.updatedAt),
    logs: [],
  };
};

async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const response = await findOneBySlug(slug);
    return normalizePost(response.data.data as Blog);
  } catch (error) {
    console.error(`Failed to fetch blog post by slug: ${slug}`, error);
    return null;
  }
}

async function getRelatedPosts(currentPost: Post): Promise<Post[]> {
  try {
    const response = await findAll();
    const allPosts = (response.data.data as Blog[]).map(normalizePost);

    const sameTopicPosts = currentPost.topic
      ? allPosts.filter((post) => post.id !== currentPost.id && post.topic?.slug === currentPost.topic?.slug)
      : [];

    if (sameTopicPosts.length > 0) {
      return sameTopicPosts.slice(0, 3);
    }

    return allPosts.filter((post) => post.id !== currentPost.id).slice(0, 3);
  } catch (error) {
    console.error("Failed to fetch related posts", error);
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);

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

const BlogDetailPage = async ({ params }: { params: { slug: string } }) => {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(post);

  return (
    <div className="min-h-screen bg-gray-50">
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
          <div className="lg:col-span-3">
            <article className="bg-white rounded-lg shadow-sm overflow-hidden">
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

                <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">{post.title}</h1>

                {post.shortDescription && (
                  <p className="text-xl text-gray-600 mb-8 leading-relaxed">{post.shortDescription}</p>
                )}

                <div className="mb-8">
                  <ShareButtons url={`/bai-viet/${post.slug}`} title={post.title} />
                </div>

                <div className="prose prose-lg max-w-none">
                  {post.content ? (
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                  ) : (
                    <div className="text-gray-700">Nội dung đang được cập nhật.</div>
                  )}
                </div>

                {!!post.topic?.name && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm font-medium text-gray-700 mr-2">Tags:</span>
                      <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                        {post.topic.name}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </article>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {post.content && (
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Table of Contents</h3>
                  <TableOfContents html={post.content} />
                </div>
              )}

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
            </div>
          </div>
        </div>

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
