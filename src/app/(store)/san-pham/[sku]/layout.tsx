import { Metadata } from "next";

export const metadata: Metadata = {
  title: "HuthShop - Product",
};

const ProductLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className="bg-white lg:px-0 px-4">{children}</div>;
};

export default ProductLayout;
