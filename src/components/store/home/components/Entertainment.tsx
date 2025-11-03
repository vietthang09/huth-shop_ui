"use client";

import { useEffect, useRef, useState } from "react";
import ProductCard from "../../common/ProductCard";
import { findAllByCategory, TProduct } from "@/services/product";
import Link from "next/link";

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

      <div className="relative h-[50vh] overflow-hidden rounded-xl">
        <img
          className="z-0 absolute inset-0 h-full w-full object-cover rounded-xl shadow-xl brightness-50"
          src="https://mir-s3-cdn-cf.behance.net/project_modules/fs/736dee100650681.5f0da29e3cce4.jpg"
        />
        <div className="absolute top-0 bottom-0 left-0 z-10 bg-gradient-to-tr from-red-500/20 to-black/10 w-96 flex flex-col items-center justify-center p-8 gap-6">
          <img
            className="size-24"
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Netflix_icon.svg/2048px-Netflix_icon.svg.png"
          />
          <Link href="#" className="bg-black text-white font-semibold p-2 rounded text-center">
            Mua tài khoản Netflix
          </Link>
          <p className="text-white text-xs text-justify">
            Money Heist (tên tiếng Việt là Phi vụ triệu đô) là một series phim trộm cướp của Tây Ban Nha, xoay quanh một
            nhóm tội phạm do một thiên tài bí ẩn tên là Giáo sư cầm đầu, lên kế hoạch thực hiện những vụ cướp táo bạo.
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-5 gap-4">
        {products?.map((product, index) => (
          <div key={product.id}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
