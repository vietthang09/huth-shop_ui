import { Bot, Cloud, Computer, Globe, Music, Pen, PenLine, Phone, Play } from "lucide-react";
import RecentlyVisit from "./components/RecentlyVisit";
import Trending from "./components/Trending";
import BestSelling from "./components/BestSelling";
import Entertainment from "./components/Entertainment";
import Working from "./components/Working";
import Partnership from "./components/Partnership";
import Link from "next/link";

export default function HomePage() {
  const categories = [
    {
      title: "Âm nhạc",
      icon: <Music className="size-8" />,
      slug: "am-nhac",
    },
    {
      title: "Phim ảnh",
      icon: <Play className="size-8" />,
      slug: "phim-anh",
    },
    {
      title: "Công việc",
      icon: <Computer className="size-8" />,
      slug: "cong-viec",
    },
    {
      title: "A.I",
      icon: <Bot className="size-8" />,
      slug: "ai",
    },
    {
      title: "Đồ họa",
      icon: <PenLine className="size-8" />,
      slug: "do-hoa",
    },
    {
      title: "Lữu trữ",
      icon: <Cloud className="size-8" />,
      slug: "luu-tru",
    },
  ];
  return (
    <div className="space-y-4">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1d4ed8] via-[#2563eb] to-[#1e3a8a] lg:min-h-[40vh] flex items-stretch px-4 2xl:px-0">
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

          <div className="flex overflow-x-auto">
            {categories.map((category, index) => (
              <Link
                key={index}
                href={`/danh-muc/${category.slug}`}
                className="group mt-6 w-32 inline-block text-white hover:text-gray-800 hover:bg-white text-gray-900 p-6 rounded-t-xl text-sm font-semibold cursor-pointer"
              >
                <div className="flex justify-center group-hover:text-blue-500">{category.icon}</div>
                <p className="mt-2 text-center">{category.title}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      {/* End Hero */}
      {/* Recently Visit */}
      <div className="max-w-7xl mx-auto flex flex-col gap-4 px-4 2xl:px-0">
        <RecentlyVisit />
      </div>
      {/* End Recently Visit */}

      {/* Best Selling */}
      <div className="bg-gray-200 py-10 px-4 2xl:px-0">
        <BestSelling />
      </div>
      {/* End Best Selling */}

      {/* Trending */}
      <div className="max-w-7xl mx-auto flex flex-col gap-4 px-4 2xl:px-0">
        <Trending />
      </div>
      {/* End Trending */}

      {/* Entertainment */}
      <div className="max-w-7xl mx-auto flex flex-col gap-4 px-4 2xl:px-0">
        <Entertainment />
      </div>
      {/* End Entertainment */}

      {/* Working */}
      <div className="max-w-7xl mx-auto flex flex-col gap-4 px-4 2xl:px-0">
        <Working />
      </div>
      {/* End Working */}

      {/* Partner */}
      <div className="bg-gradient-to-br from-[#1d4ed8] via-[#2563eb] to-[#1e3a8a] py-10 px-4 2xl:px-0">
        <Partnership />
      </div>
      {/* End Partner */}
    </div>
  );
}
