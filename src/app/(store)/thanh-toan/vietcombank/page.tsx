"use client";
import { Button } from "@/components/ui";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

export default function VietcombankPage() {
  const params = useSearchParams();
  const QRImage = params.get("url") || "";

  return (
    <div className="flex flex-col items-center space-y-6 p-6">
      <Image
        src={decodeURIComponent(QRImage)}
        alt="Vietcombank QR Code"
        width={300}
        height={300}
        className="rounded-lg"
      />

      <Button>Xác nhận hoàn thành</Button>
    </div>
  );
}
