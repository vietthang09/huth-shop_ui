import { getDashboardSummary, getRecentOrders, getSalesData, getTopSellingProducts } from "@/actions/admin";
import { Suspense } from "react";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  Activity,
  Clock,
  Eye,
  RefreshCw,
  Download,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  ChevronRight,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Enhanced Summary Card Component
const EnhancedSummaryCard = ({
  title,
  value,
  subValue,
  icon,
  trend,
  color = "blue",
}: {
  title: string;
  value: string | number;
  subValue: string;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  color?: "blue" | "purple" | "green" | "orange";
}) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 bg-blue-50 text-blue-600",
    purple: "from-purple-500 to-purple-600 bg-purple-50 text-purple-600",
    green: "from-green-500 to-green-600 bg-green-50 text-green-600",
    orange: "from-orange-500 to-orange-600 bg-orange-50 text-orange-600",
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 group hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color].split(" ")[2]} ${colorClasses[color].split(" ")[3]}`}>
          {icon}
        </div>
        {trend && (
          <div
            className={`flex items-center space-x-1 text-sm font-medium ${
              trend.isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend.isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span>{trend.value}%</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</h3>
        <p className="text-3xl font-bold text-gray-900 group-hover:scale-105 transition-transform duration-200">
          {value}
        </p>
        <p className="text-sm text-gray-500">{subValue}</p>
      </div>

      {/* Progress bar for visual appeal */}
      <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full bg-gradient-to-r ${colorClasses[color].split(" ")[0]} ${
            colorClasses[color].split(" ")[1]
          } transition-all duration-500`}
          style={{
            width: `${Math.min(100, Math.max(10, typeof value === "number" ? Math.min(value / 10, 100) : 75))}%`,
          }}
        />
      </div>
    </div>
  );
};

// Status Badge Component
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

// Enhanced Data Card Component
const DataCard = ({
  title,
  children,
  icon,
  action,
}: {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-3">
        {icon && <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">{icon}</div>}
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      </div>
      {action}
    </div>
    {children}
  </div>
);

const AdminHome = async () => {
  const dashboardSummary = await getDashboardSummary();
  const recentOrders = await getRecentOrders(10);
  const salesData = await getSalesData(30);
  const topSellingProducts = await getTopSellingProducts(10);

  // Calculate trends (mock data - in real app this would come from comparison with previous period)
  const trends = {
    users: { value: 12.5, isPositive: true },
    products: { value: 8.3, isPositive: true },
    orders: { value: 15.7, isPositive: true },
    revenue: { value: 23.1, isPositive: true },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="p-6 space-y-8">
        {/* Enhanced Header Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Dashboard Overview
              </h1>
              <p className="text-blue-100 text-lg">Welcome back! Here's what's happening with your store today.</p>
            </div>
            <div className="mt-6 lg:mt-0 flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-blue-100 bg-white/10 rounded-lg px-3 py-2">
                <Clock className="w-4 h-4" />
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
              <button className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 transition-colors rounded-lg px-4 py-2 text-sm font-medium">
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              <button className="flex items-center space-x-2 bg-white text-blue-600 hover:bg-blue-50 transition-colors rounded-lg px-4 py-2 text-sm font-medium">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <EnhancedSummaryCard
            title="Total Users"
            value={dashboardSummary.users.total}
            subValue={`${dashboardSummary.users.newUsersThisMonth} new this month`}
            icon={<Users className="w-8 h-8" />}
            trend={trends.users}
            color="blue"
          />
          <EnhancedSummaryCard
            title="Total Products"
            value={dashboardSummary.products.total}
            subValue={`${dashboardSummary.products.outOfStock} out of stock`}
            icon={<Package className="w-8 h-8" />}
            trend={trends.products}
            color="purple"
          />
          <EnhancedSummaryCard
            title="Total Orders"
            value={dashboardSummary.orders.total}
            subValue={`${dashboardSummary.orders.thisMonth} this month`}
            icon={<ShoppingCart className="w-8 h-8" />}
            trend={trends.orders}
            color="green"
          />
          <EnhancedSummaryCard
            title="Total Revenue"
            value={`$${dashboardSummary.orders.totalRevenue.toLocaleString()}`}
            subValue={`$${dashboardSummary.orders.thisMonthRevenue.toLocaleString()} this month`}
            icon={<DollarSign className="w-8 h-8" />}
            trend={trends.revenue}
            color="orange"
          />
        </div>

        {/* Charts and Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DataCard
            title="Order Status Distribution"
            icon={<PieChart className="w-5 h-5" />}
            action={
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            }
          >
            <div className="space-y-4">
              {Object.entries(dashboardSummary.orders.byStatus).map(([status, count]) => {
                const percentage = ((count / dashboardSummary.orders.total) * 100).toFixed(1);
                return (
                  <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <StatusBadge status={status} />
                      <span className="text-sm text-gray-600">{percentage}%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900">{count}</span>
                      <div className="w-16 h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </DataCard>

          <DataCard
            title="Top Categories"
            icon={<BarChart3 className="w-5 h-5" />}
            action={
              <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium">
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            }
          >
            <div className="space-y-4">
              {dashboardSummary.categories.topCategories.map((category, index) => {
                const maxCount = Math.max(...dashboardSummary.categories.topCategories.map((c) => c.count));
                const percentage = (category.count / maxCount) * 100;
                return (
                  <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold ${
                          index === 0
                            ? "bg-yellow-500"
                            : index === 1
                            ? "bg-gray-400"
                            : index === 2
                            ? "bg-orange-500"
                            : "bg-blue-500"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-900">{category.name}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600">{category.count} products</span>
                      <div className="w-20 h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </DataCard>
        </div>

        {/* Recent Orders */}
        <DataCard
          title="Recent Orders"
          icon={<Activity className="w-5 h-5" />}
          action={
            <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium">
              <span>View All Orders</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          }
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.userEmail || "Guest"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.itemCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${order.total.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-blue-600 hover:text-blue-900 flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DataCard>

        {/* Top Selling Products */}
        <DataCard
          title="Top Selling Products"
          icon={<TrendingUp className="w-5 h-5" />}
          action={
            <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium">
              <span>View All Products</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          }
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Units Sold
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topSellingProducts.map((product, index) => {
                  const maxSales = Math.max(...topSellingProducts.map((p) => p.sales));
                  const performance = (product.sales / maxSales) * 100;
                  return (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold ${
                              index === 0
                                ? "bg-yellow-500"
                                : index === 1
                                ? "bg-gray-400"
                                : index === 2
                                ? "bg-orange-500"
                                : "bg-blue-500"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{product.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.sku}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{product.sales}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${product.revenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full">
                            <div
                              className="h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-500"
                              style={{ width: `${performance}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{performance.toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </DataCard>

        {/* Quick Stats Footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Active Users</p>
                <p className="text-2xl font-bold">2,847</p>
                <p className="text-blue-100 text-sm">Currently online</p>
              </div>
              <Activity className="w-8 h-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Conversion Rate</p>
                <p className="text-2xl font-bold">3.2%</p>
                <p className="text-purple-100 text-sm">+0.5% from last week</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Avg. Order Value</p>
                <p className="text-2xl font-bold">$127</p>
                <p className="text-green-100 text-sm">+$12 from last month</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
