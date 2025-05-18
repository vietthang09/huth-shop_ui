"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";

import { ShoppingIconFill, CheckIcon } from "@/components/icons/svgIcons";
import { add } from "@/store/shoppingCart";
// Import locally defined type instead
// import { TCartItem } from "@/types/shoppingCart";

// Define TCartItem locally
type TCartItem = {
  productId: string;
  quantity: number;
  variantId?: number | null;
};

type TProps = {
  disabled: boolean;
  cartItemData: TCartItem;
};

const AddToCartButton = ({ cartItemData, disabled }: TProps) => {
  const dispatch = useDispatch();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    dispatch(add({ ...cartItemData }));
    document.documentElement.classList.add("noScroll");

    // Show confirmation animation
    setIsAdded(true);

    // Reset status after animation
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };
  return (
    <div className="relative">
      <button
        disabled={disabled}
        className={`
          flex justify-center items-center gap-3 cursor-pointer ml-6 sm:ml-10 
          text-sm sm:text-lg font-light px-8 sm:px-12 py-2.5 rounded-lg 
          transition-all duration-300
          ${isAdded ? "bg-green-600 hover:bg-green-700" : "bg-bitex-red-500 hover:bg-bitex-red-600"}
          text-white
        `}
        onClick={() => !isAdded && handleAddToCart()}
      >
        {disabled ? (
          "Not Available"
        ) : isAdded ? (
          <>
            <CheckIcon width={18} className="fill-white" />
            Added to Cart
          </>
        ) : (
          <>
            <ShoppingIconFill width={16} className="fill-white" />
            Add to Cart
          </>
        )}
      </button>

      {/* Floating notification */}
      {isAdded && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-green-50 border border-green-300 text-green-700 px-3 py-1.5 rounded-md shadow-md text-sm whitespace-nowrap">
          Item added to cart!
        </div>
      )}
    </div>
  );
};

export default AddToCartButton;
