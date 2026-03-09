"use client";

import { Button } from "@heroui/react";
import { Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

function VietcombankPageContent() {
  const router = useRouter();
  const params = useSearchParams();
  const QRImage = params.get("url") || "";

  const handleConfirm = () => {
    toast.success("Cảm ơn bạn đã chuyển khoản! Đơn hàng của bạn đang được xử lý.");
    router.push("/");
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-6">
      <Image
        src={decodeURIComponent(QRImage)}
        alt="Vietcombank QR Code"
        width={300}
        height={300}
        className="rounded-lg"
      />

      <Button color="primary" onPress={handleConfirm}>
        Xác nhận đã chuyển khoản
      </Button>
    </div>
  );
}

export default function VietcombankPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-6 text-gray-600">Đang tải...</div>}>
      <VietcombankPageContent />
    </Suspense>
  );
}
