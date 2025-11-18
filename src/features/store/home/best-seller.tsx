"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { SortOrder } from "@/common/contants";
import ProductCard from "@/components/store/common/ProductCard";
import { Carousel } from "@/components/ui";
import { findAll, TProduct } from "@/services/product";

export default function BestSeller() {
  const [products, setProducts] = useState<TProduct[]>([]);

  useEffect(() => {
    const fetchBestSeller = async () => {
      const res = await findAll({
        limit: 12,
        order: SortOrder.DESC,
      });
      if (res.status === 200) {
        setProducts(res.data.data);
      }
    };

    fetchBestSeller();
  }, []);

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-9">
        <Carousel slidesToShow={4} slidesToScroll={2} autoPlay={true} showDots={true} showArrows={true} gap={24}>
          {products.map((product) => (
            <ProductCard key={product.sku} product={product} tag="best" direction="vertical" />
          ))}
        </Carousel>
      </div>

      <div className="col-span-3">
        <Image
          src="https://cdn.k4g.com/files/homepage_promo/fee01e73808f859daaf5ab0e537addef.jpg"
          height={100}
          width={100}
          alt="banner"
          unoptimized
          className="h-full w-full rounded-xl"
        />
      </div>
    </div>
  );
}
