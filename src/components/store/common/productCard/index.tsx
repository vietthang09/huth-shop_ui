"use client";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/shared/utils/styling";
import { BadgePercent, Heart, ShoppingCart, Star } from "lucide-react";
import { fCurrency } from "@/shared/utils/format-number";

type ProductCardProps = {
  id: string;
  name: string;
  imgUrl: string;
  price: number;
  dealPrice?: number;
  isAvailable?: boolean;
  staticWidth?: boolean;
  cardColor: string;
  className?: string;
};

const ProductCard = ({
  id,
  name,
  imgUrl,
  price,
  dealPrice = undefined,
  isAvailable = true,
  staticWidth = false,
  cardColor = "blue-500",
  className,
}: ProductCardProps) => {
  return (
    <div
      className={cn(
        "rounded-xl transition-all duration-500 flex items-center justify-center relative hover:drop-shadow-sm hover:[&_.imageWrapper>img:last-child]:opacity-100 hover:[&_.imageWrapper>img:last-child]:scale-[1.05]",
        "bg-black overflow-hidden",
        staticWidth && "w-64",
        className
      )}
    >
      <div
        className={`absolute top-0 -translate-y-1/2 right-0 translate-x-1/2 h-32 w-32 rounded-full blur-3xl bg-${cardColor}`}
      />
      <div
        className={`absolute bottom-0 translate-y-1/2 left-0 -translate-x-1/2 h-32 w-32 rounded-full blur-3xl bg-${cardColor}`}
      />
      {!isAvailable && (
        <div className="w-full flex inset-0 bg-white/40 backdrop-blur-[1px] absolute z-[1] items-center justify-center rounded-lg">
          <span className="mt-8 text-gray-100 font-light px-4 py-1 backdrop-blur-[6px] rounded-md shadow-gray-200 bg-black/60">
            Hết hàng
          </span>
        </div>
      )}
      {dealPrice && (
        <div className="z-20 flex space-x-1 absolute left-6 top-4 text-center -translate-x-1/2 -rotate-45 text-white bg-red-700 text-lg px-8 py-[2px] items-center justify-center">
          <span className="text-[10px] font-semibold">Giảm {100 - (dealPrice / price) * 100} %</span>
        </div>
      )}
      <div className="z-10 w-full h-full">
        <Link
          href={`/san-pham/${id}`}
          className="imageWrapper w-full h-[160px] flex items-center justify-center relative rounded-t-xl overflow-hidden transition-all duration-500"
        >
          <Image
            src={imgUrl}
            alt={name}
            width={100}
            height={100}
            className="h-32 w-32 p-4 object-contain transition-all duration-400 ease-out"
          />
        </Link>{" "}
        <div className="z-20 p-2 space-y-1 bg-linear-to-b from-black/10 h-32 to-black flex flex-col justify-between">
          <div>
            <Link href={`/san-pham/${id}`} className="inline-block text-white">
              {name}
            </Link>{" "}
            <div className="mt-2">
              <span className="inline-flex items-center bg-gradient-to-r from-green-500 to-green-600 text-white text-[10px] px-2 py-1 rounded-full font-semibold shadow-md border border-green-400/30 backdrop-blur-sm">
                <div className="w-1 h-1 bg-green-200 rounded-full mr-1.5 animate-pulse"></div>
                Nhận trong 1 phút
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center">
              <div className="text-yellow-400">
                {dealPrice ? (
                  <span>{fCurrency(dealPrice, { currency: "VND" })}</span>
                ) : (
                  <span>{fCurrency(price, { currency: "VND" })}</span>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center py-2">
              <div className="flex items-center space-x-1 mb-2">
                {[...Array(5)].map((_, index) => (
                  <Star key={index} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <span className="text-xs text-gray-100/60">Đã bán 81k</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
