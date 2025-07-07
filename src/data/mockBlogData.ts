import { Post, Topic } from "@/types/blog";

export const mockTopics: Topic[] = [
  {
    id: 1,
    name: "Gaming Guides",
    slug: "gaming-guides",
    image: "/images/blog/topics/gaming.jpg",
    _count: { posts: 12 },
  },
  {
    id: 2,
    name: "Account Security",
    slug: "account-security",
    image: "/images/blog/topics/security.jpg",
    _count: { posts: 8 },
  },
  {
    id: 3,
    name: "Market Trends",
    slug: "market-trends",
    image: "/images/blog/topics/trends.jpg",
    _count: { posts: 15 },
  },
  {
    id: 4,
    name: "Tips & Tricks",
    slug: "tips-tricks",
    image: "/images/blog/topics/tips.jpg",
    _count: { posts: 20 },
  },
  {
    id: 5,
    name: "News & Updates",
    slug: "news-updates",
    image: "/images/blog/topics/news.jpg",
    _count: { posts: 6 },
  },
];

const createMockUser = (id: number, fullname: string, email: string) => ({
  id,
  fullname,
  email,
  password: "hashed_password",
  role: "AUTHOR",
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
  isActive: true,
  lastLogin: new Date(),
  posts: [],
  logs: [],
  orders: [],
  inventoryImports: [],
});

export const mockPosts: Post[] = [
  {
    id: 1,
    userId: 1,
    user: createMockUser(1, "Admin", "admin@example.com"),
    topicId: 1,
    topic: mockTopics[0],
    slug: "ultimate-guide-account-trading",
    title: "The Ultimate Guide to Safe Account Trading in 2025",
    shortDescription:
      "Learn the essential tips and best practices for secure account trading. Protect yourself from scams and maximize your investment returns.",
    content: "Complete guide content here...",
    cover: "/images/blog/blogPost1.avif",
    createdAt: new Date("2025-06-28"),
    updatedAt: new Date("2025-06-28"),
    logs: [],
  },
  {
    id: 2,
    userId: 2,
    user: createMockUser(2, "Gaming Expert", "expert@example.com"),
    topicId: 2,
    topic: mockTopics[1],
    slug: "secure-your-gaming-accounts",
    title: "How to Secure Your Gaming Accounts from Hackers",
    shortDescription:
      "Essential security measures every gamer should implement to protect their valuable accounts and digital assets.",
    content: "Security guide content here...",
    cover: "/images/blog/blogPost2.avif",
    createdAt: new Date("2025-06-25"),
    updatedAt: new Date("2025-06-25"),
    logs: [],
  },
  {
    id: 3,
    userId: 3,
    user: createMockUser(3, "Market Analyst", "analyst@example.com"),
    topicId: 3,
    topic: mockTopics[2],
    slug: "gaming-market-trends-2025",
    title: "Gaming Market Trends to Watch in 2025",
    shortDescription:
      "Discover the latest trends shaping the gaming industry and how they affect account values and trading opportunities.",
    content: "Market analysis content here...",
    cover: "/images/blog/blogPost3.avif",
    createdAt: new Date("2025-06-22"),
    updatedAt: new Date("2025-06-22"),
    logs: [],
  },
  {
    id: 4,
    userId: 4,
    user: createMockUser(4, "Pro Trader", "trader@example.com"),
    topicId: 4,
    topic: mockTopics[3],
    slug: "maximize-account-value",
    title: "10 Tips to Maximize Your Gaming Account Value",
    shortDescription:
      "Proven strategies to increase your gaming account's worth through smart gameplay, investments, and maintenance.",
    content: "Tips and tricks content here...",
    cover: "/images/blog/blogPost1.avif",
    createdAt: new Date("2025-06-20"),
    updatedAt: new Date("2025-06-20"),
    logs: [],
  },
  {
    id: 5,
    userId: 5,
    user: createMockUser(5, "News Editor", "news@example.com"),
    topicId: 5,
    topic: mockTopics[4],
    slug: "platform-updates-june-2025",
    title: "Major Platform Updates and New Features - June 2025",
    shortDescription:
      "Stay updated with the latest platform improvements, new features, and important announcements affecting all users.",
    content: "News content here...",
    cover: "/images/blog/blogPost2.avif",
    createdAt: new Date("2025-06-18"),
    updatedAt: new Date("2025-06-18"),
    logs: [],
  },
  {
    id: 6,
    userId: 6,
    user: createMockUser(6, "Game Specialist", "specialist@example.com"),
    topicId: 1,
    topic: mockTopics[0],
    slug: "best-games-invest-2025",
    title: "Best Games to Invest in for 2025",
    shortDescription:
      "Analysis of the most promising games for account investment, considering popularity, longevity, and market demand.",
    content: "Investment guide content here...",
    cover: "/images/blog/blogPost3.avif",
    createdAt: new Date("2025-06-15"),
    updatedAt: new Date("2025-06-15"),
    logs: [],
  },
  {
    id: 7,
    userId: 7,
    user: createMockUser(7, "Security Expert", "security@example.com"),
    topicId: 2,
    topic: mockTopics[1],
    slug: "two-factor-authentication-guide",
    title: "Complete Guide to Two-Factor Authentication",
    shortDescription:
      "Step-by-step guide to setting up and managing 2FA for maximum account security across all gaming platforms.",
    content: "2FA guide content here...",
    cover: "/images/blog/blogPost1.avif",
    createdAt: new Date("2025-06-12"),
    updatedAt: new Date("2025-06-12"),
    logs: [],
  },
  {
    id: 8,
    userId: 8,
    user: createMockUser(8, "Market Researcher", "research@example.com"),
    topicId: 3,
    topic: mockTopics[2],
    slug: "mobile-gaming-revolution",
    title: "The Mobile Gaming Revolution: Impact on Account Trading",
    shortDescription:
      "How the mobile gaming boom is reshaping the account trading landscape and creating new opportunities.",
    content: "Mobile gaming analysis content here...",
    cover: "/images/blog/blogPost2.avif",
    createdAt: new Date("2025-06-10"),
    updatedAt: new Date("2025-06-10"),
    logs: [],
  },
  {
    id: 9,
    userId: 9,
    user: createMockUser(9, "Trading Coach", "coach@example.com"),
    topicId: 4,
    topic: mockTopics[3],
    slug: "avoid-common-trading-mistakes",
    title: "Common Trading Mistakes and How to Avoid Them",
    shortDescription:
      "Learn from the most frequent errors made by new traders and discover strategies to avoid costly mistakes.",
    content: "Trading mistakes content here...",
    cover: "/images/blog/blogPost3.avif",
    createdAt: new Date("2025-06-08"),
    updatedAt: new Date("2025-06-08"),
    logs: [],
  },
];

// Helper function to get paginated posts
export const getPaginatedPosts = (page: number = 1, limit: number = 6) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  return {
    posts: mockPosts.slice(startIndex, endIndex),
    totalPosts: mockPosts.length,
    totalPages: Math.ceil(mockPosts.length / limit),
    currentPage: page,
    hasNextPage: endIndex < mockPosts.length,
    hasPrevPage: page > 1,
  };
};

// Helper function to get featured posts
export const getFeaturedPosts = (count: number = 3) => {
  return mockPosts.slice(0, count);
};

// Helper function to get recent posts
export const getRecentPosts = (count: number = 5) => {
  return mockPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, count);
};

// Helper function to get posts by topic
export const getPostsByTopic = (topicSlug: string, limit: number = 10) => {
  return mockPosts.filter((post) => post.topic?.slug === topicSlug).slice(0, limit);
};
