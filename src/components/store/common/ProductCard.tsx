"use client";

import Link from "next/link";

import { cn } from "@/shared/utils/styling";
import { ChevronRight } from "lucide-react";
import { fCurrency } from "@/shared/utils/format-number";
import { TProduct } from "@/services/product";
import { Button } from "@/components/ui";
import { mapVariantKindToLabel } from "@/common/utils";

type ProductCardProps = {
  product: TProduct;
  className?: string;
  staticWidth?: boolean;
};

const ProductCard = ({ product, className, staticWidth = false }: ProductCardProps) => {
  const lowestVariantPrice = Math.min(...product.variants.map((variant) => variant.retailPrice));
  const kind = product.variants[0].kind;
  return (
    <div className={cn("group relative", staticWidth && "w-80", className)}>
      <span className="absolute top-1 left-0 z-30 shadow bg-red-500 text-white text-xs p-1 rounded">
        {mapVariantKindToLabel(kind)}
      </span>
      <Link href={`/san-pham/${product.sku}`} className="relative z-10 block">
        <div className="w-full h-44 mx-auto bg-gray-50 p-6 rounded-xl">
          <img
            src={
              product.images?.[0] ||
              "http://res.cloudinary.com/dezvlwnnj/image/upload/v1761397819/huthshop/l8jcod6rvajxkoghhasc.png"
            }
            alt={product.title}
            width={24}
            height={24}
            className="h-24 w-full object-contain rounded-2xl"
          />
        </div>
        <h3 className="mt-4 font-bold line-clamp-2">{product.title}</h3>
        <p className="mt-2 font-semibold">{`Từ ${fCurrency(lowestVariantPrice, { currency: "VND" })}`}</p>

        <Button variant="link" className="mt-5 p-0 text-sky-800 text-base font-bold hover:text-sku-800">
          Mua
          <ChevronRight />
        </Button>
      </Link>
    </div>
  );
};

export default ProductCard;
