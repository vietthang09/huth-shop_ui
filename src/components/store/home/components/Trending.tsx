export default function Trending() {
  const trending = [
    {
      title: "Giải trí",
      description: "Nền tảng giải trí đỉnh cao",
      items: [
        {
          image: "https://static.vecteezy.com/system/resources/previews/016/716/458/large_2x/spotify-icon-free-png.png",
          title: "Spotify Premium",
          price: 10000,
        },
        {
          image:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_(2017).svg/2560px-YouTube_full-color_icon_(2017).svg.png",
          title: "Youtube Premium",
          price: 10000,
        },
      ],
    },
    {
      title: "Làm việc",
      description: "Công cụ làm việc hiệu quả",
      items: [
        {
          image: "https://static.vecteezy.com/system/resources/previews/016/716/458/large_2x/spotify-icon-free-png.png",
          title: "Spotify Premium",
          price: 10000,
        },
        {
          image:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_(2017).svg/2560px-YouTube_full-color_icon_(2017).svg.png",
          title: "Youtube Premium",
          price: 10000,
        },
      ],
    },
    {
      title: "AI",
      description: "Hợp tác với các thương hiệu hàng đầu",
      items: [
        {
          image: "https://static.vecteezy.com/system/resources/previews/016/716/458/large_2x/spotify-icon-free-png.png",
          title: "Spotify Premium",
          price: 10000,
        },
        {
          image:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_(2017).svg/2560px-YouTube_full-color_icon_(2017).svg.png",
          title: "Youtube Premium",
          price: 10000,
        },
      ],
    },
    {
      title: "Media",
      description: "Cập nhật công nghệ mới nhất",
      items: [
        {
          image: "https://static.vecteezy.com/system/resources/previews/016/716/458/large_2x/spotify-icon-free-png.png",
          title: "Spotify Premium",
          price: 10000,
        },
        {
          image:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_(2017).svg/2560px-YouTube_full-color_icon_(2017).svg.png",
          title: "Youtube Premium",
          price: 10000,
        },
      ],
    },
  ];
  return (
    <div className="h-full">
      <h2 className="text-center text-2xl text-gray-800 font-medium">Xu hướng</h2>

      <div className="grid grid-cols-4 gap-4">
        {trending.map((category, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold">{category.title}</h3>
            <p className="text-xs">{category.description}</p>
            <ul>
              {category.items ? (
                category.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-center gap-2 mt-2">
                    <img src={item.image} alt={item.title} className="w-10 h-10 rounded object-contain" />
                    <div>
                      <h4 className="text-sm font-medium">{item.title}</h4>
                      <p className="text-xs text-gray-500">{item.price} VND</p>
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
