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
  // Show loading skeleton while data is being fetched
  if (isLoading) {
    return (
      <div className="w-full mt-14">
        {" "}
        {/* Loading Tab Navigation */}
        <div className="flex w-full justify-between items-center mb-8">
          <div className="relative flex bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-1.5 shadow-sm border border-gray-200/50">
            {[1, 2, 3].map((index) => (
              <div key={index} className="flex items-center px-6 py-3 rounded-lg">
                <div className="h-4 bg-gray-300 rounded animate-pulse w-24"></div>
                <div className="ml-3 w-5 h-5 bg-gray-300 rounded-full animate-pulse"></div>
              </div>
            ))}
          </div>
          <div className="h-4 bg-gray-300 rounded animate-pulse w-20"></div>
        </div>
        {/* Loading Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-48 mb-2"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
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
      count: todayDeals.length,
      linkHref: "/list?hotDeals=true",
      data: todayDeals,
    },
    {
      id: "top-selling" as TabType,
      label: "Sản phẩm bán chạy",
      count: topSellingProducts.length,
      linkHref: "/list?topSelling=true",
      data: topSellingProducts,
    },
    {
      id: "under-100k" as TabType,
      label: "Dưới 100k",
      count: under100kProducts.length,
      linkHref: "/list?priceMax=100000",
      data: under100kProducts,
    },
  ];
  const currentData =
    activeTab === "today-deals" ? todayDeals : activeTab === "top-selling" ? topSellingProducts : under100kProducts;
  const currentLinkHref = tabs.find((tab) => tab.id === activeTab)?.linkHref || "";
  return (
    <div className="w-full mt-14">
      {/* Tab Navigation - Segmented Control Style */}
      <div className="flex w-full justify-between items-center mb-2">
        <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
              className={`
                relative flex items-center gap-2 px-4 py-2 text-sm font-medium 
                rounded-md transition-all duration-200 ease-out
                focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2
                ${activeTab === tab.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}
              `}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className={`
                    inline-flex items-center justify-center w-5 h-5 
                    text-xs font-bold rounded-full transition-all duration-200
                    ${activeTab === tab.id ? "bg-blue-500 text-white" : "bg-gray-400 text-white"}
                  `}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <Link
          href={currentLinkHref}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 
                     hover:text-blue-600 transition-colors duration-200"
        >
          <span>Xem tất cả</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      {/* Product Grid */}
      <div
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="transition-all duration-300 ease-in-out"
      >
        {" "}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {activeTab === "today-deals"
            ? todayDeals.map((deal, index) => (
                <div
                  key={deal.id}
                  className="opacity-0 animate-[fadeIn_0.4s_ease-out_forwards] transform translate-y-4"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ProductCard
                    className="w-full h-full"
                    id={deal.sku}
                    name={deal.title}
                    price={+deal.properties[0].retailPrice}
                    dealPrice={+(deal.properties?.[0]?.salePrice ?? 0)}
                    imgUrl={deal.image || ""}
                    cardColor={deal.cardColor || "blue-500"}
                  />
                </div>
              ))
            : activeTab === "top-selling"
            ? topSellingProducts.map((product, index) => (
                <div
                  key={product.slug || product.id.toString()}
                  className="opacity-0 animate-[slideInUp_0.4s_ease-out_forwards] transform translate-y-4"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ProductCard
                    id={product.slug || product.id.toString()}
                    className="w-full h-full"
                    name={product.title}
                    price={product.retailPrice}
                    dealPrice={product.salePrice}
                    imgUrl={product.image || ""}
                    cardColor={product.cardColor || "blue-500"}
                  />
                </div>
              ))
            : under100kProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="opacity-0 animate-[slideInUp_0.4s_ease-out_forwards] transform translate-y-4"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ProductCard
                    className="w-full h-full"
                    id={product.sku}
                    name={product.title}
                    price={product.properties?.[0] ? +product.properties[0].retailPrice : 0}
                    dealPrice={product.properties?.[0]?.salePrice ? +product.properties[0].salePrice : 0}
                    imgUrl={product.image || ""}
                    cardColor={product.cardColor || "blue-500"}
                  />
                </div>
              ))}
        </div>
      </div>
    </div>
  );
};
