import { Metadata } from "next";

export const metadata: Metadata = {
  title: "HuthShop - Thanh toán",
};

const ProductLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className="bg-[#000326] min-h-screen lg:px-0 px-4">{children}</div>;
};

export default ProductLayout;
