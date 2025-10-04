import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | HuthShop Admin",
    default: "Admin Portal | HuthShop",
  },
  description: "HuthShop Admin Portal - Manage your e-commerce store",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
