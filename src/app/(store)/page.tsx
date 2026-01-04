"use client";

import ProductCard from "@/components/store/common/ProductCard";
import WhyChooseUs from "@/components/store/home/WhyChooseUs";
import { cn } from "@/shared/utils/styling";
import { Clapperboard, Cpu, Grid2X2, Laptop, ListMusic, Menu } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const tabs = [
    { name: "Tất cả", icon: <Grid2X2 /> },
    {
      name: "Video",
      icon: <Clapperboard />,
    },
    {
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
  const [selectedTab, setSelectedTab] = useState(tabs[0]);
  return (
    <div className="pb-8">
      <div>
        <div className="bg-[#ef534f] relative">
          <div className="py-20 pb-28 max-w-7xl mx-auto z-50">
            <h1 className="text-3xl text-center text-white/80 font-bold">Tài khoản Premium giá rẻ từ HuthShop</h1>
            <p className="mt-2 text-lg text-center text-white/80">
              Cung cấp các tài khoản chất lượng, bảo hành trọn đời
            </p>
            <div className="mt-10 w-fit flex gap-2 mx-auto pb-2 border-b-2 border-white/20">
              {tabs.map((tab) => (
                <div key={tab.name}>
                  <div
                    className={cn(
                      "text-sm font-bold flex flex-col items-center justify-center gap-2 text-white/80 p-2 w-24 h-20 rounded-xl cursor-pointer",
                      selectedTab.name === tab.name
                        ? "bg-white text-[#ef534f] transition-all duration-300"
                        : "hover:bg-white/20"
                    )}
                    onClick={() => setSelectedTab(tab)}
                  >
                    {tab.icon}
                    <span className="text-nowrap">{tab.name}</span>
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
        <div className="-translate-y-24 max-w-7xl mx-auto z-50">
          <div className="mt-4 grid grid-cols-4 gap-4">
            <ProductCard />
            <ProductCard />
            <ProductCard isSales={true} />
            <ProductCard isSales={true} />
            <ProductCard />
            <ProductCard />
            <ProductCard />
            <ProductCard />
            <ProductCard />
            <ProductCard />
            <ProductCard />
            <ProductCard />
          </div>

          <div className="mt-4 w-full flex">
            <button className="mx-auto bg-gray-50 font-bold text-sm rounded-full py-3 min-w-[400px] hover:bg-gray-100 transition-colors duration-300">
              Xem thêm
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <WhyChooseUs />
      </div>
    </div>
  );
}
