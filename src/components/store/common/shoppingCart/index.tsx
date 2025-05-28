"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { ShoppingIconEmpty } from "@/components/icons/svgIcons";
import Button from "@/components/UI/button";
import { cn } from "@/shared/utils/styling";
import { RootState } from "@/store/shoppingCart";
import { TCartListItemDB } from "@/types/product";
import { TCartItemData } from "@/types/shoppingCart.d";
import { getCartProducts } from "@/actions/product/cart";

import CartItem from "./_components/cartItem";
import { CircleX, ShoppingBag } from "lucide-react";
import { fCurrency } from "@/shared/utils/format-number";

type TProps = {
  isVisible: boolean;
  quantity?: number;
  handleOnClose: () => void;
};

const ShoppingCart = ({ isVisible, quantity, handleOnClose }: TProps) => {
  const [cartItems, setCartItems] = useState<TCartItemData[]>([]);
  const localCartItems = useSelector((state: RootState) => state.cart);
  const router = useRouter();
  useEffect(() => {
    const convertDBtoCartItems = (rawData: TCartListItemDB[]) => {
      const cartListItem: TCartItemData[] = [];

      // Check if raw data is empty
      if (!rawData || rawData.length === 0) {
        return [];
      }

      rawData.forEach((item) => {
        // Make sure item.id is valid and correctly typed for comparison
        if (!item || !item.id) return;
        // Find all cart items with this product ID (convert numbers to strings for comparison if needed)
        const cartItems = localCartItems.items.filter((cartItem) => {
          // Convert both IDs to strings to ensure proper comparison
          return String(cartItem.productId) === String(item.id);
        });

        // If there are no cart items with this product ID, skip
        if (cartItems.length === 0) return;

        // For each cart item with this product ID (could be multiple variants)
        cartItems.forEach((cartItem) => {
          // Find the variant info if available
          const variant = item.variants?.find((v) => v.id === cartItem.variantId);

          // If we have a variant, use its prices
          // If not, fall back to the product's default price
          cartListItem.push({
            productId: item.id,
            imgUrl: item.images && item.images.length > 0 ? item.images[0] : "/images/products/default.jpg",
            price: variant?.retail_price || item.price || 0,
            quantity: cartItem.quantity,
            productName: item.name || "Sản phẩm không xác định",
            dealPrice: variant?.sale_price || item.salePrice || undefined,
            variantId: cartItem.variantId,
            // Include variant attributes information
            variantAttributes: variant ? `${variant.attributeName}` : undefined,
          });
        });
      });

      // Return empty array instead of null when no items found
      return cartListItem.length > 0 ? cartListItem : [];
    };
    const getProductsFromDB = async () => {
      if (!localCartItems.items || localCartItems.items.length === 0) {
        setCartItems([]);
        return;
      }

      try {
        const productsIDs = localCartItems.items.map((s) => Number(s.productId));
        const variantIDs = localCartItems.items
          .map((s) => s.variantId)
          .filter((id): id is number => id !== undefined && id !== null);

        const response = await getCartProducts(productsIDs, variantIDs.length > 0 ? variantIDs : undefined);
        if (response.success && response.res) {
          const cartListItems = response.res as unknown as TCartListItemDB[];

          const finalResult = convertDBtoCartItems(cartListItems);

          if (!finalResult || finalResult.length === 0) {
            setCartItems([]);
            return;
          }
          setCartItems(finalResult);
        } else {
          console.log("Lỗi API giỏ hàng:", response.error);
          setCartItems([]);
        }
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm giỏ hàng:", error);
        setCartItems([]);
      }
    };
    if (localCartItems) {
      getProductsFromDB();
    }
  }, [localCartItems]);

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
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-pointer" onClick={handleOnClose} />
      <div
        className={cn(
          "absolute top-0 bottom-0 right-0 sm:w-[420px] w-full sm:max-w-[90vw] bg-white flex flex-col shadow-2xl transition-transform duration-500 ease-out",
          isVisible ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between py-4 px-6 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-gray-600" />
            <h2 className="text-gray-900 text-xl font-semibold">
              Giỏ hàng
              {quantity !== undefined && quantity > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {quantity}
                </span>
              )}
            </h2>
          </div>
          <Button
            onClick={handleOnClose}
            variant="secondary"
            size="sm"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <CircleX className="w-5 h-5 text-gray-500" />
          </Button>
        </div>

        {/* Cart Summary Section */}
        {cartItems && cartItems.length > 0 && (
          <div className="py-3 px-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-700 font-medium">
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm trong giỏ
              </span>
              <span className="text-sm text-blue-600">Tổng: {fCurrency(calculateTotal(), { currency: "VND" })}</span>
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {cartItems && Array.isArray(cartItems) && cartItems.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {cartItems.map((item) => (
                <div key={`${item.productId}-${item.variantId || ""}`} className="bg-white">
                  <CartItem data={item} onLinkClicked={handleOnClose} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <div className="mb-6 p-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-inner">
                <ShoppingIconEmpty width={48} className="fill-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Giỏ hàng trống</h3>
              <p className="text-sm text-gray-500 text-center max-w-xs px-4 leading-relaxed">
                Khám phá các sản phẩm tuyệt vời của chúng tôi và thêm vào giỏ hàng ngay!
              </p>
            </div>
          )}
        </div>

        {/* Footer / Checkout Section */}
        <div className="bg-white border-t border-gray-200 shadow-lg">
          {cartItems && Array.isArray(cartItems) && cartItems.length > 0 ? (
            <div className="p-6 space-y-4">
              {/* Price Breakdown */}
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">
                    Tạm tính ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm)
                  </span>
                  <span className="font-medium text-gray-900">{fCurrency(calculateTotal(), { currency: "VND" })}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Tổng cộng</span>
                    <span className="text-xl font-bold text-blue-600">
                      {fCurrency(calculateTotal(), { currency: "VND" })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
              >
                THANH TOÁN NGAY
              </Button>
            </div>
          ) : (
            <div className="p-6">
              <Button
                onClick={handleOnClose}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg border border-gray-300 transition-colors duration-200"
              >
                Tiếp tục mua sắm
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;
