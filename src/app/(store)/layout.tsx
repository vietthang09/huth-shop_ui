import { Metadata } from "next";

import FloatingButtons from "@/components/store/common/FloatingButtons";
import Header from "@/components/store/common/Header";

import StoreFooter from "./../../components/store/footer/index";
export const metadata: Metadata = {
  title: "HuthShop - Trang chủ",
};

const StoreLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Header />
      <main className="bg-white">{children}</main>
      <StoreFooter />
      <FloatingButtons />
    </>
  );
};

export default StoreLayout;
