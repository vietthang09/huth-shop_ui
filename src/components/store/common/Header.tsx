"use client";

import Link from "next/link";

import Image from "next/image";
import { Search, Store, User } from "lucide-react";

const Header = () => {
  return (
    <nav className="sticky bg-[#ef534f] top-0 z-50 py-4">
      <div className="max-w-7xl mx-auto w-full flex justify-between gap-8 items-center text-sm text-nowrap">
        <Link href="/" className="rounded font-semibold text-xl transition-colors duration-300">
          <Image
            src="https://static.gamsgocdn.com/image/f101b23dabbe411290135b382136bb17.webp"
            alt="HuthShop Logo"
            className="min-w-32 h-auto"
            width={144}
            height={56}
          />
        </Link>
        <Link
          href="/"
          className="text-white uppercase hover:bg-white/20 py-1 px-3 rounded-full transition-colors duration-300"
        >
          Trang chủ
        </Link>
        <Link
          href="/ho-tro"
          className="text-white uppercase hover:bg-white/20 py-1 px-3 rounded-full transition-colors duration-300"
        >
          Hỗ trợ
        </Link>

        <Link
          href="/ho-tro"
          className="text-white uppercase hover:bg-white/20 py-1 px-3 rounded-full transition-colors duration-300"
        >
          Liên hệ
        </Link>

        <div className="w-full bg-white/20 rounded-full px-4 py-2 flex items-center gap-2">
          <Search className="text-white" size={16} />
          <input placeholder="Tìm trong HuthShop" className="text-white" />
        </div>

        <Link
          href="/dang-ky-dai-ly"
          className="flex gap-2 items-center border border-white text-white hover:bg-white/20 py-2 px-3 rounded-full transition-colors duration-300"
        >
          <Store size={18} />
          Trở thành đại lý
        </Link>

        <div className="p-2 rounded-full hover:bg-white/20 transition-colors duration-300 cursor-pointer">
          <User className="text-white" size={24} />
        </div>

        <Link
          href="/dang-nhap"
          className="text-sm text-white hover:bg-white/20 py-1 px-3 rounded-full transition-colors duration-300"
        >
          Đăng nhập / Đăng ký
        </Link>
      </div>
    </nav>
  );
};

export default Header;
