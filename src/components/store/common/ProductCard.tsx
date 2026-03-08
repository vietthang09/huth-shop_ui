import { Product, ProductVariant } from "@/services/type";
import { fCurrency } from "@/shared/utils/format-number";
import { useCartStore } from "@/store/cartStore";
import { Check, ChevronsDown, ChevronsUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, CircularProgress, cn } from "@heroui/react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import { findOne } from "@/services/product";

type ProductCardProps = {
  product: Product;
};

const VARIANT_TYPE_LABEL: Record<string, string> = {
  ownership_upgrade: "Nâng cấp chính chủ",
  pre_made_account: "Tài khoản tạo sẵn",
  sharing: "Family, Slot",
};

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { addToCart } = useCartStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const onToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isLoadingProductDetails, setIsLoadingProductDetails] = useState<boolean>(false);
  const [productDetails, setProductDetails] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>();
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Map<string, string>>(new Map());
  const cheapestVariant = product.variants.reduce((prev, curr) => {
    return prev.retailPrice < curr.retailPrice ? prev : curr;
  });

  const shortDescription = product.shortDescription?.split("|") || "";

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setIsLoadingProductDetails(true);
        const res = await findOne(product.id);
        setProductDetails(res.data);
        setSelectedVariant(res.data.variants[0]);
        setFieldValues({});
        setErrors(new Map());
      } catch (error) {
        console.error("Failed to fetch product details:", error);
      } finally {
        setIsLoadingProductDetails(false);
      }
    };
    if (isOpen) {
      fetchProductDetails();
    }
  }, [isOpen]);

  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setFieldValues({});
    setErrors(new Map());
  };

  const handleCheckout = (onClose: () => void) => {
    if (!selectedVariant) return;

    const nextErrors = new Map<string, string>();
    const payload: Record<string, string> = {};

    selectedVariant.fields?.forEach((field) => {
      const value = fieldValues[field.label]?.trim() || "";
      if (field.required && !value) {
        nextErrors.set(field.label, `${field.label} là bắt buộc`);
        return;
      }
      if (value) {
        payload[field.label] = value;
      }
    });

    if (nextErrors.size > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors(new Map());
    addToCart(productDetails ?? product, selectedVariant.id, payload);
    onClose();
    router.push("/thanh-toan");
  };

  const variants = productDetails?.variants ?? product.variants;

  return (
    <div>
      <Link href={`/san-pham/${product.sku}`}>
        <div className="relative rounded-xl overflow-hidden shadow-md bg-white flex flex-col items-center justify-center gap-4 hover:shadow-xl transition-shadow duration-300">
          <img src={product.images[0]} alt="Product Image" width={240} height={240} className="h-28 w-auto" />
          <div className="relative py-4 bg-[#ef534f] w-full text-white text-center">
            <p className="text-2xl font-bold">{fCurrency(cheapestVariant.retailPrice)}</p>
            <p className="text-white/80">{cheapestVariant.title}</p>
            <Image
              src="/images/radian.svg"
              alt="Radian"
              width={324}
              height={9}
              className="absolute top-0 -translate-y-2"
            />
          </div>
          {/* {isSales && (
            <div className="absolute bg-[#4bca5933] top-0 right-0 text-sm text-[#4bca59] font-bold p-1 rounded-bl-xl">
              💥Big Sale!
            </div>
          )} */}
        </div>
      </Link>

      <div className="mt-2 bg-gradient-to-b from-[#fdefee] to-white/0 p-4 rounded-t-xl">
        <ul className="text-sm text-[#ef534f] space-y-1" onClick={onToggleExpand}>
          {shortDescription.length > 3 &&
            shortDescription.slice(0, 3).map((line, index) => (
              <li key={index} className={`flex items-start gap-1`}>
                <Check size={16} className="min-w-4 h-4" />{" "}
                <span className={`${!isExpanded && "line-clamp-1"}`}>{line}</span>
              </li>
            ))}
          {shortDescription.length > 3 &&
            isExpanded &&
            shortDescription.slice(3).map((line, index) => (
              <li key={index} className="flex items-start gap-1">
                <Check size={16} className="min-w-4 h-4" />
                <span>{line}</span>
              </li>
            ))}
        </ul>

        {isExpanded ? (
          <ChevronsUp className="text-[#ef534f] mx-auto" onClick={onToggleExpand} />
        ) : (
          <ChevronsDown className="text-[#ef534f] mx-auto" onClick={onToggleExpand} />
        )}

        <Button color="primary" fullWidth onPress={onOpen}>
          Mua ngay
        </Button>

        <div className="text-center mt-4">
          <Link href={`/san-pham/${product.sku}`} className="font-bold underline text-sm">
            Xem chi tiết
          </Link>
        </div>
      </div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              {isLoadingProductDetails ? (
                <div className="min-h-96 flex justify-center items-center">
                  <CircularProgress aria-label="Loading..." size="lg" color="primary" />
                </div>
              ) : (
                <>
                  <ModalHeader className="flex gap-4">
                    <div className="h-20 w-20 bg-white shadow-xl rounded-xl flex items-center justify-center">
                      <img src={product.images[0]} alt={product.title} width={240} />
                    </div>
                    <p className="text-2xl font-bold text-primary">{fCurrency(selectedVariant?.retailPrice)}</p>
                  </ModalHeader>
                  <ModalBody className="border-t border-gray-200">
                    <h3>Chọn gói</h3>
                    <div className="flex gap-2">
                      {variants.map((variant) => (
                        <div
                          key={variant.id}
                          className="flex items-center gap-6"
                          onClick={() => handleVariantSelect(variant)}
                        >
                          <div
                            className={cn(
                              "rounded-xl p-1 border-2 cursor-pointer bg-gray-50",
                              selectedVariant?.id === variant.id ? "border-[#ef534f]" : "border-200/50",
                            )}
                          >
                            <div className="text-center text-lg font-semibold bg-white text-[#ef534f] rounded-lg px-4 py-2 text-nowrap">
                              {variant.title}
                            </div>
                            <span className="text-center w-full text-sm p-2 text-nowrap">
                              {VARIANT_TYPE_LABEL[variant.kind]}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {selectedVariant?.fields && selectedVariant.fields.length > 0 && (
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
                                value={fieldValues[field.label] || ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setFieldValues((prev) => ({ ...prev, [field.label]: value }));
                                  if (errors.has(field.label)) {
                                    setErrors((prev) => {
                                      const next = new Map(prev);
                                      next.delete(field.label);
                                      return next;
                                    });
                                  }
                                }}
                              />
                              {errors.has(field.label) && (
                                <p className="text-red-500 text-sm mt-1">{errors.get(field.label)}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </ModalBody>
                  <ModalFooter className="border-t border-gray-200">
                    <Button color="default" fullWidth variant="bordered" onPress={onClose}>
                      Hủy
                    </Button>
                    <Button color="primary" fullWidth onPress={() => handleCheckout(onClose)}>
                      Thanh toán
                    </Button>
                  </ModalFooter>
                </>
              )}
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
