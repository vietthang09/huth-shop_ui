"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  BarChart3,
  Package,
  Tag,
  ShoppingCart,
  Users,
  Clipboard,
  FileText,
  Image as ImageIcon,
  Star,
  User,
  Shield,
  Settings,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  LogOut,
  LucideIcon,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navigationSections: NavSection[] = [
  {
    title: "Chung",
    items: [{ name: "Tổng quan", href: "/portal", icon: LayoutDashboard }],
  },
  {
    title: "Cửa hàng",
    items: [
      { name: "Sản phẩm", href: "/portal/san-pham", icon: Package },
      { name: "Danh mục", href: "/portal/danh-muc", icon: Tag },
      { name: "Đơn hàng", href: "/portal/don-hang", icon: ShoppingCart, badge: 5 },
      { name: "Khách hàng", href: "/portal/customers", icon: Users },
      { name: "Nhà cung cấp", href: "/portal/nha-cung-cap", icon: Clipboard },
    ],
  },
  // {
  //   title: "Nội dung",
  //   items: [
  //     { name: "Bài viết", href: "/portal/blog", icon: FileText },
  //     { name: "Thư viện Media", href: "/portal/media", icon: ImageIcon },
  //     { name: "Đánh giá", href: "/portal/reviews", icon: Star },
  //   ],
  // },
  // {
  //   title: "Hệ thống",
  //   items: [
  //     { name: "Người dùng", href: "/portal/users", icon: User },
  //     { name: "Cài đặt", href: "/portal/settings", icon: Settings },
  //     { name: "Logs", href: "/portal/logs", icon: FileSpreadsheet },
  //   ],
  // },
];

export default function SideBar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === "/portal") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className={`flex items-center ${isCollapsed ? "justify-center" : ""}`}>
            <div className="flex-shrink-0">
              <Image src="/images/logo.png" alt="Logo" width={32} height={32} className="rounded-lg" />
            </div>
            {!isCollapsed && (
              <div className="ml-3">
                <h1 className="text-lg font-bold text-gray-900">Huth Shop</h1>
                <p className="text-xs text-gray-500">Admin Portal</p>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Collapsed toggle button */}
        {isCollapsed && (
          <div className="p-2 border-b border-gray-200">
            <button
              onClick={() => setIsCollapsed(false)}
              className="w-full p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4 mx-auto" />
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {navigationSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {/* Section Title */}
              {!isCollapsed && (
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{section.title}</h3>
              )}

              {/* Section Items */}
              <ul className="space-y-1">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <Link
                      href={item.href}
                      className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group relative ${
                        isActive(item.href)
                          ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      {/* Icon */}
                      <item.icon className="flex-shrink-0 w-5 h-5" />

                      {/* Label */}
                      {!isCollapsed && (
                        <>
                          <span className="ml-3 truncate">{item.name}</span>

                          {/* Badge */}
                          {item.badge && (
                            <span className="ml-auto bg-red-100 text-red-600 text-xs font-medium px-2 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}

                      {/* Tooltip for collapsed state */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                          {item.name}
                          {item.badge && (
                            <span className="ml-2 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className={`flex items-center ${isCollapsed ? "justify-center" : ""}`}>
            <div className="flex-shrink-0">
              <Image src="/images/images/defaultUser.png" alt="User" width={32} height={32} className="rounded-full" />
            </div>
            {!isCollapsed && (
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
                <p className="text-xs text-gray-500 truncate">admin@huthshop.com</p>
              </div>
            )}

            {!isCollapsed && (
              <button className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            )}

            {/* Tooltip for collapsed logout button */}
            {isCollapsed && (
              <button className="group relative p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors">
                <LogOut className="w-4 h-4" />
                <div className="absolute left-full bottom-0 ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                  Logout
                </div>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden ${!isCollapsed ? "block" : "hidden"}`}
        onClick={() => setIsCollapsed(true)}
      />
    </>
  );
}
