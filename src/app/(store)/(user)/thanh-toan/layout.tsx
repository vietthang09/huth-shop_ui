import { Metadata } from "next";

export const metadata: Metadata = {
  title: "HuthShop - Thanh toán",
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <div className="bg-gray-50 py-24 lg:px-0 px-4">{children}</div>;
};

export default Layout;
