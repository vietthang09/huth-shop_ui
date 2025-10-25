"use client";

import BestSelling from "@/components/store/home/components/BestSelling";
import BuyingFlow from "@/components/store/home/components/BuyingFlow";
import Entertainment from "@/components/store/home/components/Entertainment";
import HighLight from "@/components/store/home/components/HighLight";
import Partnership from "@/components/store/home/components/Partnership";
import RecentlyVisit from "@/components/store/home/components/RecentlyVisit";
import Working from "@/components/store/home/components/Working";
import { Bot, Cloud, Computer, Globe, Music, PenLine, Phone, Play } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-4">
      <section className="h-fit relative">
        <video
          autoPlay
          muted
          loop
          preload="auto"
          src="https://res-video.hc-cdn.com/cloudbu-site/china/zh-cn/advertisement/Fixed/banner/GaussDB-2k.mp4"
        ></video>
        <div className="absolute top-0 bottom-0 left-0 w-fit pl-20 flex flex-col justify-center gap-4">
          <h2 className="text-3xl font-bold">Sản phẩm chất lượng.</h2>
          <p>Sản phẩm của chúng tôi được tuyển chọn kỹ lưỡng, đảm bảo chất lượng.</p>
          <Link
            href="#"
            className="border w-fit rounded-full px-4 py-2 text-xs inline-block text-center hover:bg-gray-300"
          >
            Xem sản phẩm
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-white/50 py-4">
          <div className="grid grid-cols-4 max-w-5xl mx-auto font-bold text-sm">
            <div className="flex items-center gap-4">
              <img
                className="w-8"
                src="https://res-static.hc-cdn.cn/cloudbu-site/intl/en-us/banner/d-%E8%A7%A3%E5%86%B3%E6%96%B9%E6%A1%88%E5%AE%9E%E8%B7%B5.png"
              />
              <span>Đa dạng</span>
            </div>
            <div className="flex items-center gap-4">
              <img
                className="w-8"
                src="https://res-static.hc-cdn.cn/cloudbu-site/intl/en-us/Banner/d-%E6%95%B0%E5%AD%97%E4%BA%BA.png"
              />
              <span>Xử lý nhanh chóng</span>
            </div>
            <div className="flex items-center gap-4">
              <img className="w-8" src="https://res-static.hc-cdn.cn/cloudbu-site/intl/en-us/CloudDC.png" />
              <span>Hỗ trợ 24/7</span>
            </div>
            <div className="flex items-center gap-4">
              <img
                className="w-8"
                src="https://res-static.hc-cdn.cn/cloudbu-site/intl/en-us/banner/%E4%BA%86%E8%A7%A3%E4%BA%91%E4%BA%A7%E5%93%81@2x.png"
              />
              <span>Bảo hành 1 đổi 1</span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto">
        <RecentlyVisit />
      </div>

      <div className="max-w-5xl mx-auto">
        <BestSelling />
      </div>

      <HighLight />

      <div className="mt-20 max-w-5xl mx-auto">
        <Entertainment />
      </div>

      <div className="mt-20 max-w-5xl mx-auto">
        <Working />
      </div>

      <div className="bg-gradient-to-br from-[#1d4ed8] via-[#2563eb] to-[#1e3a8a] py-10 px-4 2xl:px-0 rounded-xl">
        <Partnership />
      </div>

      <div className="mt-20 max-w-5xl mx-auto">
        <BuyingFlow />
      </div>
    </div>
  );
}
