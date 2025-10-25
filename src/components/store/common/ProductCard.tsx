"use client";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/shared/utils/styling";
import { ChevronRight, Heart, ShoppingCart, Star } from "lucide-react";
import { fCurrency } from "@/shared/utils/format-number";
import { TProduct } from "@/services/product";
import ProductPlaceholderImage from "./product-placeholder-image";
import { Button } from "@/components/ui";

type ProductCardProps = {
  product: TProduct;
  className?: string;
  staticWidth?: boolean;
};

const ProductCard = ({ product, className, staticWidth = false }: ProductCardProps) => {
  const lowestVariantPrice = Math.min(...product.variants.map((variant) => variant.retailPrice));
  return (
    <div className={cn("group relative", staticWidth && "w-80", className)}>
      <Link href={`/san-pham/${product.sku}`} className="relative z-10 block">
        <div className="w-full h-44 mx-auto bg-gray-50 p-6 rounded-xl">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.title}
              width={24}
              height={24}
              className="h-24 w-full object-contain rounded-2xl"
            />
          ) : (
            <ProductPlaceholderImage />
          )}
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
