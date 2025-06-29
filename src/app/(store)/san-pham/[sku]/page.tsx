"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import parse from "html-react-parser";
import { SK_Box } from "@/components/UI/skeleton";
import { entertainmentProducts, mockProducts } from "@/components/store/home/data";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { fCurrency } from "@/shared/utils/format-number";
import ProductCard from "@/components/store/common/productCard";
import { useRecentlyVisited } from "@/hooks/useRecentlyVisited";

// Define types for the product data
interface ProductPrice {
  id: number;
  net_price: number; // Changed from any to number
  retail_price: number; // Changed from any to number
  sale_price: number | null; // Changed from any to number|null
  attributeSetHash: string;
  inventory: number;
  attributeName?: string; // Added attribute name
}

const ProductPage = () => {
  const router = useRouter();
  const { sku } = useParams<{ sku: string }>();
  const { addProduct } = useRecentlyVisited();
  const [productInfo, setProductInfo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(Math.max(1 || 1, 1));
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);

  if (!sku) router.push("/");

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const productData = mockProducts.find((product) => product.sku === sku);
        console.log("Product Data:", productData);
        if (productData) {
          setProductInfo(productData);
          // Auto-select the first variant if available
          if (productData.properties && productData.properties.length > 0) {
            setSelectedVariant(productData.properties[0].id);
          }

          // Add to recently visited products
          addProduct({
            id: productData.id,
            sku: productData.sku,
            title: productData.title,
            image: productData.image,
            cardColor: productData.cardColor,
            properties: productData.properties.map((prop: any) => ({
              id: prop.id,
              retailPrice: prop.retailPrice,
              salePrice: prop.salePrice,
              attributeName: prop.attributeName,
            })),
            category: productData.category,
          });
        } else {
          setProductInfo(undefined); // Product not found
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [sku]);

  const handleQuantityChange = useCallback((isReducing: boolean) => {
    setQuantity((prev) => (isReducing ? Math.max(prev - 1, 1) : prev + 1));
  }, []);

  // Get selected variant's price
  const getSelectedVariantPrice = useCallback(() => {
    if (!productInfo || !selectedVariant) return 0;
    const variant = productInfo.properties?.find((prop: any) => prop.id === selectedVariant);
    console.log("Selected variant:", selectedVariant, "Found variant:", variant);
    if (!variant) return 0;
    // Use sale price if available, otherwise use retail price
    return variant.retailPrice;
  }, [productInfo, selectedVariant]);

  // Calculate total price
  const totalPrice = getSelectedVariantPrice() * quantity;

  // Error state
  if (error) {
    return (
      <div className="storeContainer">
        <div className="w-full h-[400px] mt-[160px] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-medium text-gray-800 mb-4">Oops! Có lỗi xảy ra</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.back()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Product not found
  if (productInfo === undefined && !loading) {
    return (
      <div className="storeContainer">
        <div className="w-full h-[400px] mt-[160px] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-medium text-gray-800 mb-4">Không tìm thấy sản phẩm</h2>
            <p className="text-gray-600 mb-6">Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
            <Link
              href="/"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!productInfo) return;
  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
        <div className="col-span-2 order-2 lg:order-1">
          {/* Breadcrumb */}
          <nav className="w-full mb-8 hidden lg:block" aria-label="Breadcrumb">
            <div className="flex items-center text-gray-600 text-sm space-x-2">
              {productInfo ? (
                <>
                  <Link href="/" className="hover:text-blue-600 transition-colors">
                    Trang chủ
                  </Link>
                  <span className="text-gray-400">/</span>
                  <Link
                    href={"/danh-muc/" + productInfo.category.slug}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {productInfo.category.name}
                  </Link>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-800 font-medium truncate max-w-xs">{productInfo.title}</span>
                </>
              ) : (
                <SK_Box width="60%" height="20px" />
              )}
            </div>
          </nav>

          {/* Product info */}
          <div>
            <h1 className="text-3xl">{productInfo.title}</h1>
            <div className="mt-4 text-sm space-y-4 w-fit">
              <div className="flex gap-16 w-full border-b border-gray-200 pb-2 border-dashed">
                <div className="flex gap-4">
                  <span className="text-gray-600">Tốc độ giao hàng</span>
                  <span className="underline">10 phút (54.79%)</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-gray-600">Hình thức giao hàng</span>
                  <span className="underline">Tin nhắn/Email</span>
                </div>
              </div>

              <div className="flex gap-4 w-full border-b border-gray-200 pb-2 border-dashed">
                <span className="text-gray-600">Chế độ bảo hành</span>
                <span className="underline max-w-40">1 đổi 1 nếu có lỗi trong suốt thời gian sử dụng</span>
              </div>

              <p>{parse(productInfo.description)}</p>
            </div>

            <div className="mt-4">
              <h2 className="text-xl">
                Các tùy chọn
                {selectedVariant && (
                  <span className="text-sm text-gray-600 ml-2">
                    (Đã chọn: {productInfo.properties?.find((p: any) => p.id === selectedVariant)?.attributeSet?.value})
                  </span>
                )}
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2">
                {productInfo.properties?.map((property: any) => (
                  <div
                    key={property.id}
                    onClick={() => setSelectedVariant(property.id)}
                    className={`bg-white rounded-lg shadow p-4 text-sm flex items-center justify-between group cursor-pointer transition-all duration-200 ${
                      selectedVariant === property.id
                        ? "ring-2 ring-blue-500 border-blue-500 bg-blue-50"
                        : "hover:shadow-md"
                    }`}
                  >
                    <div>
                      <p>{`${productInfo.title} - ${property.attributeSet.value}`}</p>
                      <div className="mt-1">
                        <span className="font-semibold">{fCurrency(property.retailPrice, { currency: "VND" })}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <span className="text-green-500 text-lg">👍</span>
                            <span className="font-semibold text-green-600">100.00%</span>
                          </div>
                          <span className="text-gray-500">|</span>
                          <span className="text-gray-600">Đã bán 3,083</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight
                      className={`transition-all duration-100 group-hover:translate-x-2 ${
                        selectedVariant === property.id ? "text-blue-600" : "text-gray-600"
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-1 order-1 lg:order-2">
          <nav className="w-full mb-8 lg:hidden" aria-label="Breadcrumb">
            <div className="flex items-center text-gray-600 text-sm space-x-2">
              {productInfo ? (
                <>
                  <Link href="/" className="hover:text-blue-600 transition-colors">
                    Trang chủ
                  </Link>
                  <span className="text-gray-400">/</span>
                  <Link
                    href={"/danh-muc/" + productInfo.category.slug}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {productInfo.category.name}
                  </Link>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-800 font-medium truncate max-w-xs">{productInfo.title}</span>
                </>
              ) : (
                <SK_Box width="60%" height="20px" />
              )}
            </div>
          </nav>
          <div className="bg-white rounded-lg shadow p-6">
            <Image
              height={100}
              width={100}
              className="w-full h-auto object-contain rounded-lg mx-auto"
              unoptimized
              src={productInfo.image}
              alt={productInfo.title}
            />

            <div className="flex flex-col items-center gap-4 mt-8 fixed lg:static bottom-0 left-0 right-0 p-4 bg-white shadow-lg z-10">
              <div className="bg-white rounded-full shadow-xl space-x-8 p-1">
                <button
                  className="text-xl size-10 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors cursor-pointer"
                  onClick={() => handleQuantityChange(true)}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span>{quantity}</span>
                <button
                  className="text-xl size-10 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors cursor-pointer"
                  onClick={() => handleQuantityChange(false)}
                >
                  +
                </button>
              </div>

              <div>
                <span>Tổng tiền:</span>
                <span className="text-2xl font-semibold text-red-600 ml-2">
                  {selectedVariant ? fCurrency(totalPrice, { currency: "VND" }) : "Chọn tùy chọn"}
                </span>
              </div>

              <button
                className="bg-red-600 hover:bg-red-500 text-white text-2xl rounded-lg w-full py-2 cursor-pointer"
                onClick={() => {
                  window.open("https://www.facebook.com/profile.php?id=61577923558579", "_blank");
                }}
              >
                Mua ngay
              </button>
            </div>
          </div>

          <div className="mt-4 bg-white rounded-lg shadow p-6">
            {/* Seller Information */}
            <div className="space-y-4">
              {/* Rating and Sales Stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-green-500 text-lg">👍</span>
                    <span className="font-semibold text-green-600">100.00%</span>
                  </div>
                  <span className="text-gray-500">|</span>
                  <span className="text-gray-600">Đã bán 3,083</span>
                </div>
              </div>

              {/* Seller Profile */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">VT</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Việt Thắng</h3>
                    <p className="text-sm text-gray-500">Hỗ trợ viên</p>
                  </div>
                </div>

                {/* Chat Button */}
                <button
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  onClick={() => {
                    window.open("https://www.facebook.com/hi.vietthang/", "_blank");
                  }}
                >
                  <span className="text-lg">💬</span>
                  <span>Nhắn tin</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2 className="mt-8 text-lg font-semibold">Sản phẩm liên quan</h2>
      <div className="mt-2 grid grid-cols-1 lg:grid-cols-4 gap-4">
        {entertainmentProducts.map((product, index) => (
          <div
            key={product.id}
            className="w-full group opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards] flex-shrink-0"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="w-full transform transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-y-1">
              <ProductCard
                className="lg:w-72 w-full h-full shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 ring-1 ring-gray-200/30 hover:ring-blue-300/50"
                id={product.sku}
                sku={product.sku}
                name={product.title}
                price={product.lowestPrice}
                dealPrice={product.lowestSalePrice}
                imgUrl={product.image}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductPage;
