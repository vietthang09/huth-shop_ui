"use client";

import { useState, useMemo } from "react";
import { mockPosts, mockTopics, getFeaturedPosts, getRecentPosts } from "@/data/mockBlogData";
import BlogPostCard from "@/components/blog/BlogPostCard";
import BlogFilters from "@/components/blog/BlogFilters";
import BlogSidebar from "@/components/blog/BlogSidebar";
import ClientPagination from "@/components/blog/ClientPagination";

const BlogListPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  // Filter posts based on search and topic
  const filteredPosts = useMemo(() => {
    let filtered = mockPosts;

    // Filter by topic
    if (selectedTopic) {
      filtered = filtered.filter((post) => post.topic?.slug === selectedTopic);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.shortDescription?.toLowerCase().includes(query) ||
          post.topic?.name.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [searchQuery, selectedTopic]);

  // Paginate filtered posts
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;

    return {
      posts: filteredPosts.slice(startIndex, endIndex),
      totalPosts: filteredPosts.length,
      totalPages: Math.ceil(filteredPosts.length / postsPerPage),
      currentPage,
      hasNextPage: endIndex < filteredPosts.length,
      hasPrevPage: currentPage > 1,
    };
  }, [filteredPosts, currentPage]);

  const featuredPosts = getFeaturedPosts(3);
  const recentPosts = getRecentPosts(5);

  // Reset page when filters change
  const handleTopicChange = (topicSlug: string | null) => {
    setSelectedTopic(topicSlug);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog của chúng tôi</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tin tức, hướng dẫn và nhận định mới nhất về game, mua bán tài khoản và xu hướng thị trường.
          </p>
        </div>

        {/* Featured Post */}
        {featuredPosts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Bài viết nổi bật</h2>
            <BlogPostCard post={featuredPosts[0]} variant="featured" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="sticky top-4 space-y-6">
              <BlogFilters
                topics={mockTopics}
                selectedTopic={selectedTopic}
                onTopicChange={handleTopicChange}
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
              />
              <BlogSidebar recentPosts={recentPosts} featuredPosts={featuredPosts.slice(1)} />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedTopic
                    ? `Bài viết về ${mockTopics.find((t) => t.slug === selectedTopic)?.name}`
                    : "Tất cả bài viết"}
                </h2>
                <p className="text-gray-600 mt-1">
                  {searchQuery && `Kết quả tìm kiếm cho \"${searchQuery}\" - `}
                  Đã tìm thấy {paginatedData.totalPosts} bài viết
                </p>
              </div>

              {/* Clear Filters */}
              {(selectedTopic || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedTopic(null);
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>

            {/* Posts Grid */}
            {paginatedData.posts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {paginatedData.posts.map((post) => (
                    <BlogPostCard key={post.id} post={post} variant="default" />
                  ))}
                </div>

                {/* Pagination */}
                {paginatedData.totalPages > 1 && (
                  <div className="flex justify-center">
                    <ClientPagination
                      page={currentPage}
                      totalPages={paginatedData.totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            ) : (
              /* No Results */
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy bài viết nào</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery
                    ? `Không có bài viết nào phù hợp với từ khóa \"${searchQuery}\"`
                    : selectedTopic
                    ? `Không có bài viết nào trong danh mục đã chọn`
                    : "Chưa có bài viết nào"}
                </p>
                {(selectedTopic || searchQuery) && (
                  <button
                    onClick={() => {
                      setSelectedTopic(null);
                      setSearchQuery("");
                      setCurrentPage(1);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Xem tất cả bài viết
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogListPage;
