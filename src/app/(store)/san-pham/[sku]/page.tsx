"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import parse from "html-react-parser";
import { SK_Box } from "@/components/UI/skeleton";
import { entertainmentProducts, mockProducts } from "@/components/store/home/data";
import Image from "next/image";
import { ChevronRight, ShoppingCart, MessageCircle, Shield, Clock, Mail, Star } from "lucide-react";
import { fCurrency } from "@/shared/utils/format-number";
import ProductCard from "@/components/store/common/productCard";
import { useRecentlyVisited } from "@/hooks/useRecentlyVisited";
import { useCartStore } from "@/store/cartStore";

// Enhanced types
interface ProductProperty {
  id: number;
  retailPrice: number;
  salePrice?: number | null;
  attributeSet: {
    value: string;
  };
}

interface Product {
  id: number;
  sku: string;
  title: string;
  description: string;
  image: string;
  cardColor?: string;
  properties: ProductProperty[];
  category: {
    name: string;
    slug: string;
  };
}

const ProductPage = () => {
  const router = useRouter();
  const { sku } = useParams<{ sku: string }>();
  const { addProduct } = useRecentlyVisited();
  // State management
  const [productInfo, setProductInfo] = useState<Product | null>(null);
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
          setProductInfo(null); // Product not found
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-8" aria-label="Breadcrumb">
          <div className="flex items-center text-sm text-gray-600 space-x-2">
            <Link href="/" className="hover:text-blue-600 transition-colors font-medium">
              Trang chủ
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link
              href={`/danh-muc/${productInfo.category.slug}`}
              className="hover:text-blue-600 transition-colors font-medium"
            >
              {productInfo.category.name}
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-semibold truncate max-w-xs">{productInfo.title}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Details - Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <ProductDetails product={productInfo} />
            <ProductOptions
              product={productInfo}
              selectedVariant={selectedVariant}
              onVariantSelect={setSelectedVariant}
            />
          </div>

          {/* Purchase Section - Right Column */}
          <div className="lg:col-span-1">
            <PurchaseSection
              product={productInfo}
              selectedVariant={selectedVariant}
              quantity={quantity}
              onQuantityChange={handleQuantityChange}
              getSelectedVariantPrice={getSelectedVariantPrice}
              totalPrice={totalPrice}
            />
            <SellerInfo />
          </div>
        </div>

        {/* Related Products */}
        <RelatedProducts />
      </div>
    </div>
  );
};

// Component for product details
const ProductDetails = ({ product }: { product: Product }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
    <h1 className="text-3xl font-bold text-gray-900 mb-6">{product.title}</h1>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div className="flex items-center gap-3">
        <Clock className="w-5 h-5 text-blue-600" />
        <div>
          <span className="text-sm text-gray-600">Tốc độ giao hàng:</span>
          <p className="font-semibold text-gray-900">10 phút (54.79%)</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Mail className="w-5 h-5 text-green-600" />
        <div>
          <span className="text-sm text-gray-600">Hình thức giao hàng:</span>
          <p className="font-semibold text-gray-900">Tin nhắn/Email</p>
        </div>
      </div>
    </div>

    <div className="flex items-center gap-3 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
      <Shield className="w-5 h-5 text-blue-600" />
      <div>
        <span className="text-sm text-gray-600">Chế độ bảo hành:</span>
        <p className="font-semibold text-gray-900">1 đổi 1 nếu có lỗi trong suốt thời gian sử dụng</p>
      </div>
    </div>

    <div className="prose prose-sm max-w-none text-gray-700">{parse(product.description)}</div>
  </div>
);

