import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trang cá nhân | HuthShop",
  description: "Quản lý thông tin cá nhân, đơn hàng, và các hoạt động mua sắm của bạn tại HuthShop.",
  keywords: ["huthshop", "cá nhân", "quản lý tài khoản", "đơn hàng", "mua sắm"],
  openGraph: {
    title: "Trang cá nhân | HuthShop",
    description: "Quản lý thông tin cá nhân, đơn hàng, và các hoạt động mua sắm của bạn tại HuthShop.",
    url: "https://huthshop.com/ca-nhan",
    siteName: "HuthShop",
    images: [
      {
        url: "/images/avatars/default-avatar.png",
        width: 400,
        height: 400,
        alt: "Avatar cá nhân HuthShop",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Trang cá nhân | HuthShop",
    description: "Quản lý thông tin cá nhân, đơn hàng, và các hoạt động mua sắm của bạn tại HuthShop.",
    images: ["/images/avatars/default-avatar.png"],
  },
};

const ProfileLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className="bg-gray-50 py-24 lg:px-0 px-4 max-w-7xl mx-auto">{children}</div>;
};

export default ProfileLayout;
