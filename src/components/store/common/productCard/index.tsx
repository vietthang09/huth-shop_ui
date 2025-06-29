"use client";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/shared/utils/styling";
import { BadgePercent, Heart, ShoppingCart, Star } from "lucide-react";
import { fCurrency } from "@/shared/utils/format-number";

type ProductCardProps = {
  id: string;
  sku: string;
  name: string;
  imgUrl: string;
  price: number;
  dealPrice?: number;
  isAvailable?: boolean;
  staticWidth?: boolean;
  cardColor?: string;
  className?: string;
};

const ProductCard = ({
  id,
  sku,
  name,
  imgUrl,
  price,
  dealPrice,
  isAvailable = true,
  staticWidth = false,
  className,
}: ProductCardProps) => {
  const discountPercentage = dealPrice ? Math.round(100 - (dealPrice / price) * 100) : 0;

  return (
    <div
      className={cn(
        "rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg relative overflow-hidden",
        "bg-gradient-to-br from-slate-800 via-slate-900 to-blue-900 border border-slate-700/50",
        staticWidth && "w-80",
        className
      )}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10" />
      {!isAvailable && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex items-center justify-center rounded-2xl">
          <span className="text-white font-medium px-4 py-2 bg-red-600/90 rounded-lg">Hết hàng</span>
        </div>
      )}
      {/* {dealPrice && (
        <div className="absolute top-3 left-3 z-20 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-md">
          -{discountPercentage}%
        </div>
      )} */}
      <Link href={`/san-pham/${sku}`} className="relative z-10 p-4 block group">
        {/* Product Image and Info Row */}
        <div className="flex items-center gap-4 mb-4">
          {/* Product Image */}
          <div className="flex-shrink-0 w-20 h-20 bg-slate-800/50 rounded-xl flex items-center justify-center border border-slate-600/50 group-hover:border-blue-500/50 transition-colors overflow-hidden">
            <Image src={imgUrl} alt={name} width={60} height={60} unoptimized className="h-full w-full object-cover" />
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-medium text-sm leading-tight group-hover:text-blue-300 transition-colors block mb-2">
              {name}
            </h3>

            {/* Price */}
            <div className="mb-2">
              {dealPrice ? (
                <div className="flex items-center gap-2">
                  <span className="text-orange-400 font-bold text-lg">{fCurrency(dealPrice, { currency: "VND" })}</span>
                  <span className="text-gray-400 line-through text-sm">{fCurrency(price, { currency: "VND" })}</span>
                </div>
              ) : (
                <span className="text-orange-400 font-bold text-lg">{fCurrency(price, { currency: "VND" })}</span>
              )}
            </div>
          </div>
        </div>

        {/* Order Button */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex justify-center items-center gap-2 bg-blue-600 group-hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium flex-1">
            <ShoppingCart className="w-4 h-4" />
            Mua ngay
          </div>
          <button
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-slate-800/50 rounded-lg transition-colors"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Handle favorite logic here
            }}
          >
            <Heart className="w-5 h-5" />
          </button>
        </div>

        {/* Rating and Sales */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, index) => (
              <Star key={index} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            ))}
          </div>
          <span className="text-xs text-gray-400">Đã bán 5.1k</span>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
