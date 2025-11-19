"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import parse from "html-react-parser";
import Image from "next/image";
import {
  ChevronRight,
  ShoppingCart,
  MessageCircle,
  Shield,
  Clock,
  Mail,
  Star,
  Key,
  User,
  Zap,
  Info,
} from "lucide-react";
import { fCurrency } from "@/shared/utils/format-number";
import { useRecentlyVisited } from "@/hooks/useRecentlyVisited";
import { useCartStore } from "@/store/cartStore";
import { findOne, findOneBySku, TProduct } from "@/services/product";
import ProductPlaceholderImage from "@/components/store/common/product-placeholder-image";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui";
import { cn } from "@/shared/utils/styling";

const ProductPage = () => {
  const router = useRouter();
  const { sku } = useParams<{ sku: string }>();
  const { addProduct } = useRecentlyVisited();
  const [productInfo, setProductInfo] = useState<TProduct | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);

  // Redirect if no SKU
  useEffect(() => {
    if (!sku) {
      router.push("/");
    }
  }, [sku, router]);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await findOneBySku(sku);
        if (res.status === 200) {
          const productData = res.data as TProduct;
          setProductInfo(productData);

          if (productData.variants && productData.variants.length > 0) {
            setSelectedVariant(productData.variants[0].id);
          }

          // Add to recently visited products
          addProduct(productData);
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
    const variant = productInfo.variants?.find((prop: any) => prop.id === selectedVariant);
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
  if (productInfo === null && !loading) {
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
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="py-2" aria-label="Breadcrumb">
          <div className="flex items-center text-sm text-[#8083a1] font-semibold space-x-2">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Trang chủ
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link href={`/danh-muc/${productInfo.category.slug}`} className="hover:text-blue-600 transition-colors">
              {productInfo.category.title}
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="truncate max-w-xs">{productInfo.title}</span>
          </div>
        </nav>

        <Image
          src="https://cdn.k4g.com/files/marketing_placement/eac86eec81f2590b37e5baf0f2cc8d60.png"
          width={100}
          height={96}
          alt="banner"
          className="w-full rounded-xl mb-4"
          unoptimized
        />

        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2">
            <div className="flex gap-6">
              <div>
                {productInfo.images && productInfo.images.length > 0 ? (
                  <Image
                    height={200}
                    width={200}
                    className="w-full max-w-56 h-auto object-contain rounded-lg"
                    unoptimized
                    src={productInfo.images[0]}
                    alt={productInfo.title}
                  />
                ) : (
                  <div className="h-48 flex items-center justify-center bg-gray-100 rounded-lg">
                    <ProductPlaceholderImage />
                  </div>
                )}
              </div>

              <div>
                <h1 className="text-3xl font-bold text-white">{productInfo.title}</h1>
                <div className="mt-4 grid grid-cols-2 w-full gap-6">
                  <div className="flex items-center">
                    <div className="bg-orange-400 text-white p-2 size-10 rounded-xl flex items-center justify-center">
                      <Key />
                    </div>
                    <div className="ml-2 text-nowrap">
                      <p className="text-gray-500 text-xs font-semibold uppercase">Loại tài khoản</p>
                      <p className="text-white font-semibold">Nâng cấp trực tiếp</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-green-400 text-white p-2 size-10 rounded-xl flex items-center justify-center">
                      <Zap />
                    </div>
                    <div className="ml-2 text-nowrap">
                      <p className="text-gray-500 text-xs font-semibold uppercase">Thời gian xử lý</p>
                      <p className="text-white font-semibold">Trong 15ph</p>
                    </div>
                  </div>
                </div>

                <div className="w-fit mt-4 bg-gray-100/20 p-2 rounded-xl flex gap-2 items-center">
                  <div className="size-8 p-1 flex items-center justify-center rounded-full bg-orange-400/20 text-orange-400">
                    <Info size={20} />
                  </div>
                  <p className="text-sm text-gray-300">Xem ghi chú quan trọng</p>
                </div>
              </div>
            </div>

            <div>
              <h3>Các tùy chọn</h3>
              <ProductOptions
                product={productInfo}
                selectedVariant={selectedVariant}
                onVariantSelect={setSelectedVariant}
              />
            </div>
          </div>
          <div className="col-span-1">
            <div className="bg-[#171a3c] rounded-xl shadow">
              <div className="px-4 py-3 gap-4 space-y-6">
                <h3 className="text-white">Lựa chọn tốt nhất cho bạn</h3>
                <div className="flex items-center justify-center gap-4">
                  <button
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center font-semibold"
                    onClick={() => handleQuantityChange(true)}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <span className="text-xl font-semibold min-w-[2rem] text-center">{quantity}</span>
                  <button
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center font-semibold"
                    onClick={() => handleQuantityChange(false)}
                  >
                    +
                  </button>
                </div>
                <Button className="w-full gap-2 bg-gradient-to-r from-[#f0b46a] to-[#fce08f] text-[#5a4323] font-bold">
                  <ShoppingCart size={20} /> Thêm vào giỏ
                </Button>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">VT</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Việt Thắng</h3>
                    <p className="text-sm text-gray-500">Hỗ trợ viên</p>
                  </div>
                </div>
              </div>
              <hr className="h-[2px] bg-gray-200" />
              <div className="px-4 py-3">
                <Link href="#" className="text-white text-sm font-semibold">
                  Xem 7 lựa chọn khác giá từ 30.000 đ
                </Link>
              </div>
            </div>
            <div className="mt-4 bg-[#171a3c] rounded-xl shadow grid grid-cols-2 divide-x-2 divide-[#000326] divide-y-2">
              <div className="p-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                  <path
                    fill="#F73030"
                    d="M4.7 6.172s-1.008-2.747-.56-4.486C4.59-.053 6.4-.065 7.264 1.504c.864 1.57.37 3.464-.237 4.583-.607 1.12-2.028 1.053-2.325.085ZM3.582 7.719s-.185-2.445-1.13-3.615c-.945-1.17-2.33-.55-2.443.946-.114 1.496.92 2.768 1.772 3.411.85.643 1.91.099 1.801-.742ZM3.953 9.451s1.99-1.94 3.087-2.04c1.097-.098.956.521.127 1.44-.83.918-2.789 2.619-2.908 3.362-.12.742 3.082.106 3.374.379.291.272-1.21 2.24-3.433 2.957-2.224.716-3.654-2.617-.247-6.098Z"
                  ></path>
                  <path
                    fill="#DBDCE9"
                    d="M10.134 6.795s-1.03-.433-1.095-2.12c-.064-1.688.966-3.7 2.287-4.097 1.322-.397 2.29 1.669 1.608 3.67-.683 2.003-2.277 2.974-2.8 2.547ZM12.15 7.755s1.66-2.625 2.998-2.539c1.337.087 1.065 2.752-.567 4.167-1.632 1.416-3.047-.777-2.43-1.628ZM12.357 10.676s-1.383-1.587-2.03-2.411c-.648-.825-1.281-1.189-1.04 0 .24 1.189.527 2.046.057 2.431-.381.313-.963.162-.808-.297.154-.459-.232-.697-.741-.124-.508.573-1.051.864-.773 1.105.301.26 2.204-.042 2.589.3.385.342-.93 1.336-.797 2.178.133.842 1.649 1.922 3.285 1.565 1.637-.357 2.753-2.511.258-4.747Z"
                  ></path>
                </svg>
                <p className="text-white text-sm font-bold">Nâng cấp tức thì</p>
              </div>
              <div className="p-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                  <path
                    fill="#F73030"
                    d="M4.7 6.172s-1.008-2.747-.56-4.486C4.59-.053 6.4-.065 7.264 1.504c.864 1.57.37 3.464-.237 4.583-.607 1.12-2.028 1.053-2.325.085ZM3.582 7.719s-.185-2.445-1.13-3.615c-.945-1.17-2.33-.55-2.443.946-.114 1.496.92 2.768 1.772 3.411.85.643 1.91.099 1.801-.742ZM3.953 9.451s1.99-1.94 3.087-2.04c1.097-.098.956.521.127 1.44-.83.918-2.789 2.619-2.908 3.362-.12.742 3.082.106 3.374.379.291.272-1.21 2.24-3.433 2.957-2.224.716-3.654-2.617-.247-6.098Z"
                  ></path>
                  <path
                    fill="#DBDCE9"
                    d="M10.134 6.795s-1.03-.433-1.095-2.12c-.064-1.688.966-3.7 2.287-4.097 1.322-.397 2.29 1.669 1.608 3.67-.683 2.003-2.277 2.974-2.8 2.547ZM12.15 7.755s1.66-2.625 2.998-2.539c1.337.087 1.065 2.752-.567 4.167-1.632 1.416-3.047-.777-2.43-1.628ZM12.357 10.676s-1.383-1.587-2.03-2.411c-.648-.825-1.281-1.189-1.04 0 .24 1.189.527 2.046.057 2.431-.381.313-.963.162-.808-.297.154-.459-.232-.697-.741-.124-.508.573-1.051.864-.773 1.105.301.26 2.204-.042 2.589.3.385.342-.93 1.336-.797 2.178.133.842 1.649 1.922 3.285 1.565 1.637-.357 2.753-2.511.258-4.747Z"
                  ></path>
                </svg>
                <p className="text-white text-sm font-bold">Sản phẩm chất lượng</p>
              </div>
              <div className="p-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                  <path
                    fill="#F73030"
                    d="M4.7 6.172s-1.008-2.747-.56-4.486C4.59-.053 6.4-.065 7.264 1.504c.864 1.57.37 3.464-.237 4.583-.607 1.12-2.028 1.053-2.325.085ZM3.582 7.719s-.185-2.445-1.13-3.615c-.945-1.17-2.33-.55-2.443.946-.114 1.496.92 2.768 1.772 3.411.85.643 1.91.099 1.801-.742ZM3.953 9.451s1.99-1.94 3.087-2.04c1.097-.098.956.521.127 1.44-.83.918-2.789 2.619-2.908 3.362-.12.742 3.082.106 3.374.379.291.272-1.21 2.24-3.433 2.957-2.224.716-3.654-2.617-.247-6.098Z"
                  ></path>
                  <path
                    fill="#DBDCE9"
                    d="M10.134 6.795s-1.03-.433-1.095-2.12c-.064-1.688.966-3.7 2.287-4.097 1.322-.397 2.29 1.669 1.608 3.67-.683 2.003-2.277 2.974-2.8 2.547ZM12.15 7.755s1.66-2.625 2.998-2.539c1.337.087 1.065 2.752-.567 4.167-1.632 1.416-3.047-.777-2.43-1.628ZM12.357 10.676s-1.383-1.587-2.03-2.411c-.648-.825-1.281-1.189-1.04 0 .24 1.189.527 2.046.057 2.431-.381.313-.963.162-.808-.297.154-.459-.232-.697-.741-.124-.508.573-1.051.864-.773 1.105.301.26 2.204-.042 2.589.3.385.342-.93 1.336-.797 2.178.133.842 1.649 1.922 3.285 1.565 1.637-.357 2.753-2.511.258-4.747Z"
                  ></path>
                </svg>
                <p className="text-white text-sm font-bold">Hỗ trợ 24/7</p>
              </div>
              <div className="p-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                  <path
                    fill="#F73030"
                    d="M4.7 6.172s-1.008-2.747-.56-4.486C4.59-.053 6.4-.065 7.264 1.504c.864 1.57.37 3.464-.237 4.583-.607 1.12-2.028 1.053-2.325.085ZM3.582 7.719s-.185-2.445-1.13-3.615c-.945-1.17-2.33-.55-2.443.946-.114 1.496.92 2.768 1.772 3.411.85.643 1.91.099 1.801-.742ZM3.953 9.451s1.99-1.94 3.087-2.04c1.097-.098.956.521.127 1.44-.83.918-2.789 2.619-2.908 3.362-.12.742 3.082.106 3.374.379.291.272-1.21 2.24-3.433 2.957-2.224.716-3.654-2.617-.247-6.098Z"
                  ></path>
                  <path
                    fill="#DBDCE9"
                    d="M10.134 6.795s-1.03-.433-1.095-2.12c-.064-1.688.966-3.7 2.287-4.097 1.322-.397 2.29 1.669 1.608 3.67-.683 2.003-2.277 2.974-2.8 2.547ZM12.15 7.755s1.66-2.625 2.998-2.539c1.337.087 1.065 2.752-.567 4.167-1.632 1.416-3.047-.777-2.43-1.628ZM12.357 10.676s-1.383-1.587-2.03-2.411c-.648-.825-1.281-1.189-1.04 0 .24 1.189.527 2.046.057 2.431-.381.313-.963.162-.808-.297.154-.459-.232-.697-.741-.124-.508.573-1.051.864-.773 1.105.301.26 2.204-.042 2.589.3.385.342-.93 1.336-.797 2.178.133.842 1.649 1.922 3.285 1.565 1.637-.357 2.753-2.511.258-4.747Z"
                  ></path>
                </svg>
                <p className="text-white text-sm font-bold">Chính sách hoàn tiền</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component for product options
const ProductOptions = ({
  product,
  selectedVariant,
  onVariantSelect,
}: {
  product: TProduct;
  selectedVariant: number | null;
  onVariantSelect: (id: number) => void;
}) => (
  <div className="border border-white rounded-xl overflow-hidden">
    {product.variants?.map((property) => (
      <div
        key={property.id}
        onClick={() => onVariantSelect(property.id)}
        className={`relative p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
          selectedVariant === property.id
            ? "border-yellow-400 bg-yellow-400/20 shadow-sm"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 flex items-center gap-4">
            <div
              className={cn(
                "size-5 border  rounded-full flex items-center justify-center",
                selectedVariant === property.id ? "border-yellow-400" : "border-gray-500",
              )}
            >
              {selectedVariant === property.id && <div className="size-3 bg-yellow-400 rounded-full" />}
            </div>
            <h3
              className={cn("font-medium", selectedVariant === property.id ? "text-white" : "text-gray-500")}
            >{`${product.title} - ${property.title}`}</h3>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-green-500 fill-current" />
                <span className="font-semibold text-green-600">100.00%</span>
              </div>
              <span className="text-gray-500">|</span>
              <span className="text-gray-600">Đã bán 3,083</span>
            </div>
          </div>
          <div className="text-lg font-bold text-white">{fCurrency(property.retailPrice, { currency: "VND" })}</div>
        </div>
      </div>
    ))}
  </div>
);

export default ProductPage;
