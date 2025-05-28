"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";

import { ShoppingIconFill, CheckIcon } from "@/components/icons/svgIcons";
import { add } from "@/store/shoppingCart";
import Button from "@/components/UI/button";

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

// Constants
const ANIMATION_DURATION = 2000;
const BUTTON_CLASSES = {
  base: "flex justify-center items-center gap-3 relative overflow-hidden ml-6 sm:ml-10 text-sm font-semibold px-8 sm:px-12 py-3 sm:py-3.5 rounded-xl transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none shadow-lg hover:shadow-xl",
  success:
    "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-green-200",
  primary:
    "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-blue-200",
  disabled:
    "bg-gradient-to-r from-gray-400 to-gray-500 text-gray-200 cursor-not-allowed hover:scale-100 active:scale-100 shadow-gray-200",
};

const AddToCartButton = ({ cartItemData, disabled }: TProps) => {
  const dispatch = useDispatch();
  const [isAdded, setIsAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleAddToCart = useCallback(async () => {
    if (disabled || isAdded || isLoading) return;

    try {
      setIsLoading(true);

      // Dispatch action
      dispatch(add({ ...cartItemData }));
      document.documentElement.classList.add("noScroll");

      // Show success state
      setIsAdded(true);
      setIsLoading(false);

      // Reset status after animation
      timeoutRef.current = setTimeout(() => {
        setIsAdded(false);
      }, ANIMATION_DURATION);
    } catch (error) {
      console.error("Failed to add item to cart:", error);
      setIsLoading(false);
    }
  }, [cartItemData, disabled, dispatch, isAdded, isLoading]);

  const getButtonContent = () => {
    if (disabled) {
      return (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-gray-300"></span>
          Không khả dụng
        </span>
      );
    }

    if (isLoading) {
      return (
        <span className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          <span className="text-white">Đang thêm...</span>
        </span>
      );
    }

    if (isAdded) {
      return (
        <span className="flex items-center gap-2">
          <CheckIcon width={18} className="fill-white animate-bounce" />
          <span className="text-white font-semibold">Đã thêm vào giỏ!</span>
        </span>
      );
    }

    return (
      <span className="flex items-center gap-2">
        <ShoppingIconFill width={16} className="fill-white" />
        <span className="text-white font-semibold">Thêm vào giỏ</span>
      </span>
    );
  };

  const getButtonClasses = () => {
    const classes = [BUTTON_CLASSES.base];

    if (disabled) {
      classes.push(BUTTON_CLASSES.disabled);
    } else if (isAdded) {
      classes.push(BUTTON_CLASSES.success);
    } else {
      classes.push(BUTTON_CLASSES.primary);
    }

    return classes.join(" ");
  };

  return (
    <div className="relative">
      <Button
        disabled={disabled || isLoading}
        variant="primary"
        className={getButtonClasses()}
        onClick={handleAddToCart}
        aria-label={disabled ? "Product not available" : isAdded ? "Item added to cart" : "Thêm vào giỏ hàng"}
        aria-describedby={isAdded ? "cart-notification" : undefined}
      >
        {getButtonContent()}

        {/* Enhanced ripple effect overlay */}
        {!disabled && (
          <span className="absolute inset-0 bg-white opacity-0 rounded-xl transition-opacity duration-200 hover:opacity-20 active:opacity-30"></span>
        )}

        {/* Shine effect for non-disabled buttons */}
        {!disabled && (
          <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></span>
        )}
      </Button>

      {/* Enhanced floating notification with better contrast */}
      {isAdded && (
        <div
          id="cart-notification"
          className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white border-2 border-green-400 text-green-800 px-4 py-2.5 rounded-xl shadow-2xl text-sm whitespace-nowrap z-20 animate-bounce-in"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <CheckIcon width={12} className="fill-white" />
            </div>
            <span className="font-semibold text-green-800">Đã thêm vào giỏ hàng!</span>
          </div>
          {/* Enhanced arrow pointing down */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-green-400"></div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 translate-y-[-2px] w-0 h-0 border-l-5 border-r-5 border-t-5 border-transparent border-t-white"></div>
        </div>
      )}
    </div>
  );
};

export default AddToCartButton;
