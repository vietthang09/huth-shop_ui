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
        "group relative overflow-hidden rounded-3xl bg-white/95 backdrop-blur-sm border border-gray-200/80",
        "transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/20",
        "hover:border-blue-300/50 hover:bg-white",
        staticWidth && "w-80",
        className
      )}
    >
      {/* Modern gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Discount badge */}
      {/* {dealPrice && (
        <div className="absolute top-4 left-4 z-20 flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
          <BadgePercent className="w-3 h-3" />-{discountPercentage}%
        </div>
      )} */}

      {/* Out of stock overlay */}
      {!isAvailable && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-30 flex items-center justify-center rounded-3xl">
          <div className="bg-white/95 text-gray-800 font-medium px-6 py-3 rounded-2xl shadow-lg border border-gray-200">
            Hết hàng
          </div>
        </div>
      )}

      <Link href={`/san-pham/${sku}`} className="relative z-10 p-6 block">
        {/* Product Image and Info */}
        <div className="flex items-start gap-5 mb-6">
          {/* Product Image */}
          <div className="flex-shrink-0 relative">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center border border-gray-200/50 group-hover:border-blue-300/50 transition-all duration-300 overflow-hidden group-hover:shadow-lg">
              <Image
                src={imgUrl}
                alt={name}
                width={80}
                height={80}
                className="h-full w-full object-cover rounded-2xl transition-transform duration-300 group-hover:scale-110"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-800 font-semibold text-base leading-relaxed group-hover:text-blue-600 transition-colors duration-300 mb-3 line-clamp-2">
              {name}
            </h3>

            {/* Price */}
            <div className="mb-4">
              {/* {dealPrice ? (
                <div className="flex items-baseline gap-3">
                  <span className="text-blue-600 font-bold text-xl">{fCurrency(dealPrice, { currency: "VND" })}</span>
                  <span className="text-gray-400 line-through text-sm">{fCurrency(price, { currency: "VND" })}</span>
                </div>
              ) : (
              )} */}
              <span className="text-blue-600 font-bold text-xl">{fCurrency(price, { currency: "VND" })}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mb-5">
          <button className="flex-1 flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transform hover:-translate-y-0.5">
            <ShoppingCart className="w-4 h-4" />
            Mua ngay
          </button>
          <button
            className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300 border border-gray-200 hover:border-red-200"
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
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, index) => (
              <Star key={index} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            ))}
            <span className="text-xs text-gray-500 ml-2">5.0</span>
          </div>
          <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">Đã bán 5.1k</span>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
