import { OrderStatus } from "@prisma/client";

// Types for order operations
export interface OrderFilters {
    status?: OrderStatus;
    userId?: number;
    startDate?: Date;
    endDate?: Date;
    minTotal?: number;
    maxTotal?: number;
}

export interface OrderStatistics {
    totalRevenue: number;
    totalOrders: number;
    ordersByStatus: Array<{
        status: OrderStatus;
        _count: { id: number };
    }>;
    timeSeriesData: Array<{
        period: string;
        count: number;
        revenue: number;
        items: number;
    }>;
    topProducts: Array<{
        propertyId: number;
        productTitle: string;
        productImage: string | null;
        quantitySold: number;
        revenue: number;
    }>;
    averageOrderValue: number;
}

export interface Pagination {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
}

// Types for order responses
export interface OrderResponse<T> {
    success: boolean;
    order?: T;
    error?: string;
}

export interface OrdersResponse<T> {
    success: boolean;
    orders?: T[];
    pagination?: Pagination;
    error?: string;
}

export interface StatisticsResponse {
    success: boolean;
    statistics?: OrderStatistics;
    error?: string;
}
