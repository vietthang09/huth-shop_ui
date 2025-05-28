import { Metadata } from "next";

export const metadata: Metadata = {
  title: "BITEX - Thanh toán",
  description: "Trang thanh toán của BITEX",
};

const ListLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default ListLayout;