// Component for product options
const ProductOptions = ({
  product,
  selectedVariant,
  onVariantSelect,
}: {
  product: Product;
  selectedVariant: number | null;
  onVariantSelect: (id: number) => void;
}) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
    <h2 className="text-xl font-semibold text-gray-900 mb-4">
      Các tùy chọn
      {selectedVariant && (
        <span className="text-sm text-gray-600 ml-2 font-normal">
          (Đã chọn: {product.properties?.find((p) => p.id === selectedVariant)?.attributeSet?.value})
        </span>
      )}
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {product.properties?.map((property) => (
        <div
          key={property.id}
          onClick={() => onVariantSelect(property.id)}
          className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${selectedVariant === property.id
            ? "border-blue-500 bg-blue-50 shadow-sm"
            : "border-gray-200 bg-white hover:border-gray-300"
            }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-2">{`${product.title} - ${property.attributeSet.value}`}</h3>
              <div className="text-lg font-bold text-red-600">
                {fCurrency(property.retailPrice, { currency: "VND" })}
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-green-500 fill-current" />
                  <span className="font-semibold text-green-600">100.00%</span>
                </div>
                <span className="text-gray-500">|</span>
                <span className="text-gray-600">Đã bán 3,083</span>
              </div>
            </div>
            <ChevronRight
              className={`w-5 h-5 transition-all duration-200 ${selectedVariant === property.id ? "text-blue-600 rotate-90" : "text-gray-400"
                }`}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Component for purchase section
const PurchaseSection = ({
  product,
  selectedVariant,
  quantity,
  onQuantityChange,
  getSelectedVariantPrice,
  totalPrice,
}: {
  product: Product;
  selectedVariant: number | null;
  quantity: number;
  onQuantityChange: (isReducing: boolean) => void;
  getSelectedVariantPrice: () => number;
  totalPrice: number;
}) => {
  const { addToCart } = useCartStore();
  return <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 sticky top-8">
    <div className="text-center mb-6">
      <Image
        height={200}
        width={200}
        className="w-full h-auto object-contain rounded-lg mx-auto"
        unoptimized
        src={product.image}
        alt={product.title}
      />
    </div>

    <div className="space-y-6">
      {/* Quantity Selector */}
      <div className="flex items-center justify-center gap-4">
        <button
          className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center font-semibold"
          onClick={() => onQuantityChange(true)}
          disabled={quantity <= 1}
        >
          −
        </button>
        <span className="text-xl font-semibold min-w-[2rem] text-center">{quantity}</span>
        <button
          className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center font-semibold"
          onClick={() => onQuantityChange(false)}
        >
          +
        </button>
      </div>

      {/* Total Price */}
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-1">Tổng tiền:</p>
        <p className="text-3xl font-bold text-red-600">
          {selectedVariant ? fCurrency(totalPrice, { currency: "VND" }) : "Chọn tùy chọn"}
        </p>
      </div>

      {/* Purchase Button */}
      <button
        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        onClick={() => {
          window.open("https://www.facebook.com/profile.php?id=61577923558579", "_blank");
        }}
      >
        <ShoppingCart className="w-5 h-5" />
        Mua ngay
      </button>
      <button onClick={() => {
        addToCart({ id: '1', name: 'Example Item', price: 10.99 })
      }}>Thêm vào giỏ hàng</button>
    </div>
  </div>
}

// Component for seller info
const SellerInfo = () => (
  <div className="mt-6 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">VT</span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Việt Thắng</h3>
          <p className="text-sm text-gray-500">Hỗ trợ viên</p>
        </div>
      </div>
    </div>

    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-green-500 fill-current" />
          <span className="font-semibold text-green-600">100.00%</span>
        </div>
        <span className="text-gray-500">|</span>
        <span className="text-gray-600">Đã bán 3,083</span>
      </div>
    </div>

    <button
      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
      onClick={() => {
        window.open("https://www.facebook.com/hi.vietthang/", "_blank");
      }}
    >
      <MessageCircle className="w-5 h-5" />
      Nhắn tin
    </button>
  </div>
);

// Component for related products
const RelatedProducts = () => (
  <div className="mt-12">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Sản phẩm liên quan</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {entertainmentProducts.map((product, index) => (
        <div
          key={product.id}
          className="group opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards]"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="transform transition-all duration-300 hover:-translate-y-2">
            <ProductCard
              className="w-full h-full bg-white rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 hover:border-blue-200"
              id={product.sku}
              sku={product.sku}
              name={product.title}
              price={product.lowestPrice}
              dealPrice={product.lowestPrice}
              imgUrl={product.image}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default ProductPage;
