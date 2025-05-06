"use client";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/shared/utils/styling";
import { TProductCard } from "@/types/common";
import { BadgePercent, ShoppingCart } from "lucide-react";

const ProductCard = ({
  name,
  imgUrl,
  price,
  dealPrice = undefined,
  specs,
  url,
  isAvailable = true,
  staticWidth = false,
  fromColor,
  toColor,
}: TProductCard) => {
  const mainColor = "green";
  return (
    <div
      className={cn(
        "rounded-xl p-2 transition-all duration-500 relative hover:drop-shadow-sm hover:[&_.imageWrapper>img:last-child]:opacity-100 hover:[&_.imageWrapper>img:last-child]:scale-[1.05]",
        "bg-black",
        staticWidth && "w-64"
      )}
    >
      {dealPrice && (
        <div className="flex space-x-1 absolute right-2 text-red-600 bg-orange-200 text-lg rounded-full px-2 py-[2px] top-2 items-center justify-center">
          <BadgePercent className="w-5" />
          <span className="text-sm font-semibold">
            -
            {(100 - (dealPrice / price) * 100).toLocaleString("vi-VN", {
              maximumFractionDigits: 0,
            })}
            %
          </span>
        </div>
      )}
      <Link href={url}>
        {!isAvailable && (
          <div className="flex left-2 right-2 bottom-2 top-2 bg-white/40 backdrop-blur-[1px] absolute z-[1] items-center justify-center rounded-lg">
            <span className="mt-14 text-gray-100 font-light px-6 py-1 backdrop-blur-[6px] rounded-md shadow-gray-200 bg-black/60">
              Hết hàng
            </span>
          </div>
        )}
        <div className="imageWrapper w-full h-[280px] flex items-center justify-center relative rounded-xl overflow-hidden transition-all duration-500">
          <div className={`bg-${mainColor}-500 h-40 w-40 rounded-full blur-xl`} />
          <Image
            src={imgUrl[0]}
            alt={name}
            fill
            className="h-32 w-32 p-8 object-contain transition-all duration-400 ease-out"
          />
        </div>
        <span className="mt-2 inline-block text-lg font-medium text-white">{name}</span>
      </Link>
      <div className="mt-3 flex items-center">
        <div className="flex-grow relative">
          {dealPrice ? (
            <div className="space-x-2">
              <span className="w-full line-through text-white text-sm ml-2">
                {price.toLocaleString("vi-VN", { minimumFractionDigits: 0 })}₫
              </span>
              <span className="text-lg font-medium text-white">
                {dealPrice.toLocaleString("vi-VN", {
                  minimumFractionDigits: 0,
                })}
                ₫
              </span>
            </div>
          ) : (
            <span className="text-lg font-medium text-white">
              {price.toLocaleString("vi-VN", { minimumFractionDigits: 0 })}₫
            </span>
          )}
        </div>
        <button className={`bg-${mainColor}-50 rounded-full p-[5px] flex items-center justify-between`}>
          <div className={`bg-white text-${mainColor}-500 rounded-full p-2 flex items-center justify-center`}>
            <ShoppingCart className="w-4 h-4" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
