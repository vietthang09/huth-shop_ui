"use client";

import Image from "next/image";
import Link from "next/link";

type TProps = {
  productName: string;
  newPrice?: number;
  oldPrice: number;
  image: [string, string];
  spec?: string[];
  url: string;
  soldCount: number;
};

const TopSellingCard = ({ productName, newPrice, oldPrice, image, spec = [], url, soldCount }: TProps) => {
  return (
    <div className="min-w-64 h-[400px] relative p-2 bg-white rounded-xl hover:[&_.imgWrapper_>_img:last-child]:opacity-100 hover:[&_.imgWrapper_>_img:last-child]:scale-105">
      <Link
        href={url}
        className="imgWrapper w-full h-[220px] block relative overflow-hidden border border-gray-300 rounded-lg"
      >
        <Image
          alt=""
          src={image[0]}
          fill
          sizes="(max-width:240px)"
          className="object-cover transition-all duration-400 ease-out"
        />
        <Image
          alt=""
          src={image[1]}
          fill
          sizes="(max-width:240px)"
          className="object-cover transition-all duration-400 ease-out opacity-0 scale-[0.9]"
        />
      </Link>
      <div className="absolute top-5 left-5 rounded-md px-2 py-1 bg-blue-600 text-sm text-white">
        <span>Đã bán {soldCount}</span>
      </div>
      <Link href={url}>
        <h3 className="mt-3.5 mb-3 ml-2 text-gray-600">{productName}</h3>
      </Link>
      <div className="flex justify-between mx-2 mt-2">
        <section>
          {newPrice ? (
            <>
              <span className="block text-gray-500 text-sm">
                Giá cũ{" "}
                {oldPrice.toLocaleString("vi-VN", {
                  useGrouping: true,
                  minimumFractionDigits: 0,
                })}{" "}
                ₫
              </span>
              <span className="block text-lg font-medium text-gray-900">
                {newPrice.toLocaleString("vi-VN", {
                  useGrouping: true,
                  minimumFractionDigits: 0,
                })}{" "}
                ₫
              </span>
            </>
          ) : (
            <span className="block text-lg font-medium text-gray-900">
              {oldPrice.toLocaleString("vi-VN", {
                useGrouping: true,
                minimumFractionDigits: 0,
              })}{" "}
              ₫
            </span>
          )}
        </section>
      </div>
    </div>
  );
};

export default TopSellingCard;
