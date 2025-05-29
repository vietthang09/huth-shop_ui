"use client";

import Link from "next/link";
import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { StarIcon } from "@/components/icons/svgIcons";
import { TProductBoard, ProductVariant } from "@/types/product";

import Quantity from "../../common/quantity";
import AddToCartButton from "../addToCartButton";
import { fCurrency } from "@/shared/utils/format-number";

type TCartItem = {
  productId: string;
  quantity: number;
  variantId?: number | null;
};

// Helper components
const Rating = () => (
  <div className="mb-6">
    <div className="flex items-center gap-1 mb-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <StarIcon key={index} width={16} stroke="#F59E0B" fill="#FCD34D" />
      ))}
      <span className="ml-2 text-sm text-gray-600 font-medium">4.8</span>
    </div>
    <Link href="#reviews" className="text-sm text-blue-600 hover:underline">
      880 đánh giá từ khách hàng
    </Link>
  </div>
);

const SpecialFeatures = ({ features }: { features: string[] }) => (
  <div className="mb-6">
    <h3 className="text-sm font-semibold text-gray-700 mb-3">Tính năng nổi bật:</h3>
    <ul className="space-y-2">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  </div>
);

const PriceDisplay = ({
  currentPrice,
  originalPrice,
  savings,
}: {
  currentPrice: number;
  originalPrice?: number;
  savings: number;
}) => (
  <div className="mb-6">
    <div className="flex items-baseline gap-3 mb-2">
      <h2 className="text-3xl font-bold text-gray-900">{fCurrency(currentPrice, { currency: "VND" })}</h2>
      {originalPrice && (
        <span className="text-lg text-gray-500 line-through">{fCurrency(originalPrice, { currency: "VND" })}</span>
      )}
    </div>

    {savings > 0 && originalPrice && (
      <div className="flex items-center gap-3">
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          Tiết kiệm {fCurrency(savings, { currency: "VND" })}
        </span>
        <span className="text-sm text-green-600 font-medium">-{Math.round((savings / originalPrice) * 100)}%</span>
      </div>
    )}
  </div>
);

const VariantButton = ({
  variant,
  isSelected,
  onClick,
}: {
  variant: ProductVariant;
  isSelected: boolean;
  onClick: () => void;
}) => {
  const isDisabled = variant.inventory <= 0;
  const hasDiscount = variant.sale_price && variant.sale_price < variant.retail_price;

  return (
    <button
      onClick={() => !isDisabled && onClick()}
      disabled={isDisabled}
      className={`
        relative p-4 border-2 rounded-lg text-left transition-all
        ${isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}
        ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {isSelected && <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full" />}

      <div className="space-y-2">
        {variant.attributeName && <div className="text-sm font-medium text-gray-900">{variant.attributeName}</div>}

        <div className="flex items-baseline gap-2">
          {hasDiscount ? (
            <>
              <span className="text-lg font-bold text-red-600">
                {fCurrency(variant.sale_price!, { currency: "VND" })}
              </span>
              <span className="text-sm text-gray-500 line-through">
                {fCurrency(variant.retail_price, { currency: "VND" })}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-gray-900">
              {fCurrency(variant.retail_price, { currency: "VND" })}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span
            className={`text-xs font-medium ${
              variant.inventory > 10 ? "text-green-600" : variant.inventory > 0 ? "text-yellow-600" : "text-red-600"
            }`}
          >
            {variant.inventory > 0 ? `Còn ${variant.inventory} sản phẩm` : "Hết hàng"}
          </span>

          {hasDiscount && (
            <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-medium">
              -{Math.round(((variant.retail_price - variant.sale_price!) / variant.retail_price) * 100)}%
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

const ProductBoard = ({ boardData }: { boardData: TProductBoard }) => {
  const { name, id, isAvailable, specialFeatures, price, keywords, dealPrice, defaultQuantity, variants } = boardData;

  const router = useRouter();
  const searchParams = useSearchParams();

  const [quantity, setQuantity] = useState(Math.max(defaultQuantity || 1, 1));
  const [selectedVariant, setSelectedVariant] = useState<number | null>(variants?.[0]?.id || null);

  // Initialize variant from URL
  useEffect(() => {
    if (!variants?.length) return;

    const loaiParam = searchParams.get("loai");
    if (loaiParam) {
      const variant = variants.find((v) => v.attributeSetHash === loaiParam);
      if (variant) {
        setSelectedVariant(variant.id);
        return;
      }
    }

    setSelectedVariant(variants[0].id);
  }, [variants, searchParams]);

  // Computed values
  const selectedVariantData = useMemo(
    () => variants?.find((v) => v.id === selectedVariant) || null,
    [variants, selectedVariant]
  );

  const currentPrice = useMemo(() => {
    if (selectedVariantData) {
      return selectedVariantData.sale_price || selectedVariantData.retail_price;
    }
    return dealPrice || price;
  }, [selectedVariantData, dealPrice, price]);

  const originalPrice = useMemo(() => {
    if (selectedVariantData?.sale_price) {
      return selectedVariantData.retail_price;
    }
    return dealPrice ? price : undefined;
  }, [selectedVariantData, dealPrice, price]);

  const savings = useMemo(
    () => (originalPrice && currentPrice ? originalPrice - currentPrice : 0),
    [originalPrice, currentPrice]
  );

  const isOutOfStock = useMemo(() => {
    if (selectedVariantData) {
      return selectedVariantData.inventory <= 0;
    }
    return !isAvailable;
  }, [selectedVariantData, isAvailable]);

  const cartItemData: TCartItem = useMemo(
    () => ({
      productId: id.toString(),
      quantity,
      variantId: selectedVariant,
    }),
    [id, quantity, selectedVariant]
  );

  // Event handlers
  const handleQuantityChange = useCallback((isReducing: boolean) => {
    setQuantity((prev) => (isReducing ? Math.max(prev - 1, 1) : prev + 1));
  }, []);

  const handleVariantChange = useCallback(
    (variantId: number) => {
      setSelectedVariant(variantId);

      const variantData = variants?.find((v) => v.id === variantId);
      if (variantData?.attributeSetHash) {
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.set("loai", variantData.attributeSetHash);

        const newUrl = `${window.location.pathname}?${newSearchParams.toString()}`;
        router.replace(newUrl, { scroll: false });
      }
    },
    [variants, searchParams, router]
  );

  return (
    <div className="bg-white rounded-lg p-6">
      <Rating />
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">{name}</h1>
      <p className="text-gray-600 text-sm mb-6">Từ khóa: {keywords}</p>
      <hr className="border-gray-200 mb-6" />{" "}
      {specialFeatures && specialFeatures.length > 0 && <SpecialFeatures features={specialFeatures} />}
      <PriceDisplay currentPrice={currentPrice} originalPrice={originalPrice} savings={savings} />
      <hr className="border-gray-200 mb-6" />
      {variants && variants.length > 0 && (
        <div className="mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Chọn phiên bản:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {variants.map((variant) => (
              <VariantButton
                key={variant.id}
                variant={variant}
                isSelected={selectedVariant === variant.id}
                onClick={() => handleVariantChange(variant.id)}
              />
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-6 border-t border-gray-200">
        <Quantity onChange={handleQuantityChange} quantity={quantity} />
        <div className="flex-1">
          <AddToCartButton cartItemData={cartItemData} disabled={isOutOfStock} />
        </div>
      </div>
      {isOutOfStock && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 font-medium">
            Sản phẩm hiện tại đã hết hàng. Vui lòng chọn phiên bản khác hoặc liên hệ để được thông báo khi có hàng.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductBoard;
