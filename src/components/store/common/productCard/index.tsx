"use client";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/shared/utils/styling";
import { BadgePercent, Heart, ShoppingCart } from "lucide-react";
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
        className={`absolute top-0 -translate-y-1/2 right-0 translate-x-1/2 h-56 w-56 rounded-full blur-3xl bg-${cardColor}`}
      />
      <div
        className={`absolute bottom-0 translate-y-1/2 left-0 -translate-x-1/2 h-56 w-56 rounded-full blur-3xl bg-${cardColor}`}
      />
      {!isAvailable && (
        <div className="w-full flex inset-0 bg-white/40 backdrop-blur-[1px] absolute z-[1] items-center justify-center rounded-lg">
          <span className="mt-14 text-gray-100 font-light px-6 py-1 backdrop-blur-[6px] rounded-md shadow-gray-200 bg-black/60">
            Hết hàng
          </span>
        </div>
      )}
      {dealPrice && (
        <div className="z-20 flex space-x-1 absolute left-6 top-4 text-center -translate-x-1/2 -rotate-45 text-white bg-red-700 text-lg px-16 py-[2px] items-center justify-center">
          <span className="text-xs font-semibold">Giảm {100 - (dealPrice / price) * 100} %</span>
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
          <p
            className={`border px-3 py-[2px] font-medium text-xs w-fit rounded-full bg-${cardColor} border-${cardColor}`}
          >
            Giải trí
          </p>
          <div className="flex items-center">
            <div className="flex-grow relative">
              {dealPrice ? (
                <div className="space-x-2">
                  <span className="w-full line-through text-white text-sm ml-2">
                    {fCurrency(price, { currency: "VND" })}
                  </span>
                  <span className="text-lg font-medium text-white">{fCurrency(dealPrice, { currency: "VND" })}</span>
                </div>
              ) : (
                <span className="text-lg font-medium text-white">{fCurrency(price, { currency: "VND" })}</span>
              )}
            </div>
            <button className={`rounded-full p-[5px] flex items-center justify-between`}>
              <div className={`bg-white rounded-full p-2 flex items-center justify-center`}>
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
