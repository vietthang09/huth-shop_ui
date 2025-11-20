"use client";

import { ShieldCheck } from "lucide-react";
import Image from "next/image";

export default function SafeCheckout() {
  return (
    <div className=" bg-green-500/20 p-3 rounded-xl shadow">
      <h3 className="text-white flex items-center gap-2 text-lg font-bold">
        <ShieldCheck className="text-green-600 size-7" /> Thanh toán đảm bảo
      </h3>
      <p className="mt-2 text-gray-300 text-sm">Các phương thức thanh đảm bảo</p>
      <div className="mt-2 flex justify-center items-center rounded-2xl w-fit mx-auto overflow-hidden divide-x-2">
        <div className="size-20 p-2 bg-white flex items-center justify-center overflow-hidden">
          <Image
            src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-MoMo-Circle-1024x1024.png"
            alt="Visa"
            width={50}
            height={30}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="size-20 p-2 bg-white flex items-center justify-center overflow-hidden">
          <Image
            src="https://th.bing.com/th/id/OIP.GwY-oj14bkDlrxOH8T9J6gAAAA?cb=thvnextc1&rs=1&pid=ImgDetMain"
            alt="MasterCard"
            width={120}
            height={60}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="size-20 p-2 bg-white flex items-center justify-center overflow-hidden">
          <Image
            src="https://brandlogos.net/wp-content/uploads/2021/10/mb-bank-logo.png"
            alt="PayPal"
            width={50}
            height={30}
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}
