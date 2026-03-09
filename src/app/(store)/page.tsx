"use client";

import ProductCard from "@/components/store/common/ProductCard";
import WhyChooseUs from "@/components/store/home/WhyChooseUs";
import { findAll as findProducts } from "@/services/product";
import { findAll as findCategories } from "@/services/category";
import { Category, Product } from "@/services/type";
import { cn } from "@/shared/utils/styling";
import { Menu } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { DynamicIcon } from "lucide-react/dynamic";
import { Button, CircularProgress } from "@heroui/react";

export default function Home() {
  const PRODUCTS_PER_PAGE = 12;

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedTab, setSelectedTab] = useState<number>(0);

  const [products, setProducts] = useState<Array<Product>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMoreProducts, setHasMoreProducts] = useState<boolean>(true);

  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await findProducts({
          categoryId: selectedTab || undefined,
          page: 1,
          limit: PRODUCTS_PER_PAGE,
        });
        const fetchedProducts = response.data.data;

        setProducts(fetchedProducts);
        setPage(1);
        setHasMoreProducts(fetchedProducts.length === PRODUCTS_PER_PAGE);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [selectedTab]);

  const handleLoadMoreProducts = async () => {
    if (isLoadingMore || isLoading || !hasMoreProducts) {
      return;
    }

    const nextPage = page + 1;

    try {
      setIsLoadingMore(true);
      const response = await findProducts({
        categoryId: selectedTab || undefined,
        page: nextPage,
        limit: PRODUCTS_PER_PAGE,
      });

      const fetchedProducts = response.data.data;
      setProducts((prevProducts) => [...prevProducts, ...fetchedProducts]);
      setPage(nextPage);
      setHasMoreProducts(fetchedProducts.length === PRODUCTS_PER_PAGE);
    } catch (error) {
      console.error("Error loading more products:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await findCategories({ limit: 4 });
        setCategories(response.data.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="pb-8">
      <div>
        <div className="bg-[#ef534f] relative">
          <div className="py-20 pb-28 max-w-7xl mx-auto z-50">
            <h1 className="text-3xl text-center !text-white/80 font-bold">Tài khoản Premium giá rẻ từ HuthShop</h1>
            <p className="mt-2 text-lg text-center !text-white/80">
              Cung cấp các tài khoản chất lượng, bảo hành trọn đời
            </p>
            <div className="mt-10 w-fit flex gap-2 mx-auto pb-2 border-b-2 border-white/20">
              <div>
                <div
                  className={cn(
                    "text-sm font-bold flex flex-col items-center justify-center gap-2 text-white/80 p-2 w-24 h-20 rounded-xl cursor-pointer",
                    selectedTab === 0 ? "bg-white text-[#ef534f] transition-all duration-300" : "hover:bg-white/20",
                  )}
                  onClick={() => setSelectedTab(0)}
                >
                  <Menu />
                  <span className="text-nowrap">Tất cả</span>
                </div>
              </div>
              {categories.map((category) => (
                <div key={category.id}>
                  <div
                    className={cn(
                      "text-sm font-bold flex flex-col items-center justify-center gap-2 text-white/80 p-2 w-24 h-20 rounded-xl cursor-pointer",
                      selectedTab === category.id
                        ? "bg-white text-[#ef534f] transition-all duration-300"
                        : "hover:bg-white/20",
                    )}
                    onClick={() => setSelectedTab(category.id)}
                  >
                    <DynamicIcon name={(category.icon as any) || "file"} size={24} />

                    <span className="text-nowrap">{category.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Image
            src="/images/header-radian.svg"
            alt="Header Radian"
            width={1920}
            height={30}
            className="absolute bottom-0 w-full translate-y-full"
          />
        </div>
        {isLoading ? (
          <div className="min-h-96 flex justify-center items-center">
            <CircularProgress aria-label="Loading..." size="lg" color="primary" />
          </div>
        ) : (
          <div className="-translate-y-24 max-w-7xl mx-auto z-50">
            <div className="mt-4 grid grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {hasMoreProducts && (
              <div className="mt-4 w-full flex">
                <Button
                  onPress={handleLoadMoreProducts}
                  disabled={!hasMoreProducts || isLoadingMore}
                  variant="bordered"
                  className="mx-auto min-w-44"
                >
                  {isLoadingMore ? "Đang tải..." : hasMoreProducts ? "Xem thêm" : "Đã hiển thị tất cả"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto">
        <WhyChooseUs />
      </div>
    </div>
  );
}
