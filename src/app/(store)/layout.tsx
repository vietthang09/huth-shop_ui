import { Metadata } from "next";

import FloatingButtons from "@/components/store/common/FloatingButtons";
import StoreNavBar from "@/components/store/common/store-nav-bar";

import StoreFooter from "./../../components/store/footer/index";
export const metadata: Metadata = {
  title: "HuthShop - Trang chủ",
};

const StoreLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <StoreNavBar />
      <main className="bg-white min-h-screen">{children}</main>
      <StoreFooter />
      <FloatingButtons />
    </>
  );
};

export default StoreLayout;
