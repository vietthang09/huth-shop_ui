import { Metadata } from "next";

import AdminSidebar from "@/components/admin/sideBar";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="styles.adminLayout flex min-h-screen">
      <AdminSidebar />{" "}
      <div className="w-full lg:ml-[var(--sidebar-width,280px)] p-6 transition-all duration-300">
        <h1 className="w-full block text-gray-700 text-2xl font-light pb-5 mb-2 border-b border-gray-300">
          Admin Dashboard
        </h1>
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
