"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { OrderStatus } from "@prisma/client";

import { RootState } from "@/store/shoppingCart";
import { TCartItemData } from "@/types/shoppingCart.d";
import { getCartProducts } from "@/actions/product/cart";
import { fCurrency } from "@/shared/utils/format-number";
import { useSession } from "next-auth/react";

// Tạo đơn hàng mới với trạng thái ĐANG XỬ LÝ
const createOrder = async (cartItems: TCartItemData[]) => {
  try {
    // Kiểm tra các mặt hàng trong giỏ
    if (!cartItems || cartItems.length === 0) {
      return { success: false, error: "Giỏ hàng của bạn đang trống" };
    }

    // Tính tổng số tiền
    const total = cartItems.reduce((sum, item) => {
      const price = item.dealPrice || item.price;
      return sum + price * item.quantity;
    }, 0);

    // Kiểm tra tổng tiền hợp lệ
    if (total <= 0) {
      return { success: false, error: "Tổng tiền đơn hàng không hợp lệ" };
    } // Chuẩn bị các mặt hàng cho đơn hàng
    const items = cartItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.dealPrice || item.price,
      totalPrice: (item.dealPrice || item.price) * item.quantity,
      variantId: item.variantId || undefined,
      variantAttributes: item.variantAttributes,
    }));

    // Gọi API tạo đơn hàng
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

    // Phân tích phản hồi kể cả khi không thành công để lấy chi tiết lỗi
    const data = await response.json();

    if (!response.ok) {
      // Xử lý các loại lỗi khác nhau với thông báo phù hợp
      if (response.status === 401) {
        return { success: false, error: "Bạn cần đăng nhập để hoàn tất đơn hàng" };
      } else if (response.status === 400) {
        return { success: false, error: data.error || "Dữ liệu đơn hàng không hợp lệ" };
      } else if (response.status === 500 && data.error?.includes("inventory")) {
        return { success: false, error: "Một số sản phẩm đã hết hàng hoặc không đủ số lượng" };
      } else {
        return { success: false, error: data.error || "Tạo đơn hàng thất bại" };
      }
    }
    return { success: true, orderId: data.orderId };
  } catch (error: any) {
    console.error("Lỗi tạo đơn hàng:", error);
    // Cung cấp thông báo lỗi cụ thể hơn nếu có
    return {
      success: false,
      error: error.message || "Tạo đơn hàng thất bại. Vui lòng kiểm tra kết nối mạng và thử lại.",
    };
  }
};

