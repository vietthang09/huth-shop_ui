import Link from "next/link";

type THighLight = { title: string; description: string; imageUrl: string };
export default function HighLight() {
  const HighLightItems: THighLight[] = [
    {
      title: "Netflix Premium",
      description: "Trải nghiệm giải trí đỉnh cao với gói Netflix Premium - Xem trên 4 thiết bị.",
      imageUrl:
        "https://lh3.googleusercontent.com/H-rU-0R2i0LkOmCskP1zp6XZgSUOsS4k0clhmL_y3QgMaqYmP72bTiDffUWvJdQXjx58o-9jkMiiPpL5y_vmUXiq2BuHn460-wc=s6000-w6000-e365-rw-v0-nu",
    },
    {
      title: "Github Copilot Edu",
      description: "Học tập hiệu quả hơn với Github Copilot dành riêng cho sinh viên.",
      imageUrl:
        "https://lh3.googleusercontent.com/H-rU-0R2i0LkOmCskP1zp6XZgSUOsS4k0clhmL_y3QgMaqYmP72bTiDffUWvJdQXjx58o-9jkMiiPpL5y_vmUXiq2BuHn460-wc=s6000-w6000-e365-rw-v0-nu",
    },
    {
      title: "Chat GPT Plus",
      description: "Truy cập các tính năng nâng cao và phản hồi nhanh hơn với Chat GPT Plus.",
      imageUrl:
        "https://lh3.googleusercontent.com/H-rU-0R2i0LkOmCskP1zp6XZgSUOsS4k0clhmL_y3QgMaqYmP72bTiDffUWvJdQXjx58o-9jkMiiPpL5y_vmUXiq2BuHn460-wc=s6000-w6000-e365-rw-v0-nu",
    },
  ];
  return (
    <div className="grid grid-cols-12 gap-4">
      {HighLightItems.slice(0, 3).map((item, index) => (
        <div key={index} className="col-span-4">
          <HighLightItem item={item} />
        </div>
      ))}
    </div>
  );
}

function HighLightItem({ item }: { item: THighLight }) {
  return (
    <div className="bg-gray-200 px-8 pt-8 rounded-xl">
      <h3 className="text-center text-3xl font-bold">{item.title}</h3>
      <p className="text-center mt-4">{item.description}</p>
      <div className="w-full flex justify-center">
        <Link
          href="#"
          className="mx-auto mt-4 border border-2 font-bold rounded-full px-6 py-2 inline-block text-center hover:bg-gray-300"
        >
          Xem chi tiết
        </Link>
      </div>

      <img className="mt-8" src={item.imageUrl} />
    </div>
  );
}
