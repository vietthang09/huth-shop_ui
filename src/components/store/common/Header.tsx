"use client";

import Link from "next/link";

import Image from "next/image";
import { ChevronRight, Headset, LayoutDashboard, Logs, Search, ShoppingCart, Store, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import CartButton from "./CartButton";
import { useRouter } from "next/navigation";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";

const Header = () => {
  const { user, isAuthenticated, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [searchText, setSearchText] = useState("");

  const handleSearch = () => {
    router.push(`/tim-kiem?tu-khoa=${searchText}`);
    onClose();
  };

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <nav className="sticky bg-[#ef534f] top-0 z-50 py-4 relative">
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

        <div className="w-full bg-white/20 rounded-full px-4 py-2 flex items-center gap-2" onClick={onOpen}>
          <Search className="text-white" size={16} />
          <input placeholder="Tìm trong HuthShop" className="text-white focus:outline-none" />
        </div>

        <Link
          href="/dang-ky-dai-ly"
          className="flex gap-2 items-center border border-white text-white hover:bg-white/20 py-2 px-3 rounded-full transition-colors duration-300"
        >
          <Store size={18} />
          Trở thành đại lý
        </Link>

        {isAuthenticated && user ? (
          <div className="flex items-center gap-8">
            <CartButton />
            <div
              className="relative bg-gray-600 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer select-none"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span className="text-white text-xl ">{user.name?.charAt(0).toUpperCase()}</span>
              {showDropdown && (
                <>
                  <div className="fixed inset-0" onClick={() => setShowDropdown(false)} />
                  <div className="absolute top-10 left-0 bg-white shadow-lg rounded -translate-x-full min-w-[320px]">
                    <div className="mt-4 px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-gray-100">
                      <div>
                        <p className="font-semibold">{user.email}</p>
                        <p className="text-sm text-gray-400">Thông tin tài khoản</p>
                      </div>
                      <ChevronRight />
                    </div>
                    <hr className="border-gray-200 my-4" />
                    <ul className="space-y-2">
                      {user.role === "admin" && (
                        <li className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer">
                          <Link href="/portal" className="flex items-center gap-2">
                            <LayoutDashboard size={20} />
                            Portal
                          </Link>
                        </li>
                      )}
                      <li className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer">
                        <Link href="/lich-su" className="flex items-center gap-2">
                          <Logs size={20} />
                          Lịch sử mua hàng
                        </Link>
                      </li>
                      <li className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer">
                        <Headset size={20} />
                        Hỗ trợ
                      </li>
                    </ul>
                    <hr className="border-gray-200 my-4" />
                    <div className="p-4" onClick={() => signOut()}>
                      Đăng xuất
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="p-2 rounded-full hover:bg-white/20 transition-colors duration-300 cursor-pointer">
              <User className="text-white" size={24} />
            </div>
            <Link
              href="/dang-nhap"
              className="text-sm text-white hover:bg-white/20 py-1 px-3 rounded-full transition-colors duration-300"
            >
              Đăng nhập / Đăng ký
            </Link>
          </>
        )}
      </div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody className="p-8">
                <Input
                  placeholder="Tìm trong HuthShop"
                  value={searchText}
                  onKeyDown={handleEnter}
                  onValueChange={setSearchText}
                  autoFocus
                />

                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm">Tìm kiếm gần đây</span>
                  <Button size="sm" color="danger" variant="light">
                    Xóa hết
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Chip variant="bordered">Netflix</Chip>
                  <Chip variant="bordered">Spotify</Chip>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </nav>
  );
};

export default Header;
