"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { Bot, Cloud, Computer, Globe, Music, Pen, PenLine, Phone, Play } from "lucide-react";
import { aiProducts, eduProducts, entertainmentProducts, workingProducts } from "@/components/store/home/data";
import ProductCard from "@/components/store/common/productCard";
import Link from "next/link";

interface ProductType {
  id: number;
  title: string;
  sku: string;
  image?: string | null;
  cardColor?: string | null;
  properties: Array<{
    retailPrice: number | any; // Using any to handle Prisma Decimal type
    salePrice?: number | null | any; // Using any to handle Prisma Decimal type
  }>;
  isAvailable?: boolean;
  supplier?: { name: string } | null;
  category?: { name: string; slug: string } | null;
  categoryId?: number | null;
  supplierId?: number | null;
  lowestPrice?: number; // Added for category API response
  lowestSalePrice?: number | null; // Added for category API response
}

const ListPage = () => {
  const [products, setProducts] = useState<ProductType[]>([]);

  const productMapping = new Map<string, any[]>();
  productMapping.set("giai-tri", entertainmentProducts);
  productMapping.set("cong-viec", workingProducts);
  productMapping.set("ai", aiProducts);
  productMapping.set("hoc-tap", eduProducts);

  const categoryMapping = new Map<string, string>();
  categoryMapping.set("giai-tri", "Giải trí");

  const categories = [
    {
      title: "Âm nhạc",
      icon: <Music className="size-8" />,
    },
    {
      title: "Phim ảnh",
      icon: <Play className="size-8" />,
    },
    {
      title: "Công việc",
      icon: <Computer className="size-8" />,
    },
    {
      title: "A.I",
      icon: <Bot className="size-8" />,
    },
    {
      title: "Đồ họa",
      icon: <PenLine className="size-8" />,
    },
    {
      title: "Lữu trữ",
      icon: <Cloud className="size-8" />,
    },
  ];

  const pathname = usePathname();

  useEffect(() => {
    setProducts(productMapping.get(pathname.split("/")[2]) || []);
  }, [pathname]);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="w-full hidden lg:block" aria-label="Breadcrumb">
        <div className="flex items-center text-gray-600 text-sm space-x-2">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Trang chủ
          </Link>
          <span className="text-gray-400">/</span>
          <Link href={"/danh-muc/" + pathname.split("/")[2]} className="hover:text-blue-600 transition-colors">
            {categoryMapping.get(pathname.split("/")[2]) || "Danh mục"}
          </Link>
        </div>
      </nav>

      <div className="flex overflow-x-auto gap-4">
        {categories.map((category, index) => (
          <div
            key={index}
            className="group mt-6 w-32 inline-block text-white bg-sky-600 hover:text-gray-800 hover:bg-white text-gray-900 p-6 rounded-xl text-sm font-semibold cursor-pointer"
          >
            <div className="flex justify-center group-hover:text-blue-500">{category.icon}</div>
            <p className="mt-2 text-center">{category.title}</p>
          </div>
        ))}
      </div>

      {/* Product list */}
      <div className="mt-4 grid grid-cols-4 gap-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {products.map((product, index) => (
          <div
            key={product.id}
            className="group opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards] flex-shrink-0"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="transform transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-y-1">
              <ProductCard
                className="w-full h-full shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 ring-1 ring-gray-200/30 hover:ring-blue-300/50"
                id={product.sku}
                sku={product.sku}
                name={product.title}
                price={product.lowestPrice}
                dealPrice={product.lowestSalePrice}
                imgUrl={product.image}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListPage;
