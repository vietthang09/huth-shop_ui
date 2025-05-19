"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { OrderStatus } from "@prisma/client";

import { QRCode } from "@/components/UI/qrCode";
import { RootState } from "@/store/shoppingCart";
import { TCartItemData } from "@/types/shoppingCart.d";
import { getCartProducts } from "@/actions/product/cart";

// Create a function to generate a new order with PROCESSING status
const createOrder = async (cartItems: TCartItemData[]) => {
  try {
    // Validate cart items
    if (!cartItems || cartItems.length === 0) {
      return { success: false, error: "Your cart is empty" };
    }

    // Calculate the total amount
    const total = cartItems.reduce((sum, item) => {
      const price = item.dealPrice || item.price;
      return sum + price * item.quantity;
    }, 0);

    // Validate total
    if (total <= 0) {
      return { success: false, error: "Invalid order total" };
    }

    // Prepare items for the order
    const items = cartItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.dealPrice || item.price,
      totalPrice: (item.dealPrice || item.price) * item.quantity,
      variantId: item.variantId || undefined,
      variantAttributes: item.variantAttributes,
    }));

    // Call your server endpoint to create the order
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items,
        total,
        status: OrderStatus.PROCESSING,
      }),
    });

    // Parse response even if it's not successful to get error details
    const data = await response.json();

    if (!response.ok) {
      // Handle different types of errors with appropriate messages
      if (response.status === 401) {
        return { success: false, error: "You must be logged in to complete your purchase" };
      } else if (response.status === 400) {
        return { success: false, error: data.error || "Invalid order data" };
      } else if (response.status === 500 && data.error?.includes("inventory")) {
        return { success: false, error: "Some items are out of stock or have insufficient quantity" };
      } else {
        return { success: false, error: data.error || "Failed to create order" };
      }
    }

    return { success: true, orderId: data.orderId };
  } catch (error: any) {
    console.error("Error creating order:", error);
    // Provide a more specific error message if available
    return {
      success: false,
      error: error.message || "Failed to create order. Please check your network connection and try again.",
    };
  }
};

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<TCartItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const localCartItems = useSelector((state: RootState) => state.cart);
  const router = useRouter();

  // QR code data
  const qrValue =
    "https://payment.example.com?amount=" +
    cartItems.reduce((sum, item) => sum + (item.dealPrice || item.price) * item.quantity, 0).toFixed(2);

  // Load cart items
  useEffect(() => {
    const fetchCartItems = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (!localCartItems.items || localCartItems.items.length === 0) {
          setCartItems([]);
          setIsLoading(false);
          return;
        }

        // Convert to numbers for API call
        const productIds = localCartItems.items.map((item) => Number(item.productId));
        const variantIds = localCartItems.items
          .map((item) => item.variantId)
          .filter((id): id is number => id !== undefined && id !== null);

        const response = await getCartProducts(productIds, variantIds.length > 0 ? variantIds : undefined);

        if (response.success && response.res) {
          const formattedCartItems: TCartItemData[] = [];

          // Format cart items for display
          response.res.forEach((item) => {
            // Find matching cart items
            const matchingCartItems = localCartItems.items.filter(
              (cartItem) => String(cartItem.productId) === String(item.id)
            );

            matchingCartItems.forEach((cartItem) => {
              // Find variant info if available
              const variant = item.variants?.find((v) => v.id === cartItem.variantId);

              formattedCartItems.push({
                productId: item.id,
                productName: item.name,
                imgUrl: item.images[0] || "/images/products/default.jpg",
                price: Number(variant?.retail_price) || Number(item.price) || 0,
                dealPrice: variant?.sale_price
                  ? Number(variant.sale_price)
                  : item.salePrice
                  ? Number(item.salePrice)
                  : undefined,
                quantity: cartItem.quantity,
                variantId: cartItem.variantId,
                variantAttributes: variant ? variant.attributeName : undefined,
              });
            });
          });

          setCartItems(formattedCartItems);
        } else {
          setError(response.error || "Failed to load cart items");
        }
      } catch (error) {
        console.error("Error fetching cart data:", error);
        setError("Error loading cart data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartItems();
  }, [localCartItems]);

  // Calculate cart totals
  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      const price = item.dealPrice || item.price;
      return sum + price * item.quantity;
    }, 0);
  };

  // Handle confirm order
  const handleConfirmOrder = async () => {
    if (cartItems.length === 0) {
      setError("Your cart is empty");
      return;
    }

    setIsCreatingOrder(true);
    setError(null);
    try {
      // Validate cart items before creating order
      if (cartItems.some((item) => item.quantity <= 0)) {
        setError("Some items in your cart have invalid quantities");
        setIsCreatingOrder(false);
        return;
      }

      const result = await createOrder(cartItems);

      if (result.success) {
        // Navigate to success page
        // The cart will be cleared on the success page
        router.push(`/orders/${result.orderId}/success`);
      } else {
        // Handle specific error cases
        if (result.error?.includes("inventory")) {
          setError("Some items in your cart are out of stock or have insufficient quantity");
        } else if (result.error?.includes("logged in")) {
          setError("You must be logged in to complete your purchase");
          // Could redirect to login page here
          // router.push('/login?redirect=checkout');
        } else {
          setError(result.error || "Failed to create order");
        }
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      setError("An error occurred during checkout. Please try again later.");
    } finally {
      setIsCreatingOrder(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-8">Checkout</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-8">Checkout</h1>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-40">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">Checkout</h1>

      {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-md p-4">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cart Overview */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

          <div className="divide-y divide-gray-200">
            {cartItems.map((item) => (
              <div key={`${item.productId}-${item.variantId || ""}`} className="py-4 flex items-center">
                <div className="w-16 h-16 relative flex-shrink-0">
                  <Image src={item.imgUrl} fill alt={item.productName} className="object-contain" />
                </div>

                <div className="ml-4 flex-grow">
                  <h3 className="text-sm font-medium text-gray-800">{item.productName}</h3>
                  {item.variantAttributes && <p className="text-xs text-gray-500">Variant: {item.variantAttributes}</p>}
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                    <span className="text-sm font-medium">
                      {item.dealPrice ? (
                        <>
                          <span className="line-through text-gray-400 mr-1">${item.price.toFixed(2)}</span>$
                          {item.dealPrice.toFixed(2)}
                        </>
                      ) : (
                        `$${item.price.toFixed(2)}`
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center font-medium text-lg">
              <span>Total</span>
              <span>${calculateSubtotal().toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment QR Code */}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-4">Scan to Pay</h2>
          <div className="mb-6">
            <QRCode value={qrValue} size={250} logoUrl="/images/logo.png" />
          </div>
          <p className="text-gray-500 text-sm mb-6 text-center">
            Scan this QR code with your banking app to make the payment
          </p>

          <button
            onClick={handleConfirmOrder}
            disabled={isCreatingOrder}
            className="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {isCreatingOrder ? "Processing..." : "Confirm Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