export default function CheckoutPage() {
  const { data } = useSession();
  const [cartItems, setCartItems] = useState<TCartItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const localCartItems = useSelector((state: RootState) => state.cart);
  const router = useRouter();
  // Dữ liệu mã QR thanh toán
  const qrValue = `https://vietqr.co/api/generate/vcb/9377196605/Le%20Viet%20Thang/${cartItems.reduce(
    (sum, item) => sum + (item.dealPrice || item.price) * item.quantity,
    0
  )}/XAC NHAN ${data?.user.id} ${new Date().getTime().toString().slice(0, -6)}?isMask=0&logo=1&style=2&bg=61&download`;

  // Tải danh sách sản phẩm trong giỏ hàng
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
          setError(response.error || "Không thể tải sản phẩm trong giỏ hàng");
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu giỏ hàng:", error);
        setError("Lỗi khi tải dữ liệu giỏ hàng");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartItems();
  }, [localCartItems]);
  // Tính tổng tiền trong giỏ hàng
  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      const price = item.dealPrice || item.price;
      return sum + price * item.quantity;
    }, 0);
  };

  // Xử lý xác nhận đơn hàng
  const handleConfirmOrder = async () => {
    if (cartItems.length === 0) {
      setError("Giỏ hàng của bạn đang trống");
      return;
    }

    setIsCreatingOrder(true);
    setError(null);
    try {
      // Kiểm tra các sản phẩm trong giỏ hàng trước khi tạo đơn
      if (cartItems.some((item) => item.quantity <= 0)) {
        setError("Một số sản phẩm trong giỏ hàng có số lượng không hợp lệ");
        setIsCreatingOrder(false);
        return;
      }

      const result = await createOrder(cartItems);

      if (result.success) {
        // Chuyển đến trang thành công
        // Giỏ hàng sẽ được xóa ở trang thành công
        router.push(`/orders/${result.orderId}/success`);
      } else {
        // Xử lý các trường hợp lỗi cụ thể
        if (result.error?.includes("inventory")) {
          setError("Một số sản phẩm trong giỏ hàng đã hết hàng hoặc không đủ số lượng");
        } else if (result.error?.includes("logged in")) {
          setError("Bạn cần đăng nhập để hoàn tất đơn hàng");
          // Có thể chuyển hướng đến trang đăng nhập ở đây
          // router.push('/login?redirect=checkout');
        } else {
          setError(result.error || "Tạo đơn hàng thất bại");
        }
      }
    } catch (error) {
      console.error("Lỗi trong quá trình thanh toán:", error);
      setError("Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại sau.");
    } finally {
      setIsCreatingOrder(false);
    }
  };
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800">Thanh Toán</h1>
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600">Đang tải thông tin giỏ hàng...</p>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800">Thanh Toán</h1>
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 4M7 13l2.5 4M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">Giỏ hàng trống</h2>
          <p className="text-gray-500 mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-lg font-bold text-gray-900 mb-2">Thanh Toán</h1>
          <p className="text-gray-600 text-sm">Xem lại đơn hàng và hoàn tất thanh toán</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tóm tắt đơn hàng */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Tóm tắt đơn hàng</h2>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {cartItems.length} sản phẩm
                </span>
              </div>

              <div className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <div key={`${item.productId}-${item.variantId || ""}`} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 relative flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={item.imgUrl}
                          fill
                          alt={item.productName}
                          className="object-cover hover:scale-105 transition-transform duration-200"
                        />
                      </div>

                      <div className="flex-grow min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">{item.productName}</h3>
                        {item.variantAttributes && (
                          <p className="text-xs text-gray-500 mt-1">
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700">
                              {item.variantAttributes}
                            </span>
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-gray-600">Số lượng: {item.quantity}</span>
                          <div className="text-right">
                            {item.dealPrice ? (
                              <div className="space-y-1">
                                <span className="text-xs line-through text-gray-400">
                                  {fCurrency(item.price, { currency: "VND" })}
                                </span>
                                <div className="text-sm font-semibold text-red-600">
                                  {fCurrency(item.dealPrice, { currency: "VND" })}
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm font-semibold text-gray-900">
                                {fCurrency(item.price, { currency: "VND" })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between text-lg font-semibold text-gray-900">
                  <span>Tổng cộng</span>
                  <span className="text-blue-600">{fCurrency(calculateSubtotal(), { currency: "VND" })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Thanh toán QR */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Quét mã thanh toán</h2>

                <div className="bg-gray-50 rounded-xl p-4 mb-6 flex items-center justify-center">
                  <Image width={200} height={200} src={qrValue} alt="QR Thanh toán" />
                </div>

                <div className="space-y-3 mb-6">
                  <p className="text-sm text-gray-600">Sử dụng ứng dụng ngân hàng để quét mã QR</p>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-800 font-medium">
                      Số tiền:{" "}
                      <span className="text-lg font-bold">{fCurrency(calculateSubtotal(), { currency: "VND" })} </span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleConfirmOrder}
                  disabled={isCreatingOrder}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
                >
                  {isCreatingOrder ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Đang xử lý...</span>
                    </div>
                  ) : (
                    "Xác nhận đơn hàng"
                  )}
                </button>

                <p className="text-xs text-gray-500 mt-4">
                  Bằng cách xác nhận đơn hàng, bạn đồng ý với điều khoản sử dụng của chúng tôi
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
