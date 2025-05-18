"use client";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/shared/utils/styling";
import { BadgePercent, Heart, ShoppingCart } from "lucide-react";

type ProductCardProps = {
  id: string;
  name: string;
  imgUrl: string;
  price: number;
  dealPrice?: number;
  isAvailable?: boolean;
  staticWidth?: boolean;
  mainColor?: string;
};

const ProductCard = ({
  id,
  name,
  imgUrl,
  price,
  dealPrice = undefined,
  isAvailable = true,
  staticWidth = false,
}: ProductCardProps) => {
  return (
    <div
      className={cn(
        "rounded-xl transition-all duration-500 flex items-center justify-center relative hover:drop-shadow-sm hover:[&_.imageWrapper>img:last-child]:opacity-100 hover:[&_.imageWrapper>img:last-child]:scale-[1.05]",
        "bg-black overflow-hidden",
        staticWidth && "w-64"
      )}
    >
      <div
        className={`absolute top-0 -translate-y-1/2 right-0 translate-x-1/2 bg-green-600/50 h-56 w-56 rounded-full blur-3xl`}
      />
      <div
        className={`absolute bottom-0 translate-y-1/2 left-0 -translate-x-1/2 bg-green-600/50 h-56 w-56 rounded-full blur-3xl`}
      />

      <button
        className={`w-8 h-8 p-2 absolute top-2 right-2 text-green-500 bg-white rounded-full flex items-center justify-center`}
      >
        <Heart />
      </button>

      {!isAvailable && (
        <div className="w-full border border-red-500 flex left-2 right-2 bottom-2 top-2 bg-white/40 backdrop-blur-[1px] absolute z-[1] items-center justify-center rounded-lg">
          <span className="mt-14 text-gray-100 font-light px-6 py-1 backdrop-blur-[6px] rounded-md shadow-gray-200 bg-black/60">
            Hết hàng
          </span>
        </div>
      )}

      {dealPrice && (
        <div className="z-20 flex space-x-1 absolute left-6 top-4 text-center -translate-x-1/2 -rotate-45 text-white bg-red-700 text-lg px-16 py-[2px] items-center justify-center">
          <span className="text-sm font-semibold">
            Sale{" "}
            {(100 - (dealPrice / price) * 100).toLocaleString("vi-VN", {
              maximumFractionDigits: 0,
            })}
            %
          </span>
        </div>
      )}

      <div className="z-10 w-full h-full">
        <Link
          href={`/product/${id}`}
          className="imageWrapper w-full h-[240px] flex items-center justify-center relative rounded-t-xl overflow-hidden transition-all duration-500"
        >
          <Image
            src={imgUrl}
            alt={name}
            fill
            className="h-32 w-32 p-8 object-contain transition-all duration-400 ease-out"
          />
        </Link>
        <div className="z-20 p-3 space-y-2 bg-linear-to-b from-black/10 to-black">
          <Link href={`/product/${id}`} className="inline-block text-lg font-medium text-white">
            {name}
          </Link>
          <p className={`text-green-400 border border-green-400 px-3 py-[2px] font-medium text-xs w-fit rounded-full`}>
            Giải trí
          </p>
          <div className="flex items-center">
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
            <button className={`bg-green-50 rounded-full p-[5px] flex items-center justify-between`}>
              <div className={`bg-white text-green-500 rounded-full p-2 flex items-center justify-center`}>
                <ShoppingCart className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
