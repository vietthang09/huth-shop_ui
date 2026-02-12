import { Product } from "@/services/type";
import { fCurrency } from "@/shared/utils/format-number";
import { Check, ChevronsDown, ChevronsUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const onToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const cheapestVariant = product.variants.reduce((prev, curr) => {
    return prev.retailPrice < curr.retailPrice ? prev : curr;
  });

  const shortDescription = product.shortDescription?.split("|") || "";

  return (
    <div>
      <Link href={`/san-pham/${product.sku}`}>
        <div className="relative rounded-xl overflow-hidden shadow-md bg-white flex flex-col items-center justify-center gap-4 hover:shadow-xl transition-shadow duration-300">
          <img src={product.images[0]} alt="Product Image" width={240} height={240} className="h-28 w-auto" />
          <div className="relative py-4 bg-[#ef534f] w-full text-white text-center">
            <p className="text-2xl font-bold">{fCurrency(cheapestVariant.retailPrice)}</p>
            <p className="text-white/80">{cheapestVariant.title}</p>
            <Image
              src="/images/radian.svg"
              alt="Radian"
              width={324}
              height={9}
              className="absolute top-0 -translate-y-2"
            />
          </div>
          {/* {isSales && (
            <div className="absolute bg-[#4bca5933] top-0 right-0 text-sm text-[#4bca59] font-bold p-1 rounded-bl-xl">
              💥Big Sale!
            </div>
          )} */}
        </div>
      </Link>

      <div className="mt-2 bg-gradient-to-b from-[#fdefee] to-white/0 p-4 rounded-t-xl">
        <ul className="text-sm text-[#ef534f] space-y-1" onClick={onToggleExpand}>
          {shortDescription.length > 3 &&
            shortDescription.slice(0, 3).map((line, index) => (
              <li key={index} className={`flex items-start gap-1`}>
                <Check size={16} className="min-w-4 h-4" />{" "}
                <span className={`${!isExpanded && "line-clamp-1"}`}>{line}</span>
              </li>
            ))}
          {shortDescription.length > 3 &&
            isExpanded &&
            shortDescription.slice(3).map((line, index) => (
              <li key={index} className="flex items-start gap-1">
                <Check size={16} className="min-w-4 h-4" />
                <span>{line}</span>
              </li>
            ))}
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
          <Link href={`/san-pham/${product.sku}`} className="font-bold underline text-sm">
            Xem chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
}
