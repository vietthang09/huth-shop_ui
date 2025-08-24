"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { CalendarIcon, PackageIcon, CreditCardIcon, TruckIcon, EyeIcon, SearchIcon, FilterIcon, X } from "lucide-react";

import { getUserOrders } from "@/actions/order/order";
import { formatOrderStatus, getOrderStatusColor } from "@/actions/order/utils";
import Button from "@/components/UI/button";
import { OrderStatus } from "@prisma/client";

type Order = {
  id: number;
  status: OrderStatus;
  total: number | string; // Handle Prisma Decimal as number or string
  createdAt: Date;
  orderItems: Array<{
    id: number;
    quantity: number;
    retailPrice: number | string; // Handle Prisma Decimal as number or string
    property: {
      product: {
        title: string;
        image: string | null;
      };
    };
  }>;
};

type OrdersResponse = {
  success: boolean;
  orders?: Order[];
  pagination?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
  error?: string;
};

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response: OrdersResponse = await getUserOrders(currentPage, itemsPerPage);

      if (response.success && response.orders) {
        setOrders(response.orders);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
        }
      } else {
        setError(response.error || "Failed to fetch orders");
      }
    } catch (err) {
      setError("An error occurred while fetching orders");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchOrders();
  };

  const handleStatusFilter = (status: OrderStatus | "ALL") => {
    setStatusFilter(status);
    setCurrentPage(1);
    fetchOrders();
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchQuery === "" ||
      order.id.toString().includes(searchQuery) ||
      order.orderItems.some((item) => item.property.product.title.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return <CalendarIcon className="w-4 h-4" />;
      case OrderStatus.PROCESSING:
        return <PackageIcon className="w-4 h-4" />;
      case OrderStatus.DELIVERED:
        return <TruckIcon className="w-4 h-4" />;
      default:
        return <CreditCardIcon className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const formatPrice = (price: number | string) => {
    return Number(price).toLocaleString("en-us", {
      minimumFractionDigits: 2,
    });
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
    setShowOrderDetails(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 font-medium">Error loading orders</p>
            <p className="text-red-500 mt-2">{error}</p>
            <Button onClick={fetchOrders} className="mt-4" variant="primary">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-2">Track and manage your orders</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by order ID or product name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <FilterIcon className="text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value as OrderStatus | "ALL")}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">All Orders</option>
                <option value={OrderStatus.PENDING}>Pending</option>
                <option value={OrderStatus.PROCESSING}>Processing</option>
                <option value={OrderStatus.DELIVERED}>Delivered</option>
                <option value={OrderStatus.CANCELLED}>Cancelled</option>
                <option value={OrderStatus.REFUNDED}>Refunded</option>
              </select>
            </div>

            <Button onClick={handleSearch} variant="primary">
              Search
            </Button>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <PackageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || statusFilter !== "ALL"
                ? "Try adjusting your search or filter criteria"
                : "You haven't placed any orders yet"}
            </p>
            {!searchQuery && statusFilter === "ALL" && (
              <Link href="/products">
                <Button variant="primary">Start Shopping</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
                      <div
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getOrderStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        {formatOrderStatus(order.status)}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        {formatDate(order.createdAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <PackageIcon className="w-4 h-4" />
                        {order.orderItems.length} item{order.orderItems.length !== 1 ? "s" : ""}
                      </div>
                      <div className="font-semibold text-gray-900">€{formatPrice(order.total)}</div>
                    </div>

                    {/* Product Preview */}
                    <div className="mt-3 flex items-center gap-2">
                      {order.orderItems.slice(0, 3).map((item, index) => (
                        <div
                          key={index}
                          className="w-12 h-12 rounded-md overflow-hidden border border-gray-200 flex-shrink-0"
                        >
                          <Image
                            src={item.property.product.image || "/placeholder-product.png"}
                            width={48}
                            height={48}
                            alt={item.property.product.title}
                            className="object-contain w-full h-full"
                          />
                        </div>
                      ))}
                      {order.orderItems.length > 3 && (
                        <span className="text-sm text-gray-500">+{order.orderItems.length - 3} more</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => openOrderDetails(order)}
                      variant="secondary"
                      className="flex items-center gap-2"
                    >
                      <EyeIcon className="w-4 h-4" />
                      View Details
                    </Button>
                    <Link href={`/track-order?id=${order.id}`}>
                      <Button variant="primary" className="w-full sm:w-auto">
                        Track Order
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                variant="secondary"
              >
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return (
                    <Button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      variant={currentPage === pageNum ? "primary" : "secondary"}
                      className="w-10 h-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                variant="secondary"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                <button onClick={closeOrderDetails} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Order Summary */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-semibold text-gray-900">Order #{selectedOrder.id}</span>
                  <div
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getOrderStatusColor(
                      selectedOrder.status
                    )}`}
                  >
                    {getStatusIcon(selectedOrder.status)}
                    {formatOrderStatus(selectedOrder.status)}
                  </div>
                </div>
                <div className="text-sm text-gray-600">Ordered on {formatDate(selectedOrder.createdAt)}</div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Items Ordered</h3>
                <div className="space-y-3">
                  {selectedOrder.orderItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                      <div className="w-16 h-16 rounded-md overflow-hidden border border-gray-200 flex-shrink-0">
                        <Image
                          src={item.property.product.image || "/placeholder-product.png"}
                          width={64}
                          height={64}
                          alt={item.property.product.title}
                          className="object-contain w-full h-full"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.property.product.title}</h4>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-sm text-gray-600">Price: €{formatPrice(Number(item.retailPrice))}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          €{formatPrice(Number(item.retailPrice) * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Total */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-gray-900">€{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <Link href={`/track-order?id=${selectedOrder.id}`} className="flex-1">
                  <Button variant="primary" className="w-full">
                    Track This Order
                  </Button>
                </Link>
                {selectedOrder.status === OrderStatus.DELIVERED && (
                  <Button variant="secondary" className="flex-1">
                    Reorder Items
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
