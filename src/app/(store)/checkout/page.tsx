"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import Image from "next/image";
import Link from "next/link";

import { getCartProducts } from "@/actions/product/product";
import { createOrder } from "@/actions/order/order";
import OrderItemCard from "@/components/store/common/orderItemCard";
import { RootState } from "@/store/shoppingCart";
import { TCartListItemDB } from "@/types/product";
// Import the shopping cart types
import { TCartItemData } from "@/types/shoppingCart.d";
import { TOrderItem, TShippingInfo } from "@/types/order.d";
import { useSession } from "next-auth/react";
import Button from "@/components/UI/button";
import Input from "@/components/UI/input";
import { QRCode } from "@/components/UI/qrCode";

// Bank account info
const BANK_INFO = {
  accountName: "BITEX COMPANY",
  accountNumber: "1234567890",
  bankName: "VietcomBank",
  branch: "Ho Chi Minh City",
  transferMessage: "BITEX-ORDER",
};

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const dispatch = useDispatch();
  const cartState = useSelector((state: RootState) => state.cart);

  const [cartItems, setCartItems] = useState<TCartItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const [shippingInfo, setShippingInfo] = useState<TShippingInfo>({
    fullName: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    phone: "",
  });

  useEffect(() => {
    if (status === "loading") return;

    // Redirect to login if not authenticated
    if (status === "unauthenticated") {
      setShowLogin(true);
    }

    // Fetch cart items from database
    const fetchCartItems = async () => {
      setIsLoading(true);
      const productIds = cartState.items.map((item) => item.productId);

      if (productIds.length === 0) {
        setCartItems([]);
        setIsLoading(false);
        return;
      }

      const response = await getCartProducts(productIds);
      if (response.success && response.res) {
        // Create cart items with variant information
        const mappedItems: TCartItemData[] = [];

        // Type assertion to handle the response
        const cartProducts = response.res as unknown as TCartListItemDB[];

        cartProducts.forEach((product) => {
          // Find all cart items for this product
          const cartItemsForProduct = cartState.items.filter((item) => item.productId === product.id);

          cartItemsForProduct.forEach((cartItem) => {
            // Find variant if present
            const variant = product.variants?.find((v) => v.id === cartItem.variantId);

            mappedItems.push({
              productId: product.id,
              imgUrl: product.images[0],
              price: variant?.retail_price || product.price,
              dealPrice: variant?.sale_price || product.salePrice || undefined,
              quantity: cartItem.quantity,
              productName: product.name,
              variantId: cartItem.variantId,
              variantAttributes: variant ? `${variant.attributeName}` : undefined,
            });
          });
        });

        setCartItems(mappedItems);
      } else {
        setError("Could not load cart items");
      }
      setIsLoading(false);
    };

    fetchCartItems();
  }, [cartState.items, router, status]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Calculate total price
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.dealPrice || item.price;
      return total + price * item.quantity;
    }, 0);
  };

  // Submit order
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (status !== "authenticated") {
      setShowLogin(true);
      return;
    }

    // Validate cart has items
    if (cartItems.length === 0) {
      setError("Your cart is empty");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare order items
      const orderItems: TOrderItem[] = cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.dealPrice || item.price,
        totalPrice: (item.dealPrice || item.price) * item.quantity,
        variantId: item.variantId || undefined,
        variantAttributes: item.variantAttributes || undefined,
      }));

      // Create order
      const result = await createOrder({
        items: orderItems,
        total: calculateTotal(),
        shippingInfo,
      });
      if (result.error) {
        setError(result.error);
      } else if (result.success && result.order) {
        setOrderId(result.order.id.toString());
        setShowQR(true);
      }
    } catch (err) {
      setError("An error occurred while processing your order");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate QR code data - in real app, this would be a proper payment QR
  const generateQRData = () => {
    return `${BANK_INFO.bankName}|${BANK_INFO.accountNumber}|${BANK_INFO.accountName}|${calculateTotal()}|${
      BANK_INFO.transferMessage
    }-${orderId?.substring(0, 8)}`;
  };

  // Handle payment confirmation
  const handleConfirmPayment = async () => {
    if (!orderId) return;

    setIsSubmitting(true);
    try {
      const result = await fetch(`/api/orders/${orderId}/confirm-payment`, {
        method: "POST",
      });

      if (result.ok) {
        // Redirect to success page
        router.push(`/orders/${orderId}/success`);
      } else {
        const data = await result.json();
        setError(data.error || "Failed to confirm payment");
      }
    } catch (err) {
      setError("An error occurred while confirming payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show login prompt
  if (showLogin) {
    return (
      <div className="storeContainer py-16">
        <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-medium text-gray-800 mb-6">Vui lòng đăng nhập</h1>
          <p className="text-gray-600 mb-8">Bạn cần đăng nhập để tiếp tục thanh toán</p>
          <div className="flex justify-between">
            <Link
              href="/auth/login?callbackUrl=/checkout"
              className="px-8 py-3 bg-bitex-blue-500 text-white rounded-md hover:bg-bitex-blue-600 transition-colors"
            >
              Đăng nhập
            </Link>
            <Button
              onClick={() => router.push("/")}
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100"
            >
              Quay lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show payment QR code
  if (showQR) {
    return (
      <div className="py-16">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">Thanh toán đơn hàng</h1>

          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h2 className="text-lg font-medium text-gray-700 mb-4">Thông tin chuyển khoản</h2>
            <div className="flex flex-col sm:flex-row gap-8 items-center">
              <div className="w-64 h-64 bg-white p-4 rounded-lg">
                <QRCode value={generateQRData()} size={240} />
              </div>

              <div className="flex-1">
                <div className="space-y-3 text-gray-700">
                  <p>
                    <span className="font-medium">Ngân hàng:</span> {BANK_INFO.bankName}
                  </p>
                  <p>
                    <span className="font-medium">Chi nhánh:</span> {BANK_INFO.branch}
                  </p>
                  <p>
                    <span className="font-medium">Tên tài khoản:</span> {BANK_INFO.accountName}
                  </p>
                  <p>
                    <span className="font-medium">Số tài khoản:</span> {BANK_INFO.accountNumber}
                  </p>
                  <p>
                    <span className="font-medium">Số tiền:</span>{" "}
                    {calculateTotal().toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                  </p>
                  <p>
                    <span className="font-medium">Nội dung:</span> {BANK_INFO.transferMessage}-
                    {orderId?.substring(0, 8)}
                  </p>
                </div>

                <div className="mt-8">
                  <Button
                    onClick={handleConfirmPayment}
                    className="w-full py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Đang xử lý..." : "Xác nhận đã thanh toán"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            <p>* Sau khi chuyển khoản, vui lòng nhấn "Xác nhận đã thanh toán"</p>
            <p>* Đơn hàng sẽ được xử lý sau khi chúng tôi xác nhận thanh toán</p>
          </div>
        </div>
      </div>
    );
  }

  // Main checkout form
  return (
    <div className="container mx-auto py-20">
      <h1 className="text-2xl font-semibold text-gray-800 mb-10">Thanh toán</h1>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">{error}</div>}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Shipping Form */}
        <div className="lg:w-2/3">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-medium text-gray-700 mb-6">Thông tin giao hàng</h2>

            <form onSubmit={handleSubmitOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
                <Input
                  type="text"
                  name="fullName"
                  value={shippingInfo.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                  placeholder="Nhập họ tên người nhận"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                <Input
                  type="text"
                  name="address"
                  value={shippingInfo.address}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                  placeholder="Nhập địa chỉ giao hàng"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thành phố</label>
                  <Input
                    type="text"
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                    placeholder="Thành phố"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành</label>
                  <Input
                    type="text"
                    name="province"
                    value={shippingInfo.province}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                    placeholder="Tỉnh/Thành"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã bưu điện</label>
                  <Input
                    type="text"
                    name="postalCode"
                    value={shippingInfo.postalCode}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                    placeholder="Mã bưu điện"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <Input
                    type="tel"
                    name="phone"
                    value={shippingInfo.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                    placeholder="Số điện thoại liên hệ"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full py-3 bg-bitex-blue-500 text-white font-medium rounded-md hover:bg-bitex-blue-600 transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang xử lý..." : "Tiếp tục để thanh toán"}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white p-6 rounded-lg shadow-sm sticky top-6">
            <h2 className="text-xl font-medium text-gray-700 mb-6">Tóm tắt đơn hàng</h2>

            {isLoading ? (
              <div className="flex justify-center p-6">
                <p>Đang tải...</p>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="text-center p-6">
                <p className="text-gray-500">Giỏ hàng trống</p>
                <Link href="/" className="text-bitex-blue-500 mt-4 inline-block">
                  Tiếp tục mua sắm
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-4 max-h-80 overflow-y-auto mb-6">
                  {cartItems.map((item) => (
                    <OrderItemCard key={`${item.productId}-${item.variantId || "default"}`} data={item} />
                  ))}
                </div>
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">
                      {calculateTotal().toLocaleString("en-us", { minimumFractionDigits: 2 })} €
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium">Free</span>
                  </div>
                  {/* Show total items summary */}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Items:</span>
                    <span className="font-medium">{cartItems.reduce((sum, item) => sum + item.quantity, 0)} items</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                    <span>Total:</span>
                    <span className="text-bitex-red-500">
                      {calculateTotal().toLocaleString("en-us", { minimumFractionDigits: 2 })} €
                    </span>
                  </div>
                </div>

                {/* Order details section */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="text-md font-medium text-gray-700 mb-3">Order Details</h3>
                  <div className="bg-gray-50 rounded-md p-3">
                    <div className="text-sm text-gray-600 space-y-2">
                      <div className="flex justify-between">
                        <span>Items:</span>
                        <span>{cartItems.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Quantity:</span>
                        <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)} items</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payment Method:</span>
                        <span>Bank Transfer</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Estimated Delivery:</span>
                        <span>3-5 business days</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
