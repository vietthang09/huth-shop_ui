import { fCurrency } from "@/shared/utils/format-number";
import { aiProducts, eduProducts, entertainmentProducts, workingProducts } from "../data";

export default function Trending() {
  const trending = [
    {
      title: "Giải trí",
      description: "Nền tảng giải trí đỉnh cao",
      items: entertainmentProducts,
    },
    {
      title: "Làm việc",
      description: "Công cụ làm việc hiệu quả",
      items: workingProducts,
    },
    {
      title: "AI",
      description: "Hợp tác với các thương hiệu hàng đầu",
      items: aiProducts,
    },
    {
      title: "Học tập",
      description: "Nền tảng học tập trực tuyến",
      items: eduProducts,
    },
  ];
  return (
    <div className="h-full">
      <h2 className="text-center text-2xl text-gray-800 font-medium">Xu hướng</h2>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
        {trending.map((category, index) => (
          <div key={index} className="bg-white rounded-lg shadow-2xl p-4">
            <h3 className="font-semibold">{category.title}</h3>
            <p className="text-xs text-gray-400">{category.description}</p>
            <ul>
              {category.items ? (
                category.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-center gap-2 mt-2">
                    <img src={item.image} alt={item.title} className="w-12 h-12 rounded object-contain" />
                    <div>
                      <h4 className="text-sm font-medium">{item.title}</h4>
                      <p className="text-xs text-gray-800">{fCurrency(item.lowestPrice, { currency: "VND" })}</p>
                    </div>
                  </li>
                ))
              ) : (
                <p className="text-xs text-gray-500">Chưa có sản phẩm</p>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
