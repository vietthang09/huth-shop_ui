import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý nhà cung cấp | Huth Shop Admin",
  description: "Quản lý thông tin nhà cung cấp và đối tác kinh doanh",
  keywords: ["nhà cung cấp", "supplier", "quản lý", "admin", "huth shop"],
  robots: "noindex, nofollow",
};

export default function SuppliersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
