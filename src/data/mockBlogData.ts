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
    slug: "huong-dan-giao-dich-tai-khoan-an-toan-2025",
    title: "Hướng dẫn toàn diện giao dịch tài khoản an toàn năm 2025",
    shortDescription:
      "Tìm hiểu các mẹo và thực hành tốt nhất để giao dịch tài khoản an toàn. Bảo vệ bản thân khỏi lừa đảo và tối đa hóa lợi nhuận đầu tư.",
    content: "Nội dung hướng dẫn đầy đủ tại đây...",
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
    slug: "bao-mat-tai-khoan-game",
    title: "Cách bảo mật tài khoản game khỏi hacker",
    shortDescription:
      "Những biện pháp bảo mật thiết yếu mà mọi game thủ nên áp dụng để bảo vệ tài khoản và tài sản số giá trị.",
    content: "Nội dung hướng dẫn bảo mật tại đây...",
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
    slug: "xu-huong-thi-truong-game-2025",
    title: "Xu hướng thị trường game nổi bật năm 2025",
    shortDescription:
      "Khám phá các xu hướng mới nhất định hình ngành game và tác động đến giá trị tài khoản cũng như cơ hội giao dịch.",
    content: "Nội dung phân tích thị trường tại đây...",
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
    slug: "toi-uu-gia-tri-tai-khoan-game",
    title: "10 mẹo tối ưu giá trị tài khoản game",
    shortDescription:
      "Chiến lược đã được kiểm chứng để tăng giá trị tài khoản game thông qua chơi thông minh, đầu tư và bảo trì hợp lý.",
    content: "Nội dung mẹo và thủ thuật tại đây...",
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
    slug: "cap-nhat-nen-tang-thang-6-2025",
    title: "Cập nhật nền tảng lớn và tính năng mới - Tháng 6/2025",
    shortDescription:
      "Luôn cập nhật các cải tiến nền tảng, tính năng mới và thông báo quan trọng dành cho tất cả người dùng.",
    content: "Nội dung tin tức tại đây...",
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
    slug: "game-dang-dau-tu-2025",
    title: "Những tựa game nên đầu tư năm 2025",
    shortDescription:
      "Phân tích các game tiềm năng nhất để đầu tư tài khoản, xét về độ phổ biến, tuổi thọ và nhu cầu thị trường.",
    content: "Nội dung hướng dẫn đầu tư tại đây...",
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
    slug: "huong-dan-xac-thuc-2-buoc",
    title: "Hướng dẫn đầy đủ về xác thực hai lớp (2FA)",
    shortDescription:
      "Hướng dẫn từng bước thiết lập và quản lý 2FA để bảo mật tối đa cho tài khoản trên mọi nền tảng game.",
    content: "Nội dung hướng dẫn 2FA tại đây...",
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
    slug: "cach-mang-game-di-dong",
    title: "Cách mạng game di động: Tác động đến giao dịch tài khoản",
    shortDescription:
      "Sự bùng nổ game di động đang thay đổi thị trường giao dịch tài khoản và tạo ra nhiều cơ hội mới.",
    content: "Nội dung phân tích game di động tại đây...",
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
    slug: "loi-loi-thuong-gap-giao-dich",
    title: "Những lỗi giao dịch thường gặp và cách tránh",
    shortDescription:
      "Học hỏi từ những sai lầm phổ biến của người mới và khám phá chiến lược tránh mất tiền không đáng có.",
    content: "Nội dung lỗi giao dịch tại đây...",
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
