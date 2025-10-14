import StoreNavBar from "@/components/store/navbar";

import StoreFooter from "./../../components/store/footer/index";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "HuthShop - Trang chủ",
};

const StoreLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <StoreNavBar />
      <main className="bg-slate-50 min-h-screen">{children}</main>
      <StoreFooter />
    </>
  );
};

export default StoreLayout;
