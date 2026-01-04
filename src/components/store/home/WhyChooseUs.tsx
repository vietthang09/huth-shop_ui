import { HandHeart, Handshake, Headset, Lock, Rocket, Shield } from "lucide-react";

export default function WhyChooseUs() {
  const reasons = [
    {
      title: "Real-time Delivery",
      description: "Real-time delivery after payment without waiting, fast arrival to dispel your worries",
      icon: <Rocket />,
    },
    {
      title: "QUICK RESET PASSKEY",
      description: "Click reset passkey on the subscription page without waiting and manual operation",
      icon: <Lock />,
    },
    {
      title: "SSL CERTIFICATE",
      description: "Payments take place in a secure environment with an SSL security certificate",
      icon: <Shield />,
    },
    {
      title: "24/7 LIVE SUPPORT",
      description: "GamsGo provides 24/7 online private customer service, help you have a good experience",
      icon: <Headset />,
    },
    {
      title: "AFFORDABLE PREMIUM",
      description: "Get premium subscription at lower price",
      icon: <Handshake />,
    },
    {
      title: "REFUND GUARANTEE",
      description: "We offer buyer protection, with refunds available within 24 hours.",
      icon: <HandHeart />,
    },
  ];
  return (
    <div>
      <h2 className="text-center text-black text-3xl font-bold">
        Tại sao nhiều <span className="text-[#ef534f]">khách hàng</span> chọn{" "}
        <span className="text-[#ef534f]">HuthShop</span>?
      </h2>

      <div className="mt-4 grid grid-cols-3 gap-4">
        {reasons.map((reason) => (
          <div key={reason.title} className="flex gap-4 p-6 rounded-xl hover:shadow-md group">
            <div className="flex items-center justify-center min-w-18 h-18 bg-white text-[#ef534f] rounded-full shadow-md group-hover:bg-[#ef534f] group-hover:text-white">
              {reason.icon}
            </div>
            <div>
              <h3 className="text-xl uppercase font-bold mb-4">{reason.title}</h3>
              <p className="text-xs text-gray-600">{reason.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
