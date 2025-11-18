"use client";

import { Flame, Key, ShoppingCart, ThumbsUp, User, Zap } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui";
import { TProduct } from "@/services/product";
import { fCurrency } from "@/shared/utils/format-number";
import { cn } from "@/shared/utils/styling";

type ProductCardProps = {
  direction?: "vertical" | "horizontal";
  theme?: "light" | "dark";
  tag?: "hot" | "best";
  product?: TProduct;
  className?: string;
  staticWidth?: boolean;
};

const ProductCard = ({ product, direction = "horizontal", theme = "dark", tag }: ProductCardProps) => {
  const lowestRetailPrice = Math.min(...(product?.variants || []).map((variant) => Number(variant.retailPrice)));
  const lowestSalePrice = Math.min(...(product?.variants || []).map((variant) => variant.salePrice || 0));
  return (
    <div
      className={cn(
        "grid rounded-xl group",
        theme === "dark" ? "bg-[#0b0e31]" : "bg-white",
        direction === "vertical" ? "grid-cols-1" : "grid-cols-5",
      )}
    >
      <div className="col-span-2 relative">
        <Image
          width={100}
          height={100}
          className="w-full h-64 rounded-xl object-cover"
          alt="product"
          unoptimized
          src={product?.images ? product?.images[0] : ""}
        />
        {tag === "hot" ? (
          <span className="absolute left-4 bottom-0 translate-y-1/2 flex items-center px-2 py-1 gap-1 w-fit bg-white uppercase font-bold text-xs rounded-full">
            <Flame className="text-red-500 size-4" /> Hot deal
          </span>
        ) : (
          tag === "best" && (
            <span className="absolute left-4 bottom-0 translate-y-1/2 flex items-center px-2 py-1 gap-1 w-fit bg-white uppercase font-bold text-xs rounded-full">
              <ThumbsUp className="text-green-500 size-4" /> Best choice
            </span>
          )
        )}
      </div>
      <div
        className={cn(
          "mt-2 col-span-3 p-3 flex flex-col justify-between gap-4",
          theme === "dark" ? "text-white" : "text-dark",
        )}
      >
        <div>
          <p className="text-sm font-bold line-clamp-4">{product?.title || "Tên sản phẩm"}</p>
          <div className="mt-1 flex gap-2">
            <Key className="size-5" />
            <User className="size-5" />
            <Zap className="size-5 text-amber-400" />
          </div>
        </div>
        <div>
          {lowestSalePrice !== 0 ? (
            <>
              <p className="text-gray-500 uppercase font-medium text-xs line-through">
                Từ <span>{fCurrency(lowestRetailPrice, { currency: "VND" })}</span>
              </p>
              <div className="flex items-center gap-1">
                <p className="text-lg font-bold uppercase">{fCurrency(lowestSalePrice, { currency: "VND" })}</p>
                <span className="bg-green-500 text-white text-xs font-bold p-1 rounded-full">-90%</span>
              </div>
            </>
          ) : (
            <p className="text-lg font-bold uppercase">Từ {fCurrency(lowestRetailPrice, { currency: "VND" })}</p>
          )}
          <Button size="sm" className="mt-1 flex items-center gap-1 group-hover:bg-red-500">
            <ShoppingCart className="size-4" /> Mua ngay
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
