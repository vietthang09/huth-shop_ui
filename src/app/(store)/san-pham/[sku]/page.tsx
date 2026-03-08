"use client";

import { useAuth } from "@/hooks/useAuth";
import { findOneBySku } from "@/services/product";
import { Product, ProductVariant, ProductVariantKind } from "@/services/type";
import { fCurrency } from "@/shared/utils/format-number";
import { cn } from "@/shared/utils/styling";
import { useCartStore } from "@/store/cartStore";
import { Check, SquareCheckBig } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import parse from "html-react-parser";
import { toast } from "sonner";
import { CircularProgress } from "@heroui/react";

const VARIANT_TYPE_LABEL: Record<string, string> = {
  ownership_upgrade: "Nâng cấp chính chủ",
  pre_made_account: "Tài khoản tạo sẵn",
  sharing: "Family, Slot",
};

export default function ProductPage() {
  const { sku } = useParams();
  const router = useRouter();
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState<Product>();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>();
  const [errors, setErrors] = useState<Map<string, string>>(new Map());
  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;
    if (!isAuthenticated) {
      router.push("/dang-nhap");
      return;
    }
    let fields: Record<string, any> = {};
    if (selectedVariant.fields && selectedVariant.fields.length > 0) {
      const newErrors = new Map<string, string>();
      selectedVariant.fields.forEach((field) => {
        const inputElement = document.querySelector(`input[data-label="${field.label}"]`) as HTMLInputElement;
        const value = inputElement ? inputElement.value : undefined;
        if (field.required && !value) {
          newErrors.set(field.label, `${field.label} là bắt buộc`);
        }
        if (value !== undefined) {
          fields[field.label] = value;
        }
      });
      setErrors(newErrors);
      if (newErrors.size > 0) {
        return;
      }
    }
    addToCart(product, selectedVariant?.id, fields);
    toast.success("Đã thêm vào giỏ hàng");
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!sku) return;
      const res = await findOneBySku(sku as string);
      setProduct(res.data);
      setSelectedVariant(res.data.variants[0]);
    };

    fetchProduct();
  }, [sku]);

  if (!product || !selectedVariant) {
    return (
      <div className="min-h-96 flex justify-center items-center">
        <CircularProgress aria-label="Loading..." size="lg" color="primary" />
      </div>
    );
  }

  return (
    <div className="py-20 max-w-7xl mx-auto">
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <div>
            <div className="flex gap-4">
              <div className="h-40 w-40 bg-white shadow-xl rounded-xl flex items-center justify-center">
                <img src={product.images[0]} alt={product.title} width={240} />
              </div>
              <div>
                <h1 className="font-bold text-2xl">{product.title}</h1>

                <h2 className="mt-8 mb-3 font-bold">Chọn gói</h2>

                <div className="flex gap-2">
                  {product.variants.map((variant) => (
                    <div className="flex items-center gap-6" onClick={() => setSelectedVariant(variant)}>
                      <div
                        className={cn(
                          "rounded-xl p-1 cursor-pointer",
                          selectedVariant.id === variant.id ? "bg-[#ef534f]" : "bg-gray-200/50",
                        )}
                      >
                        <div className="text-center text-lg font-semibold bg-white text-[#ef534f] rounded-lg px-4 py-2">
                          {variant.title}
                        </div>
                        <span className="text-white text-center w-full text-sm p-2">
                          {VARIANT_TYPE_LABEL[variant.kind]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <ul className="mt-8 text-sm flex items-center gap-6">
                  {product.shortDescription?.split("|").map((item, index) => (
                    <li key={index} className="flex items-center gap-1">
                      <Check size={16} /> {item.trim()}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-1">
          {selectedVariant.fields && selectedVariant.fields.length > 0 && (
            <div className="p-8 rounded-xl shadow mb-4">
              <h2 className="text-lg font-bold mb-4">Thông tin tài khoản</h2>
              <div className="space-y-4">
                {selectedVariant.fields.map((field, index) => (
                  <div key={index}>
                    <label className="block font-medium mb-1">{field.label}</label>
                    <input
                      type={field.type || "text"}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ef534f]"
                      required={field.required}
                      data-label={field.label}
                    />
                    {errors.has(field.label) && <p className="text-red-500 text-sm mt-1">{errors.get(field.label)}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="p-8 rounded-xl shadow">
            <table className="w-full">
              <tbody>
                <tr className="text-lg text-black">
                  <td className="">Giá bán:</td>
                  <td className="text-right font-bold">{fCurrency(selectedVariant.retailPrice)}</td>
                </tr>
                <tr className="text-black/60">
                  <td className="py-2">Giảm giá:</td>
                  <td className="text-right font-bold">{fCurrency(0)}</td>
                </tr>
                <tr className="font-bold text-black">
                  <td className="py-2">Tổng cộng:</td>
                  <td className="text-2xl text-right font-bold text-[#ef534f]">
                    {fCurrency(selectedVariant.retailPrice)}
                  </td>
                </tr>
              </tbody>
            </table>
            <hr className="border-gray-200 my-4" />
            <button
              className="bg-[#ef534f] text-white font-bold rounded-full px-4 py-3 w-full cursor-pointer hover:bg-[#d9433f] transition-colors duration-300"
              onClick={handleAddToCart}
            >
              Thêm vào giỏ hàng
            </button>
          </div>
        </div>

        <div className="col-span-2">{parse(product.description)}</div>
        <div className="col-span-1">
          <div>
            <h2 className="text-xl font-bold">Hướng dẫn mua hàng</h2>
            <ul className="mt-4 text-sm font-medium space-y-4">
              <li className="bg-[#fcf8f7] min-h-20 py-4 px-8 rounded-xl flex items-center gap-4">
                <SquareCheckBig size={24} className="min-w-6 text-[#ef534f]" />
                <p>Tìm kiếm sản phẩm bạn muốn mua bằng thanh tìm kiếm hoặc duyệt qua các danh mục.</p>
              </li>
              <li className="bg-[#fcf8f7] min-h-20 py-4 px-8 rounded-xl flex items-center gap-4">
                <SquareCheckBig size={24} className="min-w-6 text-[#ef534f]" />
                <p>Thêm sản phẩm vào giỏ hàng của bạn.</p>
              </li>
              <li className="bg-[#fcf8f7] min-h-20 py-4 px-8 rounded-xl flex items-center gap-4">
                <SquareCheckBig size={24} className="min-w-6 text-[#ef534f]" />
                <p>Thanh toán.</p>
              </li>
              <li className="bg-[#fcf8f7] min-h-20 py-4 px-8 rounded-xl flex items-center gap-4">
                <SquareCheckBig size={24} className="min-w-6 text-[#ef534f]" />
                <p>Chờ hệ thống xử lý đơn hàng.</p>
              </li>
              <li className="bg-[#fcf8f7] min-h-20 py-4 px-8 rounded-xl flex items-center gap-4">
                <SquareCheckBig size={24} className="min-w-6 text-[#ef534f]" />
                <p>Đăng nhập tài khoản và tận hưởng dịch vụ.</p>
              </li>
            </ul>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold">Sản phẩm liên quan</h2>
            <div className="grid grid-cols-3 gap-4 mt-8">
              <Link href="/san-pham/youtube-premium">
                <div className="h-full p-2 rounded-xl overflow-hidden shadow-md bg-white flex flex-col items-center justify-center gap-4 hover:shadow-xl transition-shadow duration-300">
                  <Image
                    src="https://static.gamsgocdn.com/image/395063e196c5068d11e6d587f8876cf8.webp"
                    alt="Product Image"
                    width={240}
                    height={240}
                  />
                </div>
                <div className="mt-2 text-[#ef534f] w-full text-center">
                  <p className="font-bold">
                    {fCurrency(59000)}
                    <span className="text-xs text-black">/ 6 tháng</span>
                  </p>
                </div>
              </Link>
              <Link href="/san-pham/youtube-premium">
                <div className="h-full p-2 rounded-xl overflow-hidden shadow-md bg-white flex flex-col items-center justify-center gap-4 hover:shadow-xl transition-shadow duration-300">
                  <Image
                    src="https://static.gamsgocdn.com/image/395063e196c5068d11e6d587f8876cf8.webp"
                    alt="Product Image"
                    width={240}
                    height={240}
                  />
                </div>
                <div className="mt-2 text-[#ef534f] w-full text-center">
                  <p className="font-bold">
                    {fCurrency(59000)}
                    <span className="text-xs text-black">/ 6 tháng</span>
                  </p>
                </div>
              </Link>
              <Link href="/san-pham/youtube-premium">
                <div className="h-full p-2 rounded-xl overflow-hidden shadow-md bg-white flex flex-col items-center justify-center gap-4 hover:shadow-xl transition-shadow duration-300">
                  <Image
                    src="https://static.gamsgocdn.com/image/395063e196c5068d11e6d587f8876cf8.webp"
                    alt="Product Image"
                    width={240}
                    height={240}
                  />
                </div>
                <div className="mt-2 text-[#ef534f] w-full text-center">
                  <p className="font-bold">
                    {fCurrency(59000)}
                    <span className="text-xs text-black">/ 6 tháng</span>
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
