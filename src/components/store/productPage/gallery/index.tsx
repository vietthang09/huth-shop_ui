"use client";

import Image from "next/image";
import { useState } from "react";

import { SK_Box } from "@/components/UI/skeleton";
import { cn } from "@/shared/utils/styling";
import { CircleX } from "lucide-react";

type TProps = {
  images?: string[];
};

const Gallery = ({ images }: TProps) => {
  const [showZoom, setShowZoom] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  return (
    <div className="flex">
      <div className="flex relative flex-col gap-1 mr-2">
        {images ? (
          images.map((image, index) => (
            <div className="size-8">
              <Image
                src={image}
                alt=""
                width={32}
                height={32}
                key={index}
                className={cn(
                  "p-0.5 rounded border object-contain transition-colors duration-200",
                  index === selectedIndex ? "border-gray-400" : "cursor-pointer border-gray-200 hover:border-gray-400"
                )}
                onClick={() => setSelectedIndex(index)}
              />
            </div>
          ))
        ) : (
          <>
            <SK_Box width="32px" height="32px" />
            <SK_Box width="32px" height="32px" />
            <SK_Box width="32px" height="32px" />
          </>
        )}
      </div>
      <div className={"relative w-full h-[200px] lg:h-[250px] 2xl:h-[300px]"}>
        {" "}
        {images ? (
          <Image
            src={images[selectedIndex]}
            alt=""
            fill
            className="cursor-zoom-in object-contain rounded border border-white transition-colors duration-200 hover:border-gray-200"
            sizes="(max-width:700px)"
            onClick={() => setShowZoom(true)}
          />
        ) : (
          <SK_Box width="90%" height="90%" />
        )}
      </div>{" "}
      {images && showZoom && (
        <div className={"fixed inset-0 z-[1000] flex justify-between items-center flex-col pt-2 pb-4"}>
          <div
            className={"absolute inset-0 backdrop-blur-[2px] bg-[rgba(0,0,0,0.4)]"}
            onClick={() => setShowZoom(false)}
          />
          <div className={"flex w-[90%] h-[85%] bg-white relative overflow-hidden rounded"}>
            <button
              onClick={() => setShowZoom(false)}
              className="absolute z-[2] right-3 cursor-pointer top-3 p-1.5 bg-white/80 rounded transition-colors duration-200 hover:bg-gray-100 active:bg-gray-200"
            >
              <CircleX width={12} />
            </button>
            <Image src={images[selectedIndex]} className="object-contain" alt="" fill sizes="(max-width:700px)" />
          </div>
          <div
            className={"flex justify-center flex-row sm:gap-1.5 gap-0.5 rounded p-1.5 bg-[rgba(255,255,255,0.3)] z-[2]"}
          >
            {images.map((image, index) => (
              <Image
                src={image}
                alt=""
                width={32}
                height={32}
                key={index}
                className={cn(
                  "size-8 rounded object-contain bg-white border border-gray-200 transition-all duration-200 hover:border-gray-400",
                  index === selectedIndex ? "cursor-pointer border-gray-400 hover:border-gray-400" : "opacity-60"
                )}
                onClick={() => setSelectedIndex(index)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
