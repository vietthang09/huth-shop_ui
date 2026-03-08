import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý mã giảm giá | Huth Shop Admin",
  description: "Quản lý thông tin mã giảm giá và khuyến mãi",
  keywords: ["mã giảm giá", "coupon", "quản lý", "admin", "huth shop"],
  robots: "noindex, nofollow",
};

export default function CouponLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
