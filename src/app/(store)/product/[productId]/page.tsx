"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { LikeIcon, MinusIcon } from "@/components/icons/svgIcons";
import Gallery from "@/components/store/productPage/gallery";
import ProductBoard from "@/components/store/productPage/productBoard";
import { SK_Box } from "@/components/UI/skeleton";
import { getOneProduct } from "@/actions/product/product";

// Define types for the product data
interface ProductPrice {
  id: number;
  net_price: number; // Changed from any to number
  retail_price: number; // Changed from any to number
  sale_price: number | null; // Changed from any to number|null
  attributeSetHash: string;
  inventory: number;
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

  if (!productId) router.push("/");

  useEffect(() => {
    const getProductFromDB = async () => {
      setLoading(true);
      try {
        const response = await getOneProduct(productId.toString());
        console.log("Product response:", response);
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
            supplier: product.supplier?.name,
            properties: prices.map((p: any) => ({
              id: p.id,
              net_price: Number(p.net_price),
              retail_price: Number(p.retail_price),
              sale_price: p.sale_price !== null ? Number(p.sale_price) : null,
              attributeSetHash: p.attributeSetHash,
              inventory: p.inventory,
            })),
            // For now these are placeholders as they're not in the API response
            path: [{ name: product.category?.name || "Category", url: "category" }],
            // You might need to create specifications based on attributes or properties
            specifications: [],
            // Add placeholder for images until you have actual image data
            images: ["/images/products/default.jpg"],
          };

          setProductInfo(formattedProduct);
        } else {
          console.error("Failed to fetch product:", response.error);
          setProductInfo(undefined);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setProductInfo(undefined);
      } finally {
        setLoading(false);
      }
    };

    getProductFromDB();
  }, [productId, router]);

  if (productInfo === undefined) return "";
  let fullPath = "";
  return (
    <div className="storeContainer">
      <div className="w-full h-auto mt-[160px] flex flex-col">
        <div className="w-full flex flex-col lg:flex-row gap-12">
          <div className="flex-grow">
            <div className="block text-gray-700 w-full mb-10 text-sm">
              {productInfo ? (
                <>
                  <Link href={"/"} className="hover:font-medium after:mx-1 after:content-['/'] hover:text-gray-800">
                    Home
                  </Link>
                  {productInfo.path?.map((item, index) => {
                    fullPath += "/" + item.url;
                    return (
                      <Link
                        key={item.url + index}
                        href={"/list" + fullPath}
                        className="after:content-['/'] last:after:content-[''] after:mx-1 hover:text-gray-800"
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </>
              ) : (
                <SK_Box width="60%" height="15px" />
              )}
            </div>
            <Gallery images={productInfo?.images} />
          </div>
          <div className="lg:w-[512px] w-full">
            {productInfo ? (
              <>
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
                    variants: productInfo.properties || [],
                  }}
                />
                {productInfo.desc && (
                  <div className="mt-6 p-4 border border-gray-200 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-700 mb-2">Mô tả sản phẩm</h3>
                    <div className="text-sm text-gray-600 product-description">{productInfo.desc}</div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col">
                <SK_Box width="60%" height="14px" />
                <div className="flex flex-col mt-10 gap-5">
                  <SK_Box width="40%" height="30px" />
                  <SK_Box width="90%" height="16px" />
                </div>
                <div className="flex flex-col gap-4 mt-10">
                  <SK_Box width="40%" height="14px" />
                  <SK_Box width="40%" height="14px" />
                  <SK_Box width="40%" height="14px" />
                </div>
                <div className="flex flex-col gap-4 mt-16">
                  <SK_Box width="30%" height="40px" />
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="w-full h-auto flex gap-12 mt-10">
          <div className="w-full flex flex-col">
            {/* ----------------- SPECIFICATION SECTION ----------------- */}
            <div className="w-full mb-[100px]">
              <h2 className="font-light block text-2xl text-gray-900 py-5 border-b border-gray-300">
                Thông số kỹ thuật
              </h2>
              {productInfo ? (
                <>
                  <section className="w-full py-5 border-b border-gray-300">
                    <div className="flex items-center w-full">
                      <button className="size-8 inline-block relative border-none bg-white rounded-sm hover:bg-gray-200">
                        <MinusIcon width={12} className="absolute top-3.5 left-2.5 stroke-gray-700" />
                      </button>
                      <h3 className="ml-3 inline-block text-gray-700">Product Information</h3>
                    </div>

                    {/* Basic Product Info */}
                    <div className="w-full pt-3 flex items-stretch bg-white text-sm rounded-lg hover:bg-gray-100">
                      <div className="min-w-[160px] flex items-start ml-[42px] text-gray-500">
                        <span>Product Name</span>
                      </div>
                      <div className="font-medium text-gray-800">
                        <span className="block leading-5 min-h-8 h-auto">{productInfo.name}</span>
                      </div>
                    </div>

                    {/* Category */}
                    {productInfo.category && (
                      <div className="w-full pt-3 flex items-stretch bg-white text-sm rounded-lg hover:bg-gray-100">
                        <div className="min-w-[160px] flex items-start ml-[42px] text-gray-500">
                          <span>Category</span>
                        </div>
                        <div className="font-medium text-gray-800">
                          <span className="block leading-5 min-h-8 h-auto">{productInfo.category}</span>
                        </div>
                      </div>
                    )}

                    {/* Supplier */}
                    {productInfo.supplier && (
                      <div className="w-full pt-3 flex items-stretch bg-white text-sm rounded-lg hover:bg-gray-100">
                        <div className="min-w-[160px] flex items-start ml-[42px] text-gray-500">
                          <span>Supplier</span>
                        </div>
                        <div className="font-medium text-gray-800">
                          <span className="block leading-5 min-h-8 h-auto">{productInfo.supplier}</span>
                        </div>
                      </div>
                    )}
                  </section>

                  {/* Product Variants/Properties */}
                  {productInfo.properties && productInfo.properties.length > 0 && (
                    <section className="w-full py-5 border-b border-gray-300">
                      <div className="flex items-center w-full">
                        <button className="size-8 inline-block relative border-none bg-white rounded-sm hover:bg-gray-200">
                          <MinusIcon width={12} className="absolute top-3.5 left-2.5 stroke-gray-700" />
                        </button>
                        <h3 className="ml-3 inline-block text-gray-700">Pricing & Inventory</h3>
                      </div>

                      {productInfo.properties.map((property, index) => (
                        <div
                          key={index}
                          className="w-full pt-3 flex items-stretch bg-white text-sm rounded-lg hover:bg-gray-100"
                        >
                          <div className="min-w-[160px] flex items-start ml-[42px] text-gray-500">
                            <span>Variant {index + 1}</span>
                          </div>
                          <div className="font-medium text-gray-800">
                            <span className="block leading-5 min-h-8 h-auto">
                              Price:{" "}
                              {property.sale_price !== null ? (
                                <>
                                  <del className="text-gray-500 mr-2">₫{property.retail_price.toLocaleString()}</del>
                                  <span className="text-red-600">₫{property.sale_price.toLocaleString()}</span>
                                </>
                              ) : (
                                <>₫{property.retail_price.toLocaleString()}</>
                              )}{" "}
                              | Stock: {property.inventory}
                            </span>
                          </div>
                        </div>
                      ))}
                    </section>
                  )}
                </>
              ) : (
                <>
                  <div className="flex flex-col mt-4 mb-16 gap-4">
                    <SK_Box width="200px" height="30px" />
                    <div className={"flex gap-5 items-center ml-10"}>
                      <SK_Box width="10%" height="20px" />
                      <SK_Box width="40%" height="16px" />
                    </div>
                    <div className={"flex gap-5 items-center ml-10"}>
                      <SK_Box width="10%" height="20px" />
                      <SK_Box width="40%" height="16px" />
                    </div>
                  </div>
                  <div className="flex flex-col mt-4 mb-16 gap-4">
                    <SK_Box width="200px" height="30px" />
                    <div className={"flex gap-5 items-center ml-10"}>
                      <SK_Box width="10%" height="20px" />
                      <SK_Box width="40%" height="16px" />
                    </div>
                    <div className={"flex gap-5 items-center ml-10"}>
                      <SK_Box width="10%" height="20px" />
                      <SK_Box width="40%" height="16px" />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ----------------- USER REVIEWS ----------------- */}
            <div className="flex flex-col w-full h-auto">
              <div className="flex justify-between items-center pb-4 border-b border-gray-300">
                <h2 className="font-light block text-2xl text-gray-900">Đánh giá của người dùng</h2>
                <button className="text-sm text-gray-900 px-6 py-1.5 rounded-md bg-gray-100 border border-gray-700 hover:bg-gray-200 active:bg-light-300">
                  Đánh giá mới
                </button>
              </div>
              <div className="flex flex-col w-full">
                <div className="flex items-center flex-wrap w-full mt-5 text-sm">
                  <div className="flex h-8 items-center text-gray-800 font-medium">
                    <Image
                      src={"/images/images/defaultUser.png"}
                      className="rounded-full overflow-hidden mr-3"
                      alt=""
                      width={32}
                      height={32}
                    />
                    <span>T. Mihai</span>
                  </div>
                  <span className="text-[#f97a1f] ml-8 font-medium">Mua hàng đã xác minh</span>
                  <div>
                    <div className="inline-block ml-8 pl-6 bg-[url('/icons/dateIcon.svg')] bg-no-repeat bg-[position:left_center]">
                      30 November 2023
                    </div>
                    <div className="ml-10 inline-block">
                      <button className="h-8 mr-3 font-medium px-3 bg-white border border-white rounded-md text-gray-900 hover:border-green-600 hover:bg-green-800 hover:[&>svg]:fill-green-700 active:border-green-500 active:[&>svg]:fill-green-600">
                        <LikeIcon width={16} className="fill-white stroke-gray-1000 mr-2" />0
                      </button>
                      <button className="h-8 mr-3 font-medium px-3 bg-white border border-white rounded-md text-gray-900 hover:border-red-700 hover:bg-[rgba(220,38,38,0.4)] hover:[&>svg]:fill-red-800 active:border-red-500 active:[&>svg]:fill-red-700 [&>svg]:inline-block [&>svg]:[-scale-x-100] [&>svg]:rotate-180 [&>svg]:-translate-y-[3px]">
                        <LikeIcon width={16} className="fill-white stroke-gray-1000 mr-2" /> 0
                      </button>
                    </div>
                  </div>
                </div>
                <div className="my-4 ml-12 text-sm leading-5 text-gray-900">
                  <span>
                    {`Lorem ipsum dolor sit amet consectetur adipisicing elit. 
                    Temporibus suscipit debitis reiciendis repellendus! Repellat rem beatae quo quis 
                    tenetur. Culpa quae ratione delectus id odit in nesciunt saepe pariatur vitae.`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
