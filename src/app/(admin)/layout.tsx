import SideBar from "@/components/admin/common/side-bar";

const StoreLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <SideBar />
      <main className="flex-1 ml-64 bg-slate-50 min-h-screen overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};

export default StoreLayout;
