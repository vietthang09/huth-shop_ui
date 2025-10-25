"use client";

import { findAllByCategory, TProduct } from "@/services/product";
import ProductCard from "../../common/ProductCard";
import { useEffect, useState } from "react";

export default function BestSelling() {
  const [products, setProducts] = useState<TProduct[]>([]);
  const fetchWorkingProducts = async () => {
    const res = await findAllByCategory("lam-viec");
    if (res.status === 200) {
      setProducts(res.data.data);
    }
  };

  useEffect(() => {
    fetchWorkingProducts();
  }, []);
  return (
    <div className="h-full">
      <h2 className="text-center text-3xl lg:text-4xl font-bold mb-2 tracking-tight">Được mua nhiều trên HuthShop.</h2>
      <p className="text-center text-gray-600 mb-8 text-sm lg:text-base">Những sản phẩm được ưa chuộng nhất</p>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
