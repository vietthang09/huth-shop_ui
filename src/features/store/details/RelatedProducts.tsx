"use client";

import ProductCard from "@/components/store/common/ProductCard";
import { findAllByCategory, TProduct } from "@/services/product";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface RelatedProductsProps {
  categorySlug: string;
}
export default function RelatedProducts({ categorySlug }: RelatedProductsProps) {
  const [products, setProducts] = useState<TProduct[]>();

  useEffect(() => {
    const fetchProducts = async () => {
      const result = await findAllByCategory(categorySlug);
      if (result.status === 200) {
        const data = result.data.data;
        setProducts(data);
      } else {
        toast.error("Có lỗi khi lấy danh sách sản phẩm liên quan");
      }
    };

    fetchProducts();
  }, [categorySlug]);

  if (!products) return;

  return (
    <div className="grid grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.sku} product={product} direction="vertical" />
      ))}
    </div>
  );
}
