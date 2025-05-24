"use client";

import Link from "next/link";
import { useState } from "react";

import { StarIcon, HeartIcon } from "@/components/icons/svgIcons";
import { TProductBoard } from "@/types/product";

import Quantity from "../../common/quantity";
import AddToCartButton from "../addToCartButton";

// Define TCartItem locally to avoid import issues
type TCartItem = {
  productId: string;
  quantity: number;
  variantId?: number | null;
};

const ProductBoard = ({ boardData }: { boardData: TProductBoard }) => {
  const { name, id, isAvailable, specialFeatures, price, shortDesc, dealPrice, defaultQuantity, variants } = boardData;
  const [quantity, setQuantity] = useState(defaultQuantity > 1 ? defaultQuantity : 1);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(
    variants && variants.length > 0 ? variants[0].id : null
  );

  const handleQuantityChange = (isReducing: boolean) => {
    setQuantity((prev) => {
      if (isReducing) {
        return prev > 1 ? prev - 1 : 1;
      }
      return prev + 1;
    });
  };

  const handleVariantChange = (variantId: number) => {
    setSelectedVariant(variantId);
    console.log("Selected variant:", variantId);
    // Here you could also update price based on the selected variant
  };
  const cartItemData: TCartItem = {
    productId: id.toString(), // Convert number to string for TCartItem
    quantity: quantity,
    variantId: selectedVariant,
  };
  return (
    <div className="w-full relative flex flex-col">
      <button className="absolute right-0 top-0 border-none p-1 bg-white">
        <HeartIcon
          width={22}
          className="fill-white cursor-pointer transition-colors duration-300 stroke-1 stroke-gray-400 hover:fill-gray-300"
        />
      </button>
      <section className="block w-full">
        <div className="flex items-center gap-0.5">
          <StarIcon width={15} stroke="#856B0F" fill="#FFD643" />
          <StarIcon width={15} stroke="#856B0F" fill="#FFD643" />
          <StarIcon width={15} stroke="#856B0F" fill="#FFD643" />
          <StarIcon width={15} stroke="#856B0F" fill="#FFD643" />
          <StarIcon width={15} stroke="#856B0F" fill="#FFD643" />
          <Link href={"#"} className="ml-4 text-xs text-bitex-blue-300">
            880 Đánh giá của người dùng
          </Link>
        </div>
      </section>
      <h1 className="block text-2xl leading-9 font-medium my-2.5 mt-8 text-gray-700">{name}</h1>
      <span className="block text-xs text-gray-700 mb-4">{shortDesc}</span>
      <hr className="w-full border-t border-gray-300 mb-5" />
      <div className="flex flex-col gap-3 text-sm text-gray-500 mb-12">
        {specialFeatures && specialFeatures?.map((feature, index) => <span key={index}>{feature}</span>)}
      </div>
      <h2 className="text-3xl font-medium text-gray-800 mb-5">
        {(dealPrice ? dealPrice : price).toLocaleString("en-us", {
          minimumIntegerDigits: 2,
          minimumFractionDigits: 2,
        })}{" "}
        €
      </h2>
      {dealPrice && (
        <div className="mb-5 text-sm">
          <span className="text-white rounded-sm bg-bitex-red-500 px-3 py-1">
            {`
            Tiết kiệm
            ${(price - dealPrice).toLocaleString("en-us", {
              minimumIntegerDigits: 2,
              minimumFractionDigits: 2,
            })} €`}
          </span>
          <span className="mt-[10px] block text-gray-800">Giá trước đây {price} €</span>
        </div>
      )}{" "}
      <hr className="w-full border-t border-gray-300 mb-5" />
      {/* ----------------- VARIANT SELECTION SECTION ----------------- */}
      {variants && variants.length > 0 && (
        <div className="mb-5">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Select Variant:</h3>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => handleVariantChange(variant.id)}
                className={`px-3 py-2 border rounded-md text-sm ${
                  selectedVariant === variant.id
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
                } ${variant.inventory <= 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                disabled={variant.inventory <= 0}
              >
                <div className="flex flex-col">
                  <span>
                    {variant.sale_price !== null ? (
                      <>
                        <span className="text-red-600 font-medium">₫{variant.sale_price.toLocaleString()}</span>
                        <span className="text-gray-500 ml-1 line-through text-xs">
                          ₫{variant.retail_price.toLocaleString()}
                        </span>
                      </>
                    ) : (
                      <span className="font-medium">₫{variant.retail_price.toLocaleString()}</span>
                    )}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">Stock: {variant.inventory}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      {/* ----------------- ADD TO CART SECTION ----------------- */}
      <section className="flex items-center w-full">
        <Quantity onChange={handleQuantityChange} quantity={quantity} />
        <AddToCartButton
          cartItemData={cartItemData}
          disabled={
            !isAvailable ||
            (selectedVariant !== null && variants?.find((v) => v.id === selectedVariant)?.inventory === 0)
          }
        />
      </section>
    </div>
  );
};

export default ProductBoard;
