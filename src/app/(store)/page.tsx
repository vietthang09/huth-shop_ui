"use client";

import ProductCard from "@/components/store/common/ProductCard";
import WhyChooseUs from "@/components/store/home/WhyChooseUs";
import { findAll as findProducts } from "@/services/product";
import { findAll as findCategories } from "@/services/category";
import { Category, Product } from "@/services/type";
import { cn } from "@/shared/utils/styling";
import { Clapperboard, Cpu, Grid2X2, Laptop, ListMusic, Menu } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { DynamicIcon } from "lucide-react/dynamic";
import {CircularProgress} from "@heroui/react";

const App = () => <DynamicIcon name="camera" color="red" size={48} />;
export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const tabs = [
    { name: "Tất cả", icon: <Grid2X2 /> },
    {
      id: 1,
      name: "Video",
      icon: <Clapperboard />,
    },
    {
      id: 2,
      name: "Âm nhạc",
      icon: <ListMusic />,
    },
    {
      name: "AI",
      icon: <Cpu />,
    },
    {
      name: "Phần mềm",
      icon: <Laptop />,
    },
  ];
  const [selectedTab, setSelectedTab] = useState<number>(0);

  const [products, setProducts] = useState<Array<Product>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await findProducts({ categoryId: selectedTab || undefined });
        setProducts(response.data.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false)
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await findCategories({ limit: 4 });
        setCategories(response.data.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchProducts();
    fetchCategories();
  }, [selectedTab]);

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
        {isLoading ? 
          <div className="min-h-96 flex justify-center items-center">
            <CircularProgress aria-label="Loading..." size="lg" color="primary" />
          </div>
        :
          <div className="-translate-y-24 max-w-7xl mx-auto z-50">
            <div className="mt-4 grid grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="mt-4 w-full flex">
              <button className="mx-auto bg-gray-50 font-bold text-sm rounded-full py-3 min-w-[400px] hover:bg-gray-100 transition-colors duration-300">
                Xem thêm
              </button>
            </div>
          </div>
        }
      </div>

      <div className="max-w-7xl mx-auto">
        <WhyChooseUs />
      </div>
    </div>
  );
}
