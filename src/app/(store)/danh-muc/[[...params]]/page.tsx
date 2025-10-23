"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import {
  Bot,
  Cloud,
  Computer,
  Filter,
  Globe,
  GridIcon,
  Music,
  Pen,
  PenLine,
  Phone,
  Play,
  Search,
  SortAsc,
} from "lucide-react";
import {
  aiProducts,
  eduProducts,
  entertainmentProducts,
  workingProducts,
  mockProducts,
} from "@/components/store/home/data";
import Link from "next/link";
import ProductCard from "@/components/store/common/ProductCard";

interface ProductType {
  id: number;
  title: string;
  sku: string;
  description?: string;
  keywords?: string;
  image?: string | null;
  cardColor?: string | null;
  properties: Array<{
    retailPrice: number | any; // Using any to handle Prisma Decimal type
    salePrice?: number | null | any; // Using any to handle Prisma Decimal type
  }>;
  isAvailable?: boolean;
  supplier?: { name: string } | null;
  category?: { name: string; slug: string } | null;
  categoryId?: number | null;
  supplierId?: number | null;
  lowestPrice?: number; // Added for category API response
  lowestSalePrice?: number | null; // Added for category API response
}

const ListPage = () => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const productMapping = new Map<string, any[]>();
  productMapping.set("giai-tri", entertainmentProducts);
  productMapping.set("cong-viec", workingProducts);
  productMapping.set("ai", aiProducts);
  productMapping.set("hoc-tap", eduProducts);

  const categoryMapping = new Map<string, string>();
  categoryMapping.set("giai-tri", "Giải trí");
  categoryMapping.set("cong-viec", "Công việc");
  categoryMapping.set("ai", "Trí tuệ nhân tạo");
  categoryMapping.set("hoc-tap", "Học tập");

  const categories = [
    {
      title: "Âm nhạc",
      icon: <Music className="size-6" />,
      slug: "am-nhac",
      count: 24,
    },
    {
      title: "Phim ảnh",
      icon: <Play className="size-6" />,
      slug: "phim-anh",
      count: 18,
    },
    {
      title: "Công việc",
      icon: <Computer className="size-6" />,
      slug: "cong-viec",
      count: 32,
    },
    {
      title: "A.I",
      icon: <Bot className="size-6" />,
      slug: "ai",
      count: 15,
    },
    {
      title: "Đồ họa",
      icon: <PenLine className="size-6" />,
      slug: "do-hoa",
      count: 21,
    },
    {
      title: "Lữu trữ",
      icon: <Cloud className="size-6" />,
      slug: "luu-tru",
      count: 12,
    },
  ];

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = pathname.split("/")[2];
  const searchQuery = searchParams.get("q") || "";

  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      const searchInText = (text: string, query: string) => {
        return text.toLowerCase().includes(query.toLowerCase());
      };

      const matchesSearch = searchTerm
        ? searchInText(product.title, searchTerm) ||
          (product.keywords && searchInText(product.keywords, searchTerm)) ||
          (product.description && searchInText(product.description, searchTerm)) ||
          (product.category?.name && searchInText(product.category.name, searchTerm))
        : true;

      const matchesQuery = searchQuery
        ? searchInText(product.title, searchQuery) ||
          (product.keywords && searchInText(product.keywords, searchQuery)) ||
          (product.description && searchInText(product.description, searchQuery)) ||
          (product.category?.name && searchInText(product.category.name, searchQuery))
        : true;

      return matchesSearch && matchesQuery;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return (a.lowestPrice || 0) - (b.lowestPrice || 0);
        case "price-high":
          return (b.lowestPrice || 0) - (a.lowestPrice || 0);
        case "name":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  useEffect(() => {
    if (searchQuery) {
      // If there's a search query, load all products from mockProducts
      setProducts(mockProducts);
      setSearchTerm(searchQuery);
    } else {
      // Otherwise, load products for the specific category
      setProducts(productMapping.get(currentCategory) || []);
      setSearchTerm("");
    }
  }, [currentCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="mb-8" aria-label="Breadcrumb">
          <div className="flex items-center text-sm space-x-2">
            <Link href="/" className="text-gray-500 hover:text-blue-600 transition-colors font-medium">
              Trang chủ
            </Link>
            <span className="text-gray-300">/</span>
            {searchQuery ? (
              <span className="text-gray-900 font-semibold">Kết quả tìm kiếm</span>
            ) : (
              <Link href={`/danh-muc/${currentCategory}`} className="text-gray-900 font-semibold">
                {categoryMapping.get(currentCategory) || "Danh mục"}
              </Link>
            )}
          </div>
        </nav>

        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col gap-4 sm:gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {searchQuery
                  ? `Kết quả tìm kiếm: "${searchQuery}"`
                  : categoryMapping.get(currentCategory) || "Danh mục"}
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                {searchQuery
                  ? `Tìm thấy ${filteredProducts.length} sản phẩm cho "${searchQuery}"`
                  : `Khám phá ${filteredProducts.length} sản phẩm chất lượng cao`}
              </p>
            </div>

            {/* Search and Controls */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm text-sm sm:text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                {/* Sort */}
                <select
                  className="flex-1 sm:flex-none px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm text-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="default">Sắp xếp</option>
                  <option value="price-low">Giá: Thấp → Cao</option>
                  <option value="price-high">Giá: Cao → Thấp</option>
                  <option value="name">Tên A-Z</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-white/80 backdrop-blur-sm">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-3 transition-colors ${
                      viewMode === "grid" ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <GridIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-3 transition-colors ${
                      viewMode === "list" ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Filter className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Tags */}
        <div className="mb-6 sm:mb-8">
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category, index) => (
              <Link
                key={index}
                href={`/danh-muc/${category.slug}`}
                className={`group flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                  currentCategory === category.slug
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                    : "bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white border border-gray-200/80 hover:border-blue-300/50"
                }`}
              >
                <div
                  className={`transition-colors ${
                    currentCategory === category.slug ? "text-white" : "text-gray-500 group-hover:text-blue-500"
                  }`}
                >
                  {category.icon}
                </div>
                <div>
                  <span className="font-semibold text-xs sm:text-sm">{category.title}</span>
                  <span
                    className={`block text-xs ${currentCategory === category.slug ? "text-blue-100" : "text-gray-500"}`}
                  >
                    {category.count} sản phẩm
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Results Info */}
        {searchTerm && (
          <div className="mb-6 p-4 bg-blue-50/50 rounded-xl border border-blue-200/50">
            <p className="text-blue-800">
              Tìm thấy <span className="font-semibold">{filteredProducts.length}</span> kết quả cho "{searchTerm}"
            </p>
          </div>
        )}

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div
            className={`grid gap-4 sm:gap-6 ${
              viewMode === "grid" ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
            }`}
          >
            {filteredProducts.map((product, index) => (
              <ProductCard product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? `Không có sản phẩm nào phù hợp với "${searchTerm}"` : "Danh mục này hiện chưa có sản phẩm"}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListPage;
