import { Metadata } from "next";

export const metadata: Metadata = {
  title: "HuthShop - Thanh toán",
  description: "Trang thanh toán của HuthShop",
};

const ListLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default ListLayout;
