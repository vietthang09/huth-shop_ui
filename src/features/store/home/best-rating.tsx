"use client";

import { useEffect, useState } from "react";

import { ProductSortBy } from "@/common/contants";
import ProductCard from "@/components/store/common/ProductCard";
import { findAll, TProduct } from "@/services/product";

export default function BestRating() {
  const [products, setProducts] = useState<TProduct[]>([]);

  useEffect(() => {
    const fetchBestSeller = async () => {
      const res = await findAll({
        limit: 12,
        sortBy: ProductSortBy.CREATED_AT,
      });
      if (res.status === 200) {
        setProducts(res.data.data);
      }
    };

    fetchBestSeller();
  }, []);

  return (
    <div className="grid grid-cols-3 gap-2">
      {products.map((product) => (
        <ProductCard key={product.sku} product={product} />
      ))}
    </div>
  );
}
