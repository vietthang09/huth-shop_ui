import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý đơn hàng | Huth Shop Admin",
  description: "Quản lý, theo dõi và xử lý các đơn hàng",
  keywords: ["đơn hàng", "order", "quản lý", "admin", "huth shop"],
  robots: "noindex, nofollow",
};

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
