import { Metadata } from "next";
import Footer from "@/components/store/footer";

export const metadata: Metadata = {
  title: "Đăng Ký - Huth Shop",
  description:
    "Tạo tài khoản Huth Shop để mua sắm các sản phẩm công nghệ, phần mềm và phụ kiện chính hãng với giá tốt nhất.",
  keywords: ["đăng ký", "register", "tạo tài khoản", "huth shop", "công nghệ", "phần mềm", "phụ kiện"],
  openGraph: {
    title: "Đăng Ký - Huth Shop",
    description:
      "Tạo tài khoản Huth Shop để mua sắm các sản phẩm công nghệt, phần mềm và phụ kiện chính hãng với giá tốt nhất.",
    type: "website",
    locale: "vi_VN",
  },
  robots: {
    index: false,
    follow: true,
  },
  other: {
    "last-modified": "2025-10-19",
    updated: "2025-10-19T00:00:00.000Z",
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
