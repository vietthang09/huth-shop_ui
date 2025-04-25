"use client";

import { useEffect, useState } from "react";
import { getOneProduct } from "@/actions/product/product";
import { TProductListItem } from "@/types/product";

type HotDealProductItemProps = {
  product: TProductListItem;
  isSelected: boolean;
  onSelect: () => void;
};

const HotDealProductItem = ({ product, isSelected, onSelect }: HotDealProductItemProps) => {
  const [price, setPrice] = useState<number | null>(null);
  const [dealPrice, setDealPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const getProductDetails = async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        const response = await getOneProduct(product.id);
        if (response.res) {
          setPrice(response.res.price);
          setDealPrice(response.res.salePrice);
        } else {
          setHasError(true);
        }
      } catch (error) {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    getProductDetails();
  }, [product.id]);

  // Determine if this product is eligible to be a hot deal (has a deal price)
  const isEligible = dealPrice !== null && dealPrice !== undefined && dealPrice > 0;

  return (
    <div className={`grid grid-cols-12 gap-2 p-3 border-b hover:bg-gray-50 ${!isEligible ? "opacity-60" : ""}`}>
      <div className="col-span-1 flex items-center justify-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          disabled={!isEligible}
          className="w-5 h-5 cursor-pointer"
        />
      </div>
      <div className="col-span-5 flex items-center">
        {product.name}
        {!isEligible && <span className="ml-2 text-xs text-red-500">(No deal price set)</span>}
      </div>
      <div className="col-span-2 flex items-center">
        {isLoading ? (
          <span className="text-gray-400">Loading...</span>
        ) : hasError ? (
          <span className="text-red-500">Error</span>
        ) : (
          <span>
            {price?.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })}
          </span>
        )}
      </div>
      <div className="col-span-2 flex items-center">
        {isLoading ? (
          <span className="text-gray-400">Loading...</span>
        ) : hasError ? (
          <span className="text-red-500">Error</span>
        ) : dealPrice ? (
          <span className="text-green-600 font-medium">
            {dealPrice?.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })}
          </span>
        ) : (
          <span className="text-gray-400">Not set</span>
        )}
      </div>
      <div className="col-span-2 flex items-center text-gray-600">{product.category.name}</div>
    </div>
  );
};

export default HotDealProductItem;
