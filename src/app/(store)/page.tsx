"use client";

import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import ProductCard from "@/components/store/common/ProductCard";
import BuyingFlow from "@/components/store/home/components/BuyingFlow";
import { Carousel } from "@/components/ui";
import { fCurrency } from "@/shared/utils/format-number";

export default function Home() {
  const categories = [
    {
      title: "Bestsellers",
      href: "#",
    },
    {
      title: "Games",
      href: "#",
    },
    {
      title: "Software",
      href: "#",
    },
    {
      title: "Pre-paids",
      href: "#",
    },
    {
      title: "Fragments",
      href: "#",
    },
    {
      icon: "https://cdn.k4g.com/files/marketing_menuitem/406d252a254529a5722e05593f46158d.png",
      title: "Cheap Accounts",
      href: "#",
    },
    {
      icon: "https://cdn.k4g.com/files/marketing_menuitem/c40fc8fbfd783da787d0ff338d18925d.png",
      title: "COD 7",
      href: "#",
    },
    {
      icon: "https://cdn.k4g.com/files/marketing_menuitem/2f85a3c8da36ef936434d02a8406e173.png",
      title: "ARC Raiders",
      href: "#",
    },
    {
      icon: "https://cdn.k4g.com/files/marketing_menuitem/f038659c6954e35f798741f5c487b632.png",
      title: "Game Pass",
      href: "#",
    },
  ];
  return (
    <div>
      <div className="bg-[#171a3c]">
        <div className="max-w-screen-2xl mx-auto flex divide-x divide-[#9597ae1a]">
          {categories.map((category) => (
            <Link
              className="py-4 flex-1 flex items-center gap-1 justify-center text-white text-lg font-bold text-center"
              href={category.href}
              key={category.href}
            >
              {category.icon && (
                <Image className="size-5" height={16} width={16} alt={category.title} src={category.icon} />
              )}
              {category.title}
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-[#000326] py-10">
        <div className="max-w-screen-xl mx-auto ">
          <Link href="/tim-kiem?asc=0&page=1" className="group">
            <h2 className="text-3xl text-white font-bold flex gap-1 items-center">
              Được mua nhiều nhất{" "}
              <ChevronRight className="size-4 text-gray-400 transition-all duration-500 group-hover:translate-x-1" />
            </h2>
            <p className="mt-1 text-gray-400">Tuyển chọn các sản phẩm đang &quot;làm mưa làm gió&quot;</p>
          </Link>
          <div className="mt-6 grid grid-cols-12 gap-6">
            <div className="col-span-9">
              <Carousel slidesToShow={4} slidesToScroll={2} autoPlay={true} showDots={true} showArrows={true} gap={24}>
                <ProductCard direction="vertical" />
                <ProductCard direction="vertical" />
                <ProductCard direction="vertical" />
                <ProductCard direction="vertical" />
                <ProductCard direction="vertical" />
                <ProductCard direction="vertical" />
                <ProductCard direction="vertical" />
                <ProductCard direction="vertical" />
                <ProductCard direction="vertical" />
                <ProductCard direction="vertical" />
                <ProductCard direction="vertical" />
                <ProductCard direction="vertical" />
              </Carousel>
            </div>

            <div className="col-span-3">
              <Image
                src="https://cdn.k4g.com/files/homepage_promo/fee01e73808f859daaf5ab0e537addef.jpg"
                height={100}
                width={100}
                alt="banner"
                unoptimized
                className="h-full w-full rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#000326] py-10">
        <div className="max-w-screen-xl mx-auto">
          <h2 className="text-3xl text-white font-bold flex gap-1 items-center">
            Đang giảm giá <ChevronRight className="size-4 text-gray-400" />
          </h2>
          <p className="mt-1 text-gray-400">Săn Deal Hời Nhất! Toàn bộ sản phẩm được giảm giá đặc biệt.</p>

          <div className="mt-6">
            <Carousel slidesToShow={6} slidesToScroll={2} autoPlay={true} showDots={true} showArrows={true} gap={24}>
              <ProductCard direction="vertical" />
              <ProductCard direction="vertical" />
              <ProductCard direction="vertical" />
              <ProductCard direction="vertical" />
              <ProductCard direction="vertical" />
              <ProductCard direction="vertical" />
              <ProductCard direction="vertical" />
              <ProductCard direction="vertical" />
              <ProductCard direction="vertical" />
              <ProductCard direction="vertical" />
              <ProductCard direction="vertical" />
              <ProductCard direction="vertical" />
            </Carousel>
          </div>
        </div>
      </div>

      <div className="bg-[#000326] py-10">
        <div className="max-w-screen-xl mx-auto">
          <h2 className="text-3xl text-white font-bold flex gap-1 items-center">
            Sản phẩm được đánh giá cao <ChevronRight className="size-4 text-gray-400" />
          </h2>
          <p className="mt-1 text-gray-400">
            Danh sách các sản phẩm Đánh giá Tuyệt đối. Nơi chỉ có chất lượng hàng đầu.
          </p>

          <div className="mt-6 grid grid-cols-3 gap-6">
            <ProductCard />
            <ProductCard />
            <ProductCard />
            <ProductCard />
            <ProductCard />
            <ProductCard />
          </div>
        </div>
      </div>

      <div className="bg-white py-10">
        <div className="max-w-screen-xl mx-auto">
          <h2 className="text-3xl text-black font-bold flex gap-1 items-center">
            Sản phẩm mới <ChevronRight className="size-4 text-gray-400" />
          </h2>
          <p className="mt-1 text-gray-400">Những sản phẩm vừa &quot;lên kệ&quot; nóng hổi nhất.</p>

          <div className="mt-6 grid grid-cols-6 gap-2 bg-[#f3f4fa] p-2 rounded-xl">
            <ProductCard theme="light" direction="vertical" />
            <ProductCard theme="light" direction="vertical" />
            <ProductCard theme="light" direction="vertical" />
            <ProductCard theme="light" direction="vertical" />
            <ProductCard theme="light" direction="vertical" />
            <ProductCard theme="light" direction="vertical" />
          </div>
        </div>
      </div>

      <div className="bg-white py-10">
        <div className="max-w-screen-xl mx-auto">
          <h2 className="text-3xl text-black font-bold">Xu hướng gần đây</h2>
          <p className="mt-1 text-gray-400">
            Những sản phẩm đang được tìm kiếm, chia sẻ và mua sắm nhiều nhất chỉ trong 24 giờ qua.
          </p>

          <div className="mt-6 grid grid-cols-6 gap-2 bg-[#f3f4fa] p-2 rounded-xl">
            <ProductCard theme="light" direction="vertical" />
            <ProductCard theme="light" direction="vertical" />
            <ProductCard theme="light" direction="vertical" />
            <ProductCard theme="light" direction="vertical" />
            <ProductCard theme="light" direction="vertical" />
            <ProductCard theme="light" direction="vertical" />
          </div>
        </div>
      </div>

      <div className="bg-[#000326] py-10">
        <div className="max-w-screen-xl mx-auto">
          <h2 className="text-3xl text-white font-bold">Cheap Products</h2>
          <p className="mt-1 text-gray-400">Check our best products for the lowest prices!</p>
          <div className="mt-6 grid grid-cols-6 gap-4">
            <div className="text-black relative bg-white rounded-xl overflow-hidden h-44 group flex items-center justify-center">
              <Image
                src="https://k4g.com/images/bg-price-card@2x.png"
                width={100}
                height={100}
                alt="bg"
                className="absolute inset-0 w-full h-full object-contain group-hover:scale-125"
              />
              <div className="bg-black h-6 w-6 rounded-full absolute top-6 right-6" />
              <div className="">
                <p className="text-2xl font-bold">Up to</p>
                <p className="text-3xl font-bold">{fCurrency(20000, { currency: "VND" })}</p>
              </div>
            </div>
            <div className="text-black relative bg-white rounded-xl overflow-hidden h-44 group flex items-center justify-center">
              <Image
                src="https://k4g.com/images/bg-price-card@2x.png"
                width={100}
                height={100}
                alt="bg"
                className="absolute inset-0 w-full h-full object-contain group-hover:scale-125"
              />
              <div className="bg-black h-6 w-6 rounded-full absolute top-6 right-6" />
              <div className="">
                <p className="text-2xl font-bold">Up to</p>
                <p className="text-3xl font-bold">{fCurrency(20000, { currency: "VND" })}</p>
              </div>
            </div>
            <div className="text-black relative bg-white rounded-xl overflow-hidden h-44 group flex items-center justify-center">
              <Image
                src="https://k4g.com/images/bg-price-card@2x.png"
                width={100}
                height={100}
                alt="bg"
                className="absolute inset-0 w-full h-full object-contain group-hover:scale-125"
              />
              <div className="bg-black h-6 w-6 rounded-full absolute top-6 right-6" />
              <div className="">
                <p className="text-2xl font-bold">Up to</p>
                <p className="text-3xl font-bold">{fCurrency(20000, { currency: "VND" })}</p>
              </div>
            </div>
            <div className="text-black relative bg-white rounded-xl overflow-hidden h-44 group flex items-center justify-center">
              <Image
                src="https://k4g.com/images/bg-price-card@2x.png"
                width={100}
                height={100}
                alt="bg"
                className="absolute inset-0 w-full h-full object-contain group-hover:scale-125"
              />
              <div className="bg-black h-6 w-6 rounded-full absolute top-6 right-6" />
              <div className="">
                <p className="text-2xl font-bold">Up to</p>
                <p className="text-3xl font-bold">{fCurrency(20000, { currency: "VND" })}</p>
              </div>
            </div>
            <div className="text-black relative bg-white rounded-xl overflow-hidden h-44 group flex items-center justify-center">
              <Image
                src="https://k4g.com/images/bg-price-card@2x.png"
                width={100}
                height={100}
                alt="bg"
                className="absolute inset-0 w-full h-full object-contain group-hover:scale-125"
              />
              <div className="bg-black h-6 w-6 rounded-full absolute top-6 right-6" />
              <div className="">
                <p className="text-2xl font-bold">Up to</p>
                <p className="text-3xl font-bold">{fCurrency(20000, { currency: "VND" })}</p>
              </div>
            </div>
            <div className="text-black relative bg-white rounded-xl overflow-hidden h-44 group flex items-center justify-center">
              <Image
                src="https://k4g.com/images/bg-price-card@2x.png"
                width={100}
                height={100}
                alt="bg"
                className="absolute inset-0 w-full h-full object-contain group-hover:scale-125"
              />
              <div className="bg-black h-6 w-6 rounded-full absolute top-6 right-6" />
              <div className="">
                <p className="text-2xl font-bold">Up to</p>
                <p className="text-3xl font-bold">{fCurrency(20000, { currency: "VND" })}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 max-w-7xl mx-auto lg:px-4 space-y-10">
        <BuyingFlow />
      </div>
    </div>
  );
}
