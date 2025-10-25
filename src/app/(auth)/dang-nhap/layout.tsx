import { Metadata } from "next";
import Footer from "@/components/store/footer";

export const metadata: Metadata = {
  title: "Đăng Nhập - Huth Shop",
  description:
    "Đăng nhập vào tài khoản Huth Shop để mua sắm các sản phẩm công nghệ, phần mềm và phụ kiện chính hãng với giá tốt nhất.",
  keywords: ["đăng nhập", "login", "huth shop", "công nghệ", "phần mềm", "phụ kiện"],
  openGraph: {
    title: "Đăng Nhập - Huth Shop",
    description:
      "Đăng nhập vào tài khoản Huth Shop để mua sắm các sản phẩm công nghệ, phần mềm và phụ kiện chính hãng với giá tốt nhất.",
    type: "website",
    locale: "vi_VN",
  },
  robots: {
    index: false,
    follow: true,
  },
};

const StoreLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <main className="bg-slate-50 min-h-screen">{children}</main>
      <Footer />
    </>
  );
};

export default StoreLayout;
