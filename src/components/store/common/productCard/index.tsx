"use client";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/shared/utils/styling";
import { TProductCard } from "@/types/common";
import { useImageColors } from "@/hooks/useImageColors";

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
  // Only use the hook if custom colors aren't provided
  const {
    fromColor: detectedFromColor,
    toColor: detectedToColor,
    error,
  } = !fromColor || !toColor ? useImageColors(imgUrl[0]) : { fromColor: null, toColor: null, error: null };

  // Use custom colors if provided, otherwise use detected colors
  const gradientFromColor = fromColor || detectedFromColor;
  const gradientToColor = toColor || detectedToColor;

  const gradientStyle =
    gradientFromColor && gradientToColor && !error
      ? {
          background: `linear-gradient(to top, ${gradientFromColor}, ${gradientToColor})`,
        }
      : {};

  return (
    <Link
      href={url}
      className={cn(
        "rounded-xl p-2 transition-all duration-500 relative hover:drop-shadow-sm hover:[&_.imageWrapper>img:last-child]:opacity-100 hover:[&_.imageWrapper>img:last-child]:scale-[1.05]",
        error && !(fromColor && toColor) ? "bg-gradient-to-t   from-black to-red-500" : "",
        staticWidth && "w-64"
      )}
      style={gradientStyle}
    >
      {!isAvailable && (
        <div className="flex left-2 right-2 bottom-2 top-2 bg-white/40 backdrop-blur-[1px] absolute z-[1] items-center justify-center rounded-lg">
          <span className="mt-14 text-gray-100 font-light px-6 py-1 backdrop-blur-[6px] rounded-md shadow-gray-200 bg-black/60">
            Hết hàng
          </span>
        </div>
      )}
      <div className="imageWrapper w-full h-[225px] block relative rounded-xl overflow-hidden transition-all duration-500">
        <Image
          src={imgUrl[0]}
          alt={name}
          fill
          sizes="(max-width: 240px)"
          className="object-cover transition-all duration-400 ease-out"
        />
      </div>
      <span className="inline-block text-white mt-2.5 mb-2 ml-2">{name}</span>
      <div className="flex items-center h-10 mt-6 ml-2">
        <div className="flex-grow relative">
          {dealPrice ? (
            <>
              <div className="w-48 h-5 flex justify-start absolute -top-6">
                <span className="font-medium block text-sm rounded-sm px-2 pt-[1px] text-red-800 bg-red-200">
                  -
                  {(100 - (dealPrice / price) * 100).toLocaleString("vi-VN", {
                    maximumFractionDigits: 0,
                  })}
                  %
                </span>
                <span className="block w-full line-through text-white text-sm ml-2">
                  giá cũ {price.toLocaleString("vi-VN", { minimumFractionDigits: 0 })}₫
                </span>
              </div>
              <span className="text-lg font-medium text-white">
                {dealPrice.toLocaleString("vi-VN", {
                  minimumFractionDigits: 0,
                })}
                ₫
              </span>
            </>
          ) : (
            <span className="text-lg font-medium text-white">
              {price.toLocaleString("vi-VN", { minimumFractionDigits: 0 })}₫
            </span>
          )}
        </div>
        <div className="flex-grow text-right">
          <button className="cursor-pointer size-9 border-none bg-no-repeat bg-center rounded-sm opacity-60 transition-opacity duration-300 hover:opacity-100 bg-black/0 bg-[url('/icons/heartIcon.svg')] bg-[length:20px_18px]" />
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
