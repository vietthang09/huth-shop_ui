import StoreNavBar from "@/components/store/common/store-nav-bar";
import StoreFooter from "./../../components/store/footer/index";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "HuthShop - Trang chủ",
};

const StoreLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <StoreNavBar />
      <main className="bg-white min-h-screen max-w-7xl mx-auto px-4">{children}</main>
      <StoreFooter />
    </>
  );
};

export default StoreLayout;
