import ProductCard from "../../common/productCard";
import { mockProducts } from "../data";

export default function RecentlyVisit() {
  return (
    <div className="h-full space-y-2">
      <div className="w-full relative">
        <h2 className="text-center text-2xl text-gray-800 font-medium">Đã xem gần đây</h2>
        <button className="absolute right-0 top-0 bottom-0 text-xs text-gray-800 underline cursor-pointer">
          Xóa lịch sử
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {mockProducts.slice(0, 3).map((product, index) => (
          <div
            key={product.id}
            className="group opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards]"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="transform transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-y-1">
              <ProductCard
                className="w-full h-full shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 ring-1 ring-gray-200/30 hover:ring-blue-300/50"
                id={product.sku}
                name={product.title}
                price={+product.properties[0].retailPrice}
                dealPrice={+(product.properties?.[0]?.salePrice ?? 0)}
                imgUrl={product.image || ""}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
