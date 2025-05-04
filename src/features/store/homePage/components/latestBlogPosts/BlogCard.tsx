import Image from "next/image";
import Link from "next/link";

type BlogCardProps = {
  title: string;
  imgUrl: string;
  shortText: string;
  url: string;
};

const HomeBlogCard = ({ title, imgUrl, shortText, url }: BlogCardProps) => {
  return (
    <div className="overflow-hidden flex-1 space-y-4">
      <Link href={url} className="w-full h-[250px] block relative">
        <Image src={imgUrl} fill alt={title} sizes="(max-width:430px)" className="rounded-xl object-cover" />
      </Link>
      <Link href={url}>
        <h2 className="font-medium text-gray-800 line-clamp-2">{title}</h2>
      </Link>
      <p className="mt-4 text-sm opacity-50 line-clamp-3">{shortText}</p>
      <div className="">
        <Link href={url} className="text-ms hover:underline">
          Chi tiết
        </Link>
      </div>
    </div>
  );
};

export default HomeBlogCard;
