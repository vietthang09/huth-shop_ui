"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import ProductCard from "@/components/store/common/ProductCard";
import { getTopSellingProducts, TopSellingProduct } from "@/actions/product/topSelling";

export const TopSellingCards = () => {
  const [products, setProducts] = useState<TopSellingProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopSelling = async () => {
      setIsLoading(true);
      try {
        // Get top selling products from the database
        const topSellingProducts = await getTopSellingProducts({ limit: 10 });
        if (topSellingProducts && topSellingProducts.length > 0) {
          setProducts(topSellingProducts);
        }
      } catch (error) {
        console.error("Error fetching top selling products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopSelling();
  }, []);

  // Don't render anything if loading or no products
  if (isLoading || products.length === 0) {
    return null;
  }

  return (
    <div className="w-full mt-14">
      <div className="flex w-full justify-between items-center mb-7">
        <h2 className="text-2xl font-medium text-gray-700">Sản phẩm bán chạy</h2>
        <Link
          href={"/list?topSelling=true"}
          className="font-medium bg-[position:right_center] hover:pr-5 pr-6 text-gray-700 bg-[url('/icons/arrowIcon02.svg')] bg-no-repeat bg-right-center transition-all duration-300 ease-out"
        >
          Xem tất cả
        </Link>
      </div>
      <div className="grid grid-cols-10 gap-4">
        {products.map((product) => (
          <ProductCard
            id={product.slug || product.id.toString()}
            key={product.slug || product.id.toString()}
            className="col-span-10 lg:col-span-2"
            name={product.title}
            price={product.retailPrice}
            dealPrice={product.salePrice}
            imgUrl={product.image || ""}
            cardColor={product.cardColor}
          />
        ))}
      </div>
    </div>
  );
};
