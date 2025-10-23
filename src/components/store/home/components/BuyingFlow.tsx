import Link from "next/link";

type TStep = {
  imageUrl: string;
  title: string;
  doc: string;
};
export default function BuyingFlow() {
  const steps: TStep[] = [
    {
      imageUrl: "https://storage.googleapis.com/mannequin/blobs/246d17a3-8761-441b-8750-5c4a416e7553.svg",
      title: "Thêm sản phẩm vào giỏ hàng.",
      doc: "https://support.google.com/store/answer/12436460",
    },
    {
      imageUrl: "https://storage.googleapis.com/mannequin/blobs/cac661d1-3d5b-4b8e-84e9-9b3aefd66a94.svg",
      title: "Thanh toán đơn hàng.",
      doc: "https://support.google.com/store/answer/12436460",
    },
    {
      imageUrl: "https://storage.googleapis.com/mannequin/blobs/4dd88027-c7a9-4d97-801f-65f8cd66b4d3.svg",
      title: "Nhận tài khoản và bắt đầu sử dụng.",
      doc: "https://support.google.com/store/answer/12436460",
    },
  ];
  return (
    <div>
      <h2 className="text-center text-3xl lg:text-4xl font-bold mb-2 tracking-tight">Mua tài khoản như thế nào?</h2>

      <div className="mt-8 grid grid-cols-3 gap-4">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center mb-8 px-4 bg-gray-50 p-16 rounded-xl space-y-5">
            <img src={step.imageUrl} alt={step.title} className="w-8 h-8" />
            <h3 className="text-xl font-semibold max-w-44 text-center">{step.title}</h3>
            <Link
              href={step.doc}
              target="_blank"
              className="mx-auto mt-4 border border-2 font-bold rounded-full px-6 py-2 inline-block text-center hover:bg-gray-300"
            >
              Tìm hiểu thêm
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
