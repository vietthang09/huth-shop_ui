"use client";

import { useEffect, useState } from "react";

import { findAllByCategory, TProduct } from "@/services/product";

import ProductCard from "../../common/ProductCard";

export default function Entertainment() {
  const [products, setProducts] = useState<TProduct[]>([]);

  const fetchEntertainmentProducts = async () => {
    const res = await findAllByCategory("giai-tri");
    if (res.status === 200) {
      setProducts(res.data.data);
    }
  };

  useEffect(() => {
    fetchEntertainmentProducts();
  }, []);

  return (
    <div className="h-full">
      <h2 className="text-center text-3xl lg:text-4xl font-bold mb-2 tracking-tight">Giải trí.</h2>
      <p className="text-center text-gray-600 mb-8 text-sm lg:text-base">
        Khám phá các sản phẩm giải trí hàng đầu, từ phim ảnh đến trò chơi điện tử, mang đến trải nghiệm giải trí tuyệt
        vời nhất.
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
