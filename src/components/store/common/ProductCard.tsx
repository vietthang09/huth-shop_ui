import { fCurrency } from "@/shared/utils/format-number";
import { Check, ChevronsDown, ChevronsUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type ProductCardProps = {
  isSales?: boolean;
};

export default function ProductCard({ isSales }: ProductCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const onToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  return (
    <div>
      <Link href="#">
        <div className="relative rounded-xl overflow-hidden shadow-md bg-white flex flex-col items-center justify-center gap-4 hover:shadow-xl transition-shadow duration-300">
          <Image
            src="https://static.gamsgocdn.com/image/395063e196c5068d11e6d587f8876cf8.webp"
            alt="Product Image"
            width={240}
            height={240}
          />
          <div className="relative py-4 bg-[#ef534f] w-full text-white text-center">
            <p className="text-2xl font-bold">{fCurrency(59000)}</p>
            <p className="text-white/80">/ 6 tháng</p>
            <Image
              src="/images/radian.svg"
              alt="Radian"
              width={324}
              height={9}
              className="absolute top-0 -translate-y-2"
            />
          </div>
          {isSales && (
            <div className="absolute bg-[#4bca5933] top-0 right-0 text-sm text-[#4bca59] font-bold p-1 rounded-bl-xl">
              💥Big Sale!
            </div>
          )}
        </div>
      </Link>

      <div className="mt-2 bg-gradient-to-b from-[#fdefee] to-white/0 p-4 rounded-t-xl">
        <ul className="text-sm text-[#ef534f] space-y-1" onClick={onToggleExpand}>
          <li className={`flex items-start gap-1 ${!isExpanded && "line-clamp-1"}`}>
            <Check size={16} className="min-w-4 h-4" /> Official YouTube Premium membership
          </li>
          <li className={`flex items-start gap-1 ${!isExpanded && "line-clamp-1"}`}>
            <Check size={16} className="min-w-4 h-4" /> Upgrade your own account to the YouTube Premium
          </li>
          {isExpanded && (
            <>
              <li className="flex items-start gap-1">
                <Check size={16} className="min-w-4 h-4" />
                Ad-free viewing, background play, and offline downloads
              </li>
              <li className="flex items-start gap-1">
                <Check size={16} className="min-w-4 h-4" />
                Fast delivery
              </li>
            </>
          )}
        </ul>

        {isExpanded ? (
          <ChevronsUp className="text-[#ef534f] mx-auto" onClick={onToggleExpand} />
        ) : (
          <ChevronsDown className="text-[#ef534f] mx-auto" onClick={onToggleExpand} />
        )}

        <button className="bg-[#ef534f] text-white font-bold uppercase rounded-full px-4 py-2 mt-4 w-full">
          Mua ngay
        </button>

        <div className="text-center mt-4">
          <Link href="#" className="font-bold underline text-sm">
            Xem chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
}
