import { fCurrency } from "@/shared/utils/format-number";
import { aiProducts, eduProducts, entertainmentProducts, workingProducts } from "../data";

interface TrendingCategory {
  title: string;
  description: string;
  items: any[];
  icon: string;
  gradient: string;
}

export default function Trending() {
  const trending: TrendingCategory[] = [
    {
      title: "Giải trí",
      description: "Nền tảng giải trí đỉnh cao",
      items: entertainmentProducts,
      icon: "🎬",
      gradient: "from-slate-600 to-slate-700",
    },
    {
      title: "Làm việc",
      description: "Công cụ làm việc hiệu quả",
      items: workingProducts,
      icon: "💼",
      gradient: "from-gray-600 to-gray-700",
    },
    {
      title: "AI",
      description: "Công nghệ AI tiên tiến",
      items: aiProducts,
      icon: "🤖",
      gradient: "from-zinc-600 to-zinc-700",
    },
    {
      title: "Học tập",
      description: "Nền tảng học tập trực tuyến",
      items: eduProducts,
      icon: "📚",
      gradient: "from-stone-600 to-stone-700",
    },
  ];

  return (
    <section className="h-full py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Xu hướng nổi bật</h2>
        <p className="text-gray-600 mt-2">Khám phá các sản phẩm được yêu thích nhất</p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {trending.map((category, index) => (
          <div
            key={category.title}
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
          >
            {/* Category Header */}
            <div className={`bg-gradient-to-r ${category.gradient} p-4 text-white`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{category.icon}</span>
                <div>
                  <h3 className="font-bold text-lg">{category.title}</h3>
                  <p className="text-white/80 text-sm">{category.description}</p>
                </div>
              </div>
            </div>

            {/* Products List */}
            <div className="p-4">
              {category.items && category.items.length > 0 ? (
                <div className="space-y-3">
                  {category.items.slice(0, 3).map((item, itemIndex) => (
                    <div
                      key={`${category.title}-${itemIndex}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group/item"
                    >
                      <div className="relative">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-12 h-12 rounded-lg object-cover shadow-sm group-hover/item:shadow-md transition-shadow"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover/item:bg-black/5 rounded-lg transition-colors"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 text-sm truncate group-hover/item:text-gray-900">
                          {item.title}
                        </h4>
                        <p className="text-xs font-semibold text-gray-700">
                          {fCurrency(item.lowestPrice, { currency: "VND" })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {category.items.length > 3 && (
                    <div className="text-center pt-2">
                      <button className="text-xs text-gray-500 hover:text-gray-700 font-medium">
                        +{category.items.length - 3} sản phẩm khác
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="text-gray-400 text-lg mb-2">🏷️</div>
                  <p className="text-sm text-gray-500">Chưa có sản phẩm</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
