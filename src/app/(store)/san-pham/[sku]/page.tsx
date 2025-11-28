"use client";

import { ChevronRight, ShoppingCart, Star, Key, Zap, Info, ArrowDownRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import ProductPlaceholderImage from "@/components/store/common/product-placeholder-image";
import { Button } from "@/components/ui";
import Advantages from "@/features/store/details/Advantages";
import RelatedProducts from "@/features/store/details/RelatedProducts";
import SafeCheckout from "@/features/store/details/SafeCheckout";
import { findOneBySku, TProduct } from "@/services/product";
import { fCurrency } from "@/shared/utils/format-number";
import { cn } from "@/shared/utils/styling";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";

const ProductPage = () => {
  const router = useRouter();
  const { sku } = useParams<{ sku: string }>();
  const [productInfo, setProductInfo] = useState<TProduct | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const cartStore = useCartStore();
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

  const getSelectedVariant = useCallback(() => {
    if (!productInfo || !selectedVariant) return;
    const variant = productInfo.variants?.find((prop: any) => prop.id === selectedVariant);
    if (!variant) return;
    return variant;
  }, [productInfo, selectedVariant]);

  const onAddToCart = () => {
    if (!productInfo || !selectedVariant) return;
    const variant = getSelectedVariant();
    if (!variant) return;
    cartStore.addToCart(productInfo, selectedVariant);
    toast.success(`Đã thêm vào giỏ hàng`);
  };

  if (!productInfo) return;

  return (
    <div className="min-h-screen pb-10">
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
                  <p className="text-sm text-gray-300">
                    Xem hướng dẫn cài đặt <ArrowDownRight className="size-4 inline-block" />
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 font-bold text-white border-b border-b-gray-500/20 sticky top-28 bg-background z-40">
              <ul className="flex gap-4 pt-4">
                <li className="pb-4 border-b border-red-500 cursor-pointer">Các tùy chọn</li>
                <li>
                  <Link href="#san_pham_lien_quan">Sản phẩm liên quan</Link>
                </li>
                <li>
                  <Link href="#mo_ta">Mô tả sản phẩm</Link>
                </li>
                <li>
                  <Link href="#huong_dan">Hướng dẫn cài đặt</Link>
                </li>
                {/*<li>Đánh giá</li>*/}
              </ul>
            </div>

            <div className="mt-8">
              <h3 className="text-white font-bold text-2xl mb-3">Được đề xuất</h3>
              <div className="border border-gray-800 rounded-xl overflow-hidden divide-y divide-gray-800">
                <div
                  key={productInfo.variants[0].id}
                  onClick={() => setSelectedVariant(productInfo.variants[0].id)}
                  className={`relative p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedVariant === productInfo.variants[0].id
                      ? "border border-yellow-400 bg-yellow-400/20 shadow-sm rounded-xl z-20"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 flex items-center gap-4">
                      <div
                        className={cn(
                          "size-5 border  rounded-full flex items-center justify-center",
                          selectedVariant === productInfo.variants[0].id ? "border-yellow-400" : "border-gray-500",
                        )}
                      >
                        {selectedVariant === productInfo.variants[0].id && (
                          <div className="size-3 bg-yellow-400 rounded-full" />
                        )}
                      </div>
                      <h3
                        className={cn(
                          "font-medium",
                          selectedVariant === productInfo.variants[0].id ? "text-white" : "text-gray-500",
                        )}
                      >{`${productInfo.title} - ${productInfo.variants[0].title}`}</h3>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-green-500 fill-current" />
                          <span className="font-semibold text-green-600">100.00%</span>
                        </div>
                        <span className="text-gray-500">|</span>
                        <span className="text-gray-600">Đã bán 3,083</span>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-white">
                      {fCurrency(productInfo.variants[0].retailPrice, { currency: "VND" })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-white font-bold text-2xl mb-3">Các tùy chọn</h3>
              <div className="border border-gray-800 rounded-xl overflow-hidden divide-y divide-gray-800">
                {productInfo.variants?.slice(1).map((property) => (
                  <div
                    key={property.id}
                    onClick={() => setSelectedVariant(property.id)}
                    className={`relative p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedVariant === property.id
                        ? "border border-yellow-400 bg-yellow-400/20 shadow-sm rounded-xl z-20"
                        : ""
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
                          className={cn(
                            "font-medium",
                            selectedVariant === property.id ? "text-white" : "text-gray-500",
                          )}
                        >{`${productInfo.title} - ${property.title}`}</h3>

                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-green-500 fill-current" />
                            <span className="font-semibold text-green-600">100.00%</span>
                          </div>
                          <span className="text-gray-500">|</span>
                          <span className="text-gray-600">Đã bán 3,083</span>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-white">
                        {fCurrency(property.retailPrice, { currency: "VND" })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8" id="san_pham_lien_quan">
              <h3 className="text-white font-bold text-2xl mb-3">Các sản phẩm liên quan</h3>
              <RelatedProducts categorySlug={productInfo.category.slug} />
            </div>

            <div className="mt-8" id="mo_ta">
              <h3 className="text-white font-bold text-2xl mb-3">Mô tả sản phẩm</h3>
              <div className="bg-[#171a3c] p-8 rounded-xl">
                <p className="text-white">{productInfo.description}</p>
              </div>
            </div>

            <div className="mt-8" id="huong_dan">
              <h3 className="text-white font-bold text-2xl mb-3">Hướng dẫn cài đặt</h3>
              <div className="bg-[#171a3c] p-8 rounded-xl">
                <p className="text-white">{productInfo.description}</p>
              </div>
            </div>

            {/*<div className="mt-8">
              <h3 className="text-white font-bold text-2xl mb-3">Đánh giá</h3>
            </div>*/}
          </div>
          <div className="col-span-1">
            <div className="sticky top-40 space-y-4">
              <div className="bg-[#171a3c] rounded-xl shadow">
                <div className="px-4 py-3 gap-4 space-y-6">
                  <h3 className="text-white">Lựa chọn tốt nhất cho bạn</h3>

                  <div className="border border-yellow-400 bg-amber-50/10 p-4 rounded-lg">
                    <div className="flex gap-2">
                      <div className="size-8 border border-yellow-500 rounded-full flex items-center justify-center">
                        <div className="size-3  bg-yellow-500 rounded-full" />
                      </div>
                      <p className="text-amber-300">{`${productInfo.title} - ${getSelectedVariant()?.title}`}</p>
                    </div>
                    {getSelectedVariant()?.salePrice ? (
                      <>
                        <p className="text-white uppercase font-medium text-xs line-through">
                          <span>{fCurrency(getSelectedVariant()?.retailPrice, { currency: "VND" })}</span>
                        </p>
                        <div className="flex items-center gap-1">
                          <p className="text-lg font-bold uppercase">
                            {fCurrency(getSelectedVariant()?.salePrice, { currency: "VND" })}
                          </p>
                          <span className="bg-green-500 text-white text-xs font-bold p-1 rounded-full">-90%</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-xl font-bold uppercase text-white">
                        {fCurrency(getSelectedVariant()?.retailPrice, { currency: "VND" })}
                      </p>
                    )}
                  </div>

                  <Button
                    className="w-full gap-2 bg-gradient-to-r from-[#f0b46a] to-[#fce08f] text-[#5a4323] font-bold"
                    onClick={onAddToCart}
                  >
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
                  <Link href="#" className="text-white text-sm font-semibold flex items-center gap-2">
                    Xem 7 lựa chọn khác giá từ 30.000 đ <ArrowDownRight className="size-4" />
                  </Link>
                </div>
              </div>
              <Advantages />
              <SafeCheckout />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
