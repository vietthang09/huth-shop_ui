"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { LikeIcon, MinusIcon } from "@/components/icons/svgIcons";
import Gallery from "@/components/store/productPage/gallery";
import ProductBoard from "@/components/store/productPage/productBoard";
import { SK_Box } from "@/components/UI/skeleton";
import { getOneProduct, getOneProductBySku } from "@/actions/product/product";

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

interface FormattedProduct {
  id: number;
  name: string;
  price: number;
  salePrice: number | null;
  desc: string | undefined;
  isAvailable: boolean;
  category?: string;
  supplier?: string;
  properties?: ProductPrice[];
  // Additional fields from the original UI
  specialFeatures?: string[];
  richDesc?: string;
  path?: Array<{ name: string; url: string }>;
  specifications?: Array<{
    groupName: string;
    specs: Array<{ name: string; value: string }>;
  }>;
  images?: string[];
}

const ProductPage = () => {
  const router = useRouter();
  const { productId } = useParams<{ productId: string[] }>();
  const [productInfo, setProductInfo] = useState<FormattedProduct | null | undefined>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  if (!productId) router.push("/");

  useEffect(() => {
    const getProductFromDB = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getOneProductBySku(productId.toString());
        if (response.success && response.data) {
          // Structure the product data for the UI
          const product = response.data;

          // Find the best price (lowest retail or sale price)
          const prices = product.prices || [];

          // Find the lowest price (either sale price or retail price)
          let lowestPrice = 0;
          let hasSalePrice = false;

          if (prices.length > 0) {
            prices.forEach((price: any) => {
              const currentPrice = price.sale_price !== null ? price.sale_price : price.retail_price;
              if (currentPrice !== null) {
                if (lowestPrice === 0 || Number(currentPrice) < lowestPrice) {
                  lowestPrice = Number(currentPrice);
                }
                if (price.sale_price !== null) {
                  hasSalePrice = true;
                }
              }
            });
          }

          // Create a formatted product object for the UI
          const formattedProduct: FormattedProduct = {
            id: product.id,
            name: product.title,
            price: lowestPrice,
            salePrice: hasSalePrice ? lowestPrice : null,
            desc: product.description || undefined,
            isAvailable: prices.some((p: any) => p.inventory > 0),
            category: product.category?.name,
            properties: prices.map((p: any) => ({
              id: p.id,
              net_price: Number(p.net_price),
              retail_price: Number(p.retail_price),
              sale_price: p.sale_price !== null ? Number(p.sale_price) : null,
              attributeSetHash: p.attributeSetHash,
              inventory: p.inventory,
              attributeName: p.attributeName || "Default",
            })),
            // For now these are placeholders as they're not in the API response
            path: [{ name: product.category?.name || "Category", url: "category" }],
            // You might need to create specifications based on attributes or properties
            specifications: [],
            // Add placeholder for images until you have actual image data
            images: [product.image || ""],
          };

          setProductInfo(formattedProduct);
        } else {
          console.error("Failed to fetch product:", response.error);
          setError("Không thể tải thông tin sản phẩm");
          setProductInfo(undefined);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setError("Đã có lỗi xảy ra khi tải sản phẩm");
        setProductInfo(undefined);
      } finally {
        setLoading(false);
      }
    };

    getProductFromDB();
  }, [productId, router]);

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

  let fullPath = "";
  return (
    <div className="container mx-auto flex flex-col">
      {/* Breadcrumb */}
      <nav className="w-full mb-8" aria-label="Breadcrumb">
        <div className="flex items-center text-gray-600 text-sm space-x-2">
          {productInfo ? (
            <>
              <Link href="/" className="hover:text-blue-600 transition-colors">
                Trang chủ
              </Link>
              <span className="text-gray-400">/</span>
              {productInfo.path?.map((item, index) => {
                fullPath += "/" + item.url;
                return (
                  <div key={item.url + index} className="flex items-center space-x-2">
                    <Link href={"/list/" + item.name.toLowerCase()} className="hover:text-blue-600 transition-colors">
                      {item.name}
                    </Link>
                    {/* {index < productInfo.path!.length - 1 && <span className="text-gray-400">/</span>} */}
                  </div>
                );
              })}
              <span className="text-gray-400">/</span>
              <span className="text-gray-800 font-medium truncate max-w-xs">{productInfo.name}</span>
            </>
          ) : (
            <SK_Box width="60%" height="20px" />
          )}
        </div>
      </nav>

      {/* Main product section */}
      <div className="w-full flex flex-col lg:flex-row gap-8 lg:gap-12">
        <div className="flex-grow">
          <Gallery images={productInfo?.images} />
        </div>

        <div className="lg:w-[520px] w-full">
          {productInfo ? (
            <div className="space-y-6">
              <ProductBoard
                boardData={{
                  id: productInfo.id,
                  isAvailable: productInfo.isAvailable,
                  defaultQuantity: 1,
                  name: productInfo.name,
                  price: productInfo.price,
                  dealPrice: productInfo.salePrice,
                  shortDesc: productInfo.desc || "",
                  specialFeatures: [],
                  variants:
                    productInfo.properties?.map((prop) => ({
                      id: prop.id,
                      retail_price: prop.retail_price,
                      sale_price: prop.sale_price,
                      attributeSetHash: prop.attributeSetHash,
                      inventory: prop.inventory,
                      attributeName: prop.attributeName || "Default",
                    })) || [],
                }}
              />
              {productInfo.desc && (
                <div className="bg-gray-50 p-6 rounded-xl border">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                    Mô tả sản phẩm
                  </h3>
                  <div className="text-gray-700 leading-relaxed product-description">{productInfo.desc}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <SK_Box width="60%" height="24px" />
              <div className="space-y-4">
                <SK_Box width="40%" height="36px" />
                <SK_Box width="90%" height="20px" />
                <SK_Box width="70%" height="20px" />
              </div>
              <div className="space-y-3">
                <SK_Box width="40%" height="20px" />
                <SK_Box width="40%" height="20px" />
                <SK_Box width="40%" height="20px" />
              </div>
              <SK_Box width="30%" height="48px" />
            </div>
          )}
        </div>
      </div>

      {/* Specifications and Reviews */}
      <div className="w-full mt-16 space-y-16">
        {/* Specifications Section */}
        <section className="w-full">
          <div className="mb-8">
            <h2 className="text-3xl font-light text-gray-900 pb-4 border-b-2 border-gray-200 flex items-center">
              <span className="w-1 h-8 bg-blue-600 rounded-full mr-4"></span>
              Thông số kỹ thuật
            </h2>
          </div>

          {productInfo ? (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Basic Product Info */}
              <div className="border-b border-gray-100">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <MinusIcon width={16} className="mr-3 stroke-gray-600" />
                    Thông tin cơ bản
                  </h3>

                  <div className="grid gap-4">
                    <div className="flex py-3 hover:bg-gray-50 rounded-lg px-4 transition-colors">
                      <div className="w-40 text-gray-600 font-medium">Tên sản phẩm:</div>
                      <div className="text-gray-800 flex-1">{productInfo.name}</div>
                    </div>

                    {productInfo.category && (
                      <div className="flex py-3 hover:bg-gray-50 rounded-lg px-4 transition-colors">
                        <div className="w-40 text-gray-600 font-medium">Danh mục:</div>
                        <div className="text-gray-800 flex-1">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                            {productInfo.category}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex py-3 hover:bg-gray-50 rounded-lg px-4 transition-colors">
                      <div className="w-40 text-gray-600 font-medium">Tình trạng:</div>
                      <div className="text-gray-800 flex-1">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            productInfo.isAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {productInfo.isAvailable ? "Còn hàng" : "Hết hàng"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <SK_Box width="200px" height="24px" className="mb-6" />
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <SK_Box width="120px" height="20px" />
                      <SK_Box width="60%" height="20px" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProductPage;
