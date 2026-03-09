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

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="3xl">
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
                    <div>
                      <p className="text-2xl font-bold text-primary">{fCurrency(selectedVariant?.retailPrice)}</p>
                      <p>
                        {product.title} - {selectedVariant?.title}
                      </p>
                    </div>
                  </ModalHeader>
                  <ModalBody className="border-t border-gray-200">
                    <h3 className="font-semibold">Tính năng</h3>
                    <ul className="list-disc list-inside mb-4">
                      {productDetails?.shortDescription.split("|").map((feature, index) => (
                        <li key={index} className="flex items-center gap-1">
                          <Check size={16} /> {feature.trim()}
                        </li>
                      ))}
                    </ul>
                    <h3 className="font-semibold">Chọn gói</h3>
                    <div className="grid grid-cols-4 gap-4 mt-2">
                      {variants
                        .sort((a, b) => a.retailPrice - b.retailPrice)
                        .map((variant) => (
                          <div
                            key={variant.id}
                            className={cn(
                              "flex items-center gap-6 rounded-3xl",
                              selectedVariant?.id === variant.id ? "bg-primary" : "bg-gray-200",
                            )}
                            onClick={() => handleVariantSelect(variant)}
                          >
                            <div
                              className={cn(
                                "w-full rounded-2xl border-2 cursor-pointer",
                                selectedVariant?.id === variant.id
                                  ? "border-primary bg-primary"
                                  : "border-white bg-gray-200",
                              )}
                            >
                              <div
                                className={cn(
                                  "text-center text-lg font-semibold bg-gray-100 text-[#ef534f] rounded-2xl px-4 py-4 text-nowrap",
                                  selectedVariant?.id === variant.id ? "text-primary" : "text-neutral-800",
                                )}
                              >
                                {variant.title}
                              </div>
                              <p
                                className={cn(
                                  "text-center w-full text-sm py-1 text-nowrap",
                                  selectedVariant?.id === variant.id ? "text-white" : "text-gray-500",
                                )}
                              >
                                {VARIANT_TYPE_LABEL[variant.kind]}
                              </p>
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
                    <Button color="default" size="lg" fullWidth variant="bordered" onPress={onClose} radius="full">
                      Hủy
                    </Button>
                    <Button color="primary" size="lg" fullWidth onPress={() => handleCheckout(onClose)} radius="full">
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
