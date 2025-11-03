"use client";

import Link from "next/link";

import { cn } from "@/shared/utils/styling";
import { ChevronRight } from "lucide-react";
import { fCurrency } from "@/shared/utils/format-number";
import { TProduct } from "@/services/product";
import { Button } from "@/components/ui";
import { mapVariantKindToLabel } from "@/common/utils";
import ReactStars from "react-rating-stars-component";

type ProductCardProps = {
  product: TProduct;
  className?: string;
  staticWidth?: boolean;
};

const ProductCard = ({ product, className, staticWidth = false }: ProductCardProps) => {
  const lowestVariantPrice = Math.min(...product.variants.map((variant) => variant.retailPrice));
  const highestVariantPrice = Math.max(...product.variants.map((variant) => variant.retailPrice));
  const salePrice = Math.min(...product.variants.map((variant) => variant.salePrice || 0));
  const salePercent = salePrice > 0 ? Math.round(((lowestVariantPrice - salePrice) / lowestVariantPrice) * 100) : 0;
  const kind = product.variants[0].kind;

  const rating = 4.5;

  return (
    <div className={cn("group rounded-xl shadow group", staticWidth && "w-80", className)}>
      <Link href={`/san-pham/${product.sku}`} className="relative z-10 block">
        <div className="w-full h-56 overflow-hidden rounded-t-xl relative">
          {salePercent > 0 && (
            <div
              className="absolute top-0 right-1 z-20 bg-[#fc0606] pt-1 pb-4 px-2 text-center text-white"
              style={{ clipPath: "polygon(100% 0px, 100% 100%, 51% 76%, 0px 100%, 0% 0%)" }}
            >
              <span className="block font-bold">{salePercent}%</span>
              <span className="text-sm uppercase">Giảm</span>
            </div>
          )}

          <span className="absolute bottom-1 left-0 z-30 shadow bg-[#fc0606] text-white text-xs p-1 rounded-r">
            {mapVariantKindToLabel(kind)}
          </span>
          <img
            src={
              product.images?.[0] ||
              "http://res.cloudinary.com/dezvlwnnj/image/upload/v1761397819/huthshop/l8jcod6rvajxkoghhasc.png"
            }
            alt={product.title}
            className="w-full h-full object-cover rounded-t-xl group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="px-4 py-2">
          <div className="flex items-center gap-1">
            <ReactStars count={5} value={rating} isHalf={true} edit={false} size={20} activeColor="#FFD700" />
            <span className="text-sm opacity-70">(50 đánh giá)</span>
          </div>
          <h3 className="mt-2 font-bold line-clamp-2">{product.title}</h3>
          <p className="mt-2 font-semibold">
            {salePercent > 0 ? (
              product.variants.length === 1 ? (
                <>
                  <span className="line-through text-sm opacity-70">
                    {fCurrency(lowestVariantPrice, { currency: "VND" })}
                  </span>
                  <span className="ml-1">{fCurrency(salePrice, { currency: "VND" })}</span>
                </>
              ) : (
                `${fCurrency(lowestVariantPrice, { currency: "VND" })} - ${fCurrency(highestVariantPrice, {
                  currency: "VND",
                })}`
              )
            ) : product.variants.length === 1 ? (
              fCurrency(lowestVariantPrice, { currency: "VND" })
            ) : (
              `${fCurrency(lowestVariantPrice, { currency: "VND" })} - ${fCurrency(highestVariantPrice, {
                currency: "VND",
              })}`
            )}
          </p>
          <p className="mt-2 text-right text-sm opacity-70">Đã bán 5013</p>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
