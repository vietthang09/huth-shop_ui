"use client";

import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Filter from "@/features/store/search/filter";
import { Button, Input, Select } from "@/components/ui";
import ProductCard from "@/components/store/common/ProductCard";

export default function SearchPage() {
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
      <div className="max-w-screen-xl mx-auto mt-4">
        <Image
          src="https://cdn.k4g.com/files/marketing_placement/eac86eec81f2590b37e5baf0f2cc8d60.png"
          width={100}
          height={96}
          alt="banner"
          className="w-full rounded-xl"
          unoptimized
        />
        <div className="mt-4 grid grid-cols-12 gap-6">
          <div className="col-span-2">
            <Filter />
          </div>
          <div className="col-span-10 bg-[#f4f5fa] p-2 rounded-xl">
            <div className="flex justify-between items-center">
              <div>Switch</div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <span className="text-gray-700 font-bold text-sm">Sắp xếp theo</span>
                  <Select>
                    <option>Bán chạy</option>
                    <option>Đánh giá</option>
                    <option>Tên</option>
                    <option>Giá thấp trước</option>
                    <option>Giá cao trước</option>
                    <option>Giảm giá</option>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Input className="w-12 text-center" value={1} />
                  <span className="text-sm">của</span>
                  <span className="text-sm">2157</span>
                  <Button variant="link">
                    <ChevronRight />
                  </Button>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-5 gap-4">
              <ProductCard direction="vertical" theme="light" />
              <ProductCard direction="vertical" theme="light" />
              <ProductCard direction="vertical" theme="light" />
              <ProductCard direction="vertical" theme="light" />
              <ProductCard direction="vertical" theme="light" />
              <ProductCard direction="vertical" theme="light" />
              <ProductCard direction="vertical" theme="light" />
              <ProductCard direction="vertical" theme="light" />
              <ProductCard direction="vertical" theme="light" />
              <ProductCard direction="vertical" theme="light" />
              <ProductCard direction="vertical" theme="light" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
