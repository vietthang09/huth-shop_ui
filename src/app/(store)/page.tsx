"use client";

import BuyingFlow from "@/components/store/home/components/BuyingFlow";
import Entertainment from "@/components/store/home/components/Entertainment";
import HighLight from "@/components/store/home/components/HighLight";
import Partnership from "@/components/store/home/components/Partnership";
import RecentlyVisit from "@/components/store/home/components/RecentlyVisit";
import Working from "@/components/store/home/components/Working";
import { Bot, Cloud, Computer, Globe, Link, Music, PenLine, Phone, Play } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-4">
      <section className="bg-gradient-to-br from-[#1d4ed8] via-[#2563eb] to-[#1e3a8a] lg:min-h-[40vh] flex items-stretch px-4 2xl:px-0 rounded-xl">
        <div className="pt-20 max-w-7xl w-full mx-auto self-end">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div>
              <h1 className="text-white text-2xl lg:text-7xl font-bold">
                Nâng tầm <br className="hidden lg:block" /> trải nghiệm số
              </h1>
              <p className="text-white mt-2">Thế giới số trong tầm tay bạn.</p>

              <div className="mt-8 lg:mt-20 flex gap-4 text-white text-sm lg:text-base">
                <p>
                  <Globe className="inline" />
                  <span className="ml-2 leading-10">Bảo hành trọn đời</span>
                </p>
                <p>
                  <Phone className="inline" />
                  <span className="ml-2 leading-10">Hỗ trợ 24/7</span>
                </p>
              </div>
            </div>

            <img
              className="h-full max-h-40 lg:max-h-96 w-auto"
              src="https://assets.g2g.com/ui/img/banners/G2G-550x550-20250509.webp"
            />
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto">
        <RecentlyVisit />
      </div>

      <div className="bg-gray-200 py-10 px-4 2xl:px-0">{/* <BestSelling /> */}</div>

      <HighLight />

      <div className="max-w-7xl mx-auto flex flex-col gap-4 px-4 2xl:px-0">{/* <Trending /> */}</div>

      <div className="mt-20 max-w-5xl mx-auto">
        <Entertainment />
      </div>

      <div className="mt-20 max-w-5xl mx-auto">
        <Working />
      </div>

      <div className="bg-gradient-to-br from-[#1d4ed8] via-[#2563eb] to-[#1e3a8a] py-10 px-4 2xl:px-0">
        <Partnership />
      </div>

      <div className="mt-20 max-w-5xl mx-auto">
        <BuyingFlow />
      </div>
    </div>
  );
}
