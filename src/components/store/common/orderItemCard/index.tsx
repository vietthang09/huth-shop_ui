"use client";

import Image from "next/image";
import Link from "next/link";

import { TCartItemData } from "@/types/shoppingCart.d";

type TProps = {
  data: TCartItemData;
  showControls?: boolean;
};

const OrderItemCard = ({ data, showControls = false }: TProps) => {
  const { productName, productId, imgUrl, price, dealPrice = 0, quantity, variantId, variantAttributes } = data;
  const currentPrice = dealPrice === 0 ? price : dealPrice;

  return (
    <div className="p-3 border rounded-lg mb-3 hover:bg-gray-50 transition-colors">
      <div className="flex gap-3">
        <div className="w-16 h-16 rounded-md overflow-hidden border border-gray-200 flex-shrink-0 relative">
          <Image src={imgUrl} width={64} height={64} alt={productName} className="object-contain w-full h-full" />
          {dealPrice > 0 && price > dealPrice && (
            <div className="absolute top-0 right-0 bg-bitex-red-500 text-white text-xs px-1.5 py-0.5 rounded-bl-md rounded-tr-md">
              -{Math.round(((price - dealPrice) / price) * 100)}%
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <Link href={`/product/${productId}`} className="hover:text-bitex-blue-500 transition-colors">
              <p className="text-sm text-gray-800 font-medium">{productName}</p>
            </Link>
            <p className="text-sm font-medium text-gray-700 whitespace-nowrap ml-2">
              {(currentPrice * quantity).toLocaleString("en-us", {
                minimumFractionDigits: 2,
              })}{" "}
              €
            </p>
          </div>

          {/* Product details */}
          <div className="mt-1 mb-2">
            <p className="text-xs text-gray-500">
              <span className="font-medium">ID:</span> #{productId}
            </p>
            {variantAttributes && (
              <p className="text-xs text-gray-500">
                <span className="font-medium">Variant:</span> {variantAttributes}
              </p>
            )}
          </div>

          {/* Price details */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              <span className="font-medium">Quantity:</span> {quantity} x{" "}
              {currentPrice.toLocaleString("en-us", {
                minimumFractionDigits: 2,
              })}{" "}
              €
            </p>

            {dealPrice > 0 && price > dealPrice && (
              <p className="text-xs text-gray-400 line-through">
                {(price * quantity).toLocaleString("en-us", {
                  minimumFractionDigits: 2,
                })}{" "}
                €
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderItemCard;
