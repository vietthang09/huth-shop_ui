"use client";

import Image from "next/image";

import { mapVariantKindToLabel } from "@/common/utils";
import { TProduct } from "@/services/product";
import { fCurrency } from "@/shared/utils/format-number";
import { cn } from "@/shared/utils/styling";
import { Button } from "@/components/ui";
import { Flame, Flashlight, Key, ShoppingCart, ThumbsUp, User, Zap } from "lucide-react";

type ProductCardProps = {
  direction?: "vertical" | "horizontal";
  theme?: "light" | "dark";
  tag?: "hot" | "best";
  product?: TProduct;
  className?: string;
  staticWidth?: boolean;
};

const ProductCard = ({ direction = "horizontal", theme = "dark", tag }: ProductCardProps) => {
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
          className="w-full h-auto max-h-64 rounded-xl"
          alt="product"
          unoptimized
          src="https://cdn.k4g.com/files/media/cache/cover_270/cover/19a16f50322c30f6d34b618a055afb24.jpg"
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
          "col-span-3 p-3 flex flex-col justify-between gap-4",
          theme === "dark" ? "text-white" : "text-dark",
        )}
      >
        <p className="text-sm font-bold line-clamp-4">Microsoft Windows 11 Professional OEM Microsoft CD Key</p>
        <div className="flex gap-2">
          <Key className="size-5" />
          <User className="size-5" />
          <Zap className="size-5 text-amber-400" />
        </div>
        <div>
          <p className="text-gray-500 uppercase font-medium text-xs line-through">
            Từ <span>{fCurrency(100000, { currency: "VND" })}</span>
          </p>
          <div className="flex items-center gap-1">
            <p className="text-lg font-bold uppercase">{fCurrency(90000, { currency: "VND" })}</p>
            <span className="bg-green-500 text-white text-xs font-bold p-1 rounded-full">-90%</span>
          </div>
          <Button size="sm" className="mt-1 flex items-center gap-1 group-hover:bg-red-500">
            <ShoppingCart className="size-4" /> Mua ngay
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
