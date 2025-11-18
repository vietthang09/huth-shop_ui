"use client";

import { useEffect, useState } from "react";

import { ProductSortBy } from "@/common/contants";
import ProductCard from "@/components/store/common/ProductCard";
import { Carousel } from "@/components/ui";
import { findAll, TProduct } from "@/services/product";

export default function OnSale() {
  const [products, setProducts] = useState<TProduct[]>([]);

  useEffect(() => {
    const fetchBestSeller = async () => {
      const res = await findAll({
        limit: 12,
        sortBy: ProductSortBy.PRICE,
      });
      if (res.status === 200) {
        setProducts(res.data.data);
      }
    };

    fetchBestSeller();
  }, []);

  return (
    <Carousel slidesToShow={6} slidesToScroll={2} autoPlay={true} showDots={true} showArrows={true} gap={24}>
      {products.map((product) => (
        <ProductCard key={product.sku} product={product} tag="best" direction="vertical" />
      ))}
    </Carousel>
  );
}
