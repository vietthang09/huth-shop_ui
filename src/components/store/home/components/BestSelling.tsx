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
    <div className="bg-[#000d21]">
      <img src="https://divineshop.vn/static/7f94849d8e8cb55e5d838a5bf3f187c6.png" />
      <div className="w-full max-w-7xl mx-auto z-10">
        <h2 className="text-center text-3xl lg:text-4xl font-bold mb-2 tracking-tight text-white">
          Được mua nhiều trên HuthShop.
        </h2>
        <p className="text-center text-white mb-8 text-sm lg:text-base">Những sản phẩm được ưa chuộng nhất</p>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {products.slice(0, 5).map((product, index) => (
            <ProductCard key={product.id} product={product} className="text-white" />
          ))}
        </div>
      </div>
    </div>
  );
}
