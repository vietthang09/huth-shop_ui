"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import ProductCard from "@/components/store/common/productCard";
import { getSaleProducts } from "@/actions/product/saleProduct";
import { getTopSellingProducts, TopSellingProduct } from "@/actions/product/topSelling";
import { searchProducts } from "@/actions/product/product";

type TabType = "today-deals" | "top-selling" | "under-100k";

interface SaleProduct {
  id: number;
  sku: string;
  title: string;
  description: string | null;
  image: string | null;
  cardColor: string | null;
  createdAt: Date;
  updatedAt: Date;
  supplierId?: number | null;
  categoryId: number | null;
  category: any;
  properties: any[];
}

export const TabbedProductCards = () => {
  const [activeTab, setActiveTab] = useState<TabType>("today-deals");
  const [todayDeals, setTodayDeals] = useState<SaleProduct[]>([]);
  const [topSellingProducts, setTopSellingProducts] = useState<TopSellingProduct[]>([]);
  const [under100kProducts, setUnder100kProducts] = useState<SaleProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch today deals, top selling products, and products under 100k
        const [hotDealsResponse, topSellingResponse, under100kResponse] = await Promise.all([
          getSaleProducts({ limit: 10 }),
          getTopSellingProducts({ limit: 10 }),
          searchProducts("", {
            includeCategory: true,
            includeProperties: true,
            limit: 10,
            priceFilter: [0, 100000],
          }),
        ]);
        console.log("under100kResponse:", under100kResponse);
        setTodayDeals(hotDealsResponse.products);
        setTopSellingProducts(topSellingResponse || []);

        // Handle the under 100k products with proper type conversion
        if (under100kResponse.success && under100kResponse.data) {
          const formattedUnder100k = under100kResponse.data.map(
            (product: any): SaleProduct => ({
              id: product.id,
              sku: product.sku,
              title: product.title,
              description: product.description,
              image: product.image,
              cardColor: product.cardColor,
              createdAt: product.createdAt,
              updatedAt: product.updatedAt,
              supplierId: product.supplierId,
              categoryId: product.categoryId,
              category: product.category,
              properties: product.properties || product.prices || [],
            })
          );
          setUnder100kProducts(formattedUnder100k);
        } else {
          setUnder100kProducts([]);
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Show modern loading skeleton while data is being fetched
  if (isLoading) {
    return (
      <div className="w-full mt-16">
        {/* Premium Loading Tab Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
          <div className="relative">
            <div className="relative inline-flex items-center bg-gradient-to-r from-white/90 to-slate-50/90 backdrop-blur-2xl rounded-3xl p-2 shadow-2xl shadow-gray-900/10 border border-white/30 ring-1 ring-gray-200/20">
              {" "}
              {[1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl w-[120px] sm:w-[160px] flex-shrink-0"
                >
                  <div className="w-5 h-5 bg-gradient-to-r from-gray-300 to-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                    <div className="h-4 bg-gradient-to-r from-gray-300 to-gray-200 rounded-md animate-pulse w-20"></div>
                    <div className="w-6 h-6 bg-gradient-to-r from-gray-300 to-gray-200 rounded-full animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-center">
              <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-100 rounded-md animate-pulse w-32 mx-auto"></div>
            </div>
          </div>
          <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-100 rounded-2xl animate-pulse w-36"></div>
        </div>

        {/* Premium Loading Product Grid */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-50/40 pointer-events-none rounded-3xl" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/10 via-transparent to-purple-50/10 pointer-events-none rounded-3xl" />
          <div className="relative grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 p-2">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards]"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl h-52 mb-3 shadow-lg animate-pulse ring-1 ring-gray-200/30"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded-md animate-pulse w-3/4"></div>
                  <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-100 rounded-md animate-pulse w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Don't render anything if no products after loading
  if (todayDeals.length === 0 && topSellingProducts.length === 0 && under100kProducts.length === 0) {
    return null;
  }

  const tabs = [
    {
      id: "today-deals" as TabType,
      label: "Ưu đãi hôm nay",
      icon: "🔥",
      count: todayDeals.length,
      linkHref: "/list?hotDeals=true",
      data: todayDeals,
      description: "Giảm giá sốc chỉ hôm nay",
    },
    {
      id: "top-selling" as TabType,
      label: "Sản phẩm bán chạy",
      icon: "⭐",
      count: topSellingProducts.length,
      linkHref: "/list?topSelling=true",
      data: topSellingProducts,
      description: "Được mua nhiều nhất",
    },
    {
      id: "under-100k" as TabType,
      label: "Dưới 100k",
      icon: "💎",
      count: under100kProducts.length,
      linkHref: "/list?priceMax=100000",
      data: under100kProducts,
      description: "Giá cả phải chăng",
    },
  ];
  const currentData =
    activeTab === "today-deals" ? todayDeals : activeTab === "top-selling" ? topSellingProducts : under100kProducts;
  const currentLinkHref = tabs.find((tab) => tab.id === activeTab)?.linkHref || "";
  return (
    <div className="w-full mt-16">
      {/* Enhanced Tab Navigation Header with refined styling */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
        <div className="relative group">
          {/* Premium glassmorphism tab container */}
          <div className="relative inline-flex items-center bg-gradient-to-r from-white/90 to-slate-50/90 backdrop-blur-2xl rounded-3xl p-2 shadow-2xl shadow-gray-900/10 border border-white/30 ring-1 ring-gray-200/20">
            {/* Enhanced active tab background indicator with glow effect */}
            <div
              className="absolute top-2 bottom-2 bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 rounded-2xl shadow-xl shadow-blue-500/25 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
              style={{
                width: `calc(${100 / tabs.length}% - 4px)`,
                left: `calc(${(tabs.findIndex((tab) => tab.id === activeTab) * 100) / tabs.length}% + 2px)`,
              }}
            />{" "}
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`tabpanel-${tab.id}`}
                aria-describedby={`tab-desc-${tab.id}`}
                className={`
                  relative z-10 flex flex-col sm:flex-row items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-sm font-semibold
                  transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] rounded-2xl 
                  w-[120px] sm:w-[160px] flex-shrink-0
                  focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2 focus:ring-offset-white/50
                  hover:scale-[1.02] active:scale-[0.98] group/tab
                  ${
                    activeTab === tab.id
                      ? "text-white shadow-lg"
                      : "text-gray-700 hover:text-gray-900 hover:bg-white/60"
                  }
                `}
              >
                {/* Tab icon with enhanced animations */}
                <span
                  className={`text-lg transition-all duration-300 ${
                    activeTab === tab.id ? "scale-110 drop-shadow-sm" : "group-hover/tab:scale-105"
                  }`}
                >
                  {tab.icon}
                </span>

                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                  <span className="whitespace-nowrap text-center sm:text-left leading-tight">{tab.label}</span>
                  {tab.count > 0 && (
                    <span
                      className={`
                        inline-flex items-center justify-center min-w-[24px] h-6 px-2
                        text-xs font-bold rounded-full transition-all duration-300
                        shadow-sm border border-white/20
                        ${
                          activeTab === tab.id
                            ? "bg-white/25 text-white backdrop-blur-sm scale-105"
                            : "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md hover:shadow-lg hover:scale-105"
                        }
                      `}
                    >
                      {tab.count}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced "View All" link with premium styling */}
        <Link
          href={currentLinkHref}
          className="group inline-flex items-center gap-3 px-6 py-3.5 text-sm font-semibold
                     text-gray-600 hover:text-blue-600 bg-gradient-to-r from-gray-50/80 to-white/80 hover:from-blue-50/80 hover:to-blue-100/50
                     rounded-2xl border border-gray-200/60 hover:border-blue-300/60
                     transition-all duration-300 ease-out hover:shadow-xl hover:shadow-blue-500/15
                     hover:scale-105 active:scale-95 backdrop-blur-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-2"
        >
          <span>Xem tất cả</span>
          <div className="relative overflow-hidden">
            <svg
              className="w-4 h-4 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </div>{" "}
      {/* Enhanced Product Grid with premium styling */}
      <div role="tabpanel" id={`tabpanel-${activeTab}`} aria-labelledby={`tab-${activeTab}`} className="relative">
        {/* Multi-layered gradient overlay for premium depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-50/40 pointer-events-none rounded-3xl" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/10 via-transparent to-purple-50/10 pointer-events-none rounded-3xl" />

        <div className="relative grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6 p-2">
          {activeTab === "today-deals"
            ? todayDeals.map((deal, index) => (
                <div
                  key={deal.id}
                  className="group opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards] transform translate-y-8"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="transform transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-105 group-hover:-translate-y-3 group-hover:rotate-1">
                    <ProductCard
                      className="w-full h-full shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 ring-1 ring-gray-200/30 hover:ring-blue-300/50"
                      id={deal.sku}
                      name={deal.title}
                      price={+deal.properties[0].retailPrice}
                      dealPrice={+(deal.properties?.[0]?.salePrice ?? 0)}
                      imgUrl={deal.image || ""}
                      cardColor={deal.cardColor || "blue-500"}
                    />
                  </div>
                </div>
              ))
            : activeTab === "top-selling"
            ? topSellingProducts.map((product, index) => (
                <div
                  key={product.slug || product.id.toString()}
                  className="group opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards] transform translate-y-8"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="transform transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-105 group-hover:-translate-y-3 group-hover:rotate-1">
                    <ProductCard
                      id={product.slug || product.id.toString()}
                      className="w-full h-full shadow-lg hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 ring-1 ring-gray-200/30 hover:ring-purple-300/50"
                      name={product.title}
                      price={product.retailPrice}
                      dealPrice={product.salePrice}
                      imgUrl={product.image || ""}
                      cardColor={product.cardColor || "blue-500"}
                    />
                  </div>
                </div>
              ))
            : under100kProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="group opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards] transform translate-y-8"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="transform transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-105 group-hover:-translate-y-3 group-hover:rotate-1">
                    <ProductCard
                      className="w-full h-full shadow-lg hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-500 ring-1 ring-gray-200/30 hover:ring-green-300/50"
                      id={product.sku}
                      name={product.title}
                      price={product.properties?.[0] ? +product.properties[0].retailPrice : 0}
                      dealPrice={product.properties?.[0]?.salePrice ? +product.properties[0].salePrice : 0}
                      imgUrl={product.image || ""}
                      cardColor={product.cardColor || "blue-500"}
                    />
                  </div>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
};
