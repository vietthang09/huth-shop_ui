"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

import { CheckIcon } from "@/components/icons/svgIcons";
import { RootState } from "@/store/shoppingCart";
import { TCartItemData } from "@/types/shoppingCart.d";
import { getCartProducts } from "@/actions/product/product";
import { cn } from "@/shared/utils/styling";

interface MiniCartNotificationProps {
  isVisible: boolean;
  onClose: () => void;
}

const MiniCartNotification: React.FC<MiniCartNotificationProps> = ({ isVisible, onClose }) => {
  const [latestItem, setLatestItem] = useState<TCartItemData | null>(null);
  const cartState = useSelector((state: RootState) => state.cart);

  // Get the latest added item
  useEffect(() => {
    if (isVisible && cartState.items.length > 0) {
      const fetchLatestItem = async () => {
        const latestCartItem = cartState.items[cartState.items.length - 1];
        const response = await getCartProducts([latestCartItem.productId]);

        if (response.success && response.res && response.res.length > 0) {
          const product = response.res[0];
          const variant = product.variants?.find((v: any) => v.id === latestCartItem.variantId);

          setLatestItem({
            productId: product.id,
            productName: product.name,
            imgUrl: product.images[0],
            price: variant?.retail_price || product.price,
            dealPrice: variant?.sale_price || product.salePrice || undefined,
            quantity: latestCartItem.quantity,
            variantId: latestCartItem.variantId,
            variantAttributes: variant ? `${variant.attributeName}` : undefined,
          });
        }
      };

      fetchLatestItem();
    }
  }, [isVisible, cartState.items]);

  // Auto close notification after 5 seconds
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!latestItem) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-5 right-5 z-50"
        >
          <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200 w-80">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mr-2">
                  <CheckIcon width={10} stroke="#fff" strokeWidth={2} />
                </div>
                <h3 className="text-sm font-medium text-gray-700">Added to Cart</h3>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                ×
              </button>
            </div>

            <div className="flex gap-3">
              <div className="w-16 h-16 relative">
                <Image src={latestItem.imgUrl} alt={latestItem.productName} fill className="object-contain" />
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800 line-clamp-1">{latestItem.productName}</p>

                {latestItem.variantAttributes && (
                  <p className="text-xs text-gray-500 mt-0.5">Variant: {latestItem.variantAttributes}</p>
                )}

                <div className="flex justify-between items-center mt-1">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {(latestItem.dealPrice || latestItem.price).toLocaleString("en-us", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      €
                    </p>

                    {latestItem.dealPrice && latestItem.price > latestItem.dealPrice && (
                      <p className="text-xs text-gray-400 line-through">
                        {latestItem.price.toLocaleString("en-us", { minimumFractionDigits: 2 })} €
                      </p>
                    )}
                  </div>

                  <p className="text-xs bg-gray-100 px-2 py-1 rounded">Qty: {latestItem.quantity}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
              <Link
                href="/checkout"
                className={cn(
                  "text-xs px-3 py-1.5 rounded font-medium",
                  "text-white bg-bitex-red-500 hover:bg-bitex-red-600 transition-colors"
                )}
              >
                Checkout
              </Link>
              <button onClick={onClose} className="text-xs text-bitex-blue-500 hover:underline">
                Continue Shopping
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MiniCartNotification;
