"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { CloseIcon, ShoppingIconEmpty } from "@/components/icons/svgIcons";
import Button from "@/components/UI/button";
import { cn } from "@/shared/utils/styling";
import { RootState } from "@/store/shoppingCart";
import { TCartListItemDB } from "@/types/product";
import { TCartItemData } from "@/types/shoppingCart.d";
import { getCartProducts } from "@/actions/product/product";

import CartItem from "./_components/cartItem";

type TProps = {
  isVisible: boolean;
  quantity?: number;
  handleOnClose: () => void;
};

const ShoppingCart = ({ isVisible, quantity, handleOnClose }: TProps) => {
  const [cartItems, setCartItems] = useState<TCartItemData[]>();
  const localCartItems = useSelector((state: RootState) => state.cart);
  const router = useRouter();
  useEffect(() => {
    const convertDBtoCartItems = (rawData: TCartListItemDB[]) => {
      const cartListItem: TCartItemData[] = [];

      rawData.forEach((item) => {
        // Find all cart items with this product ID
        const cartItems = localCartItems.items.filter((f) => f.productId === item.id);

        // If there are no cart items with this product ID, skip
        if (cartItems.length === 0) return;

        // For each cart item with this product ID (could be multiple variants)
        cartItems.forEach((cartItem) => {
          // Find the variant info if available
          const variant = item.variants?.find((v) => v.id === cartItem.variantId);

          cartListItem.push({
            productId: item.id,
            imgUrl: item.images[0],
            price: variant?.retail_price || item.price,
            quantity: cartItem.quantity,
            productName: item.name,
            dealPrice: variant?.sale_price || item.salePrice || undefined,
            variantId: cartItem.variantId,
            // Include variant attributes information
            variantAttributes: variant ? `${variant.attributeName}` : undefined,
          });
        });
      });

      if (cartListItem.length > 0) return cartListItem;
      return null;
    };

    const getProductsFromDB = async () => {
      const productsIDs = localCartItems.items.map((s) => +s.productId);

      if (productsIDs?.length === 0) setCartItems([]);

      if (productsIDs && productsIDs.length > 0) {
        const response = await getCartProducts(productsIDs);
        if (response.success && response.res) {
          // Type assertion to handle the response correctly
          const cartListItems = response.res as unknown as TCartListItemDB[];
          const finalResult = convertDBtoCartItems(cartListItems);
          if (!finalResult) return;
          setCartItems(finalResult);
        }
      }
    };
    if (localCartItems) {
      getProductsFromDB();
    }
  }, [localCartItems]);

  // Calculate total price
  const calculateTotal = () => {
    if (!cartItems || cartItems.length === 0) return 0;

    return cartItems.reduce((total, item) => {
      const itemPrice = item.dealPrice || item.price;
      return total + itemPrice * item.quantity;
    }, 0);
  };

  const handleCheckout = () => {
    handleOnClose();
    router.push("/checkout");
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-[50] transition-all duration-300 cursor-default",
        isVisible ? "visible opacity-100" : "invisible opacity-0"
      )}
    >
      <div className="absolute inset-0 sm:bg-black/60 bg-black/40 cursor-pointer" onClick={handleOnClose} />
      <div
        className={cn(
          "absolute top-0 bottom-0 right-0 sm:w-[400px] w-5/6 bg-white flex flex-col pb-[140px] transition-transform duration-500 easeOutCustom",
          isVisible ? "translate-x-0" : "translate-x-full"
        )}
      >
        {" "}
        <div className="flex items-center justify-between py-3 border-b border-gray-300 mx-6">
          <h2 className="text-gray-800 text-xl font-medium">Shopping Cart ({quantity})</h2>
          <Button onClick={handleOnClose} className="p-2 size-11 border-white hover:border-gray-300">
            <CloseIcon width={18} />
          </Button>
        </div>
        {/* Cart Summary Section */}
        {cartItems && cartItems.length > 0 && (
          <div className="py-3 px-6 bg-gray-50 border-b border-gray-200">
            <div className="text-sm text-gray-500">
              <span className="font-medium">{cartItems.length}</span> {cartItems.length === 1 ? "item" : "items"} in
              your cart
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-400">
                Total quantity: {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
              <Link href="/checkout" className="text-xs text-bitex-blue-500 hover:underline" onClick={handleOnClose}>
                View detailed summary
              </Link>
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          {cartItems && cartItems.length ? (
            cartItems.map((item) => (
              <CartItem data={item} onLinkClicked={handleOnClose} key={`${item.productId}-${item.variantId || ""}`} />
            ))
          ) : (
            <div className="flex flex-col items-center">
              <div className="mt-20 mb-16 p-6 bg-gray-100 rounded-full">
                <ShoppingIconEmpty width={36} className="fill-gray-500" />
              </div>
              <span className="text-center text-gray-500">Shopping Cart is Empty.</span>
              <p className="text-sm text-gray-400 mt-2 text-center max-w-xs px-4">
                Add products to your cart and they will appear here
              </p>
            </div>
          )}
        </div>{" "}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-300 flex flex-col items-center justify-center gap-4 py-4 px-6">
          {!!cartItems?.length && (
            <>
              <div className="w-full space-y-2 mb-2">
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items):</span>
                  <span className="font-medium">
                    {calculateTotal().toLocaleString("en-us", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    €
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Total:</span>
                  <span className="text-lg font-semibold text-gray-800">
                    {calculateTotal().toLocaleString("en-us", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    €
                  </span>
                </div>
              </div>
              <Button
                onClick={handleCheckout}
                className="w-full text-sm font-semibold text-white bg-bitex-red-500 hover:bg-bitex-red-600 border-bitex-red-600 py-3"
              >
                CHECKOUT NOW
              </Button>
              <div className="w-full flex items-center justify-between">
                <Button
                  onClick={handleOnClose}
                  className="text-gray-500 text-sm border-gray-300 bg-gray-100 hover:border-gray-400 hover:bg-gray-200 active:border-gray-500 active:bg-gray-300 py-2"
                >
                  Continue Shopping
                </Button>
                <Link href="/checkout" className="text-sm text-bitex-blue-500 hover:underline" onClick={handleOnClose}>
                  View Cart Details
                </Link>
              </div>
            </>
          )}
          {!cartItems?.length && (
            <Button
              onClick={handleOnClose}
              className="text-gray-500 text-sm w-4/5 border-gray-300 bg-gray-100 hover:border-gray-400 hover:bg-gray-200 active:border-gray-500 active:bg-gray-300 py-2.5"
            >
              Continue Shopping
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;
