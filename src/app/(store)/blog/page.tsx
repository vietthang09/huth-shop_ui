import { getAllPosts } from "@/actions/post/post";
import { notFound } from "next/navigation";
import BlogPostCard from "@/components/blog/BlogPostCard";
import Pagination from "@/components/blog/Pagination";

export const revalidate = 3600; // Revalidate every hour

const BlogListPage = async ({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) => {
  const currentPage = typeof searchParams.page === "string" ? parseInt(searchParams.page) : 1;
  const pageSize = 9; // Posts per page

  const result = await getAllPosts(currentPage, pageSize);

  if (!result.success) {
    notFound();
  }

  const { data: posts, pagination } = result;

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Blog</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Latest news, guides, and insights about our products and services.
        </p>
      </div>

      {posts.length > 0 ? (
        <>
          {/* Featured post (first post) */}
          {posts.length > 0 && (
            <div className="mb-16">
              <BlogPostCard post={posts[0]} variant="featured" />
            </div>
          )}

          {/* Regular posts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.slice(1).map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>

          {/* Pagination */}
          <Pagination page={pagination.page} totalPages={pagination.totalPages} baseUrl="/blog/" />
        </>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-medium text-gray-600 mb-4">No posts found</h2>
          <p className="text-gray-500">Check back soon for new content!</p>
        </div>
      )}
    </div>
  );
};

export default BlogListPage;
