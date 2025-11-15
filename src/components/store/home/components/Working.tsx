"use client";

import { useEffect, useState } from "react";

import { findAllByCategory, TProduct } from "@/services/product";

import ProductCard from "../../common/ProductCard";

export default function Working() {
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
      <h2 className="text-center text-3xl lg:text-4xl font-bold mb-2 tracking-tight">Làm việc.</h2>
      <p className="text-center text-gray-600 mb-8 text-sm lg:text-base">
        Khám phá các sản phẩm làm việc hàng đầu, từ phần mềm quản lý dự án đến công cụ giao tiếp, giúp nâng cao hiệu
        suất công việc của bạn.
      </p>
      <div className="mt-6 grid grid-cols-4 gap-4">
        {products?.map((product) => (
          <div key={product.id}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
