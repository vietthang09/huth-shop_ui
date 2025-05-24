import { getDashboardSummary, getRecentOrders, getSalesData, getTopSellingProducts } from "@/actions/admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const AdminHome = async () => {
  const dashboardSummary = await getDashboardSummary();
  const recentOrders = await getRecentOrders(5);
  const salesData = await getSalesData(30);
  const topSellingProducts = await getTopSellingProducts(5);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SummaryCard
          title="Total Users"
          value={dashboardSummary.users.total}
          subValue={`${dashboardSummary.users.newUsersThisMonth} new this month`}
          icon="👤"
        />
        <SummaryCard
          title="Total Products"
          value={dashboardSummary.products.total}
          subValue={`${dashboardSummary.products.outOfStock} out of stock`}
          icon="📦"
        />
        <SummaryCard
          title="Total Orders"
          value={dashboardSummary.orders.total}
          subValue={`${dashboardSummary.orders.thisMonth} this month`}
          icon="🛒"
        />
        <SummaryCard
          title="Total Revenue"
          value={`$${dashboardSummary.orders.totalRevenue.toLocaleString()}`}
          subValue={`$${dashboardSummary.orders.thisMonthRevenue.toLocaleString()} this month`}
          icon="💰"
        />
      </div>

      {/* Recent Orders */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.userEmail || "Guest"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.itemCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">${order.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Top Selling Products</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Units Sold
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topSellingProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.sku}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.sales}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    ${product.revenue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Status Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Order Status Distribution</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(dashboardSummary.orders.byStatus).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <StatusBadge status={status as any} />
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Top Categories</h3>
          <div className="space-y-3">
            {dashboardSummary.categories.topCategories.map((category) => (
              <div key={category.id} className="flex justify-between items-center">
                <span>{category.name}</span>
                <span className="font-semibold">{category.count} products</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper components
const SummaryCard = ({
  title,
  value,
  subValue,
  icon,
}: {
  title: string;
  value: string | number;
  subValue: string;
  icon: string;
}) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-lg font-semibold">{title}</h3>
      <span className="text-2xl">{icon}</span>
    </div>
    <p className="text-2xl font-bold">{value}</p>
    <p className="text-sm text-gray-500">{subValue}</p>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const colorMap: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
    REFUNDED: "bg-purple-100 text-purple-800",
  };

  const color = colorMap[status] || "bg-gray-100 text-gray-800";

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>{status}</span>
  );
};

export default AdminHome;
