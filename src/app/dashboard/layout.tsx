import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex">
      <div className="w-64 bg-gray-100 min-h-screen p-4">
        <h1 className="text-xl font-bold mb-6">Dashboard</h1>
        <nav>
          <ul className="space-y-2">
            <li>
              <a href="/dashboard" className="block p-2 rounded hover:bg-gray-200">
                Tổng quan
              </a>
            </li>
            <li>
              <a href="/dashboard/top-selling" className="block p-2 rounded hover:bg-gray-200">
                Sản phẩm bán chạy
              </a>
            </li>
            <li>
              <a href="/admin/hot-deals" className="block p-2 rounded hover:bg-gray-200">
                Hot Deals
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
