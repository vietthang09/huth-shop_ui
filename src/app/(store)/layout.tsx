import StoreNavBar from "@/components/store/common/store-nav-bar";
import StoreFooter from "./../../components/store/footer/index";
import { Metadata } from "next";
import Link from "next/link";
import { HeartHandshake, SmilePlus } from "lucide-react";

export const metadata: Metadata = {
  title: "HuthShop - Trang chủ",
};

const StoreLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="bg-black px-4 text-white py-2 text-sm flex justify-between items-center">
        <Link href="/" className="hover:underline">
          Trở thành đối tác
        </Link>
        <div className="space-x-4">
          <Link href="/" className="hover:underline">
            <SmilePlus className="inline-block size-4 mr-1" /> Chế độ bảo hành
          </Link>
          <Link href="/" className="hover:underline">
            <HeartHandshake className="inline-block size-4 mr-1" /> Liên hệ hỗ trợ
          </Link>
        </div>
      </div>
      <StoreNavBar />
      <main className="bg-white min-h-screen max-w-7xl mx-auto">{children}</main>
      <StoreFooter />
    </>
  );
};

export default StoreLayout;
