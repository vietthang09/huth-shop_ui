import { Property } from "./property";
import { User } from "./user";
import { Supplier } from "./supplier";

export type Inventory = {
  id: number;
  propertiesId: number;
  property: Property;
  quantity: number;
  importItems?: InventoryImportItem[];
};

// Types for inventory management
export interface InventoryItem {
  id: number;
  propertiesId: number;
  quantity: number;
  property?: PropertyWithDetails;
}

export interface PropertyWithDetails {
  id: number;
  productId: number;
  attributeSetHash: string;
  netPrice: number;
  retailPrice: number;
  salePrice?: number | null;
  createdAt: Date;
  updatedAt: Date;
  product?: {
    id: number;
    sku: string;
    title: string;
    description?: string | null;
    image?: string | null;
    [key: string]: any;
  };
  attributeSet?: {
    id: number;
    name?: string | null;
    value?: string | null;
    unit?: string | null;
    propertiesHash: string;
  };
}

export interface InventoryAvailability {
  isAvailable: boolean;
  availableQuantity: number;
  requestedQuantity: number;
  message: string;
}

export interface OrderItem {
  propertyId: number;
  quantity: number;
}

export interface InventoryUpdateResult {
  success: boolean;
  message: string;
  results?: any[];
  item?: OrderItem;
}

// Enums for inventory import feature
export enum ImportPaymentStatus {
  PENDING = "PENDING",
  PARTIALLY_PAID = "PARTIALLY_PAID",
  PAID = "PAID",
  CANCELLED = "CANCELLED",
}

export enum ImportStatus {
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

// Types for inventory import feature
export interface InventoryImport {
  id: number;
  userId: number;
  user?: User;
  supplierId: number;
  supplier?: Supplier;
  reference?: string;
  description?: string;
  totalAmount: number;
  paymentStatus: ImportPaymentStatus;
  importStatus: ImportStatus;
  createdAt: Date;
  updatedAt: Date;
  importItems?: InventoryImportItem[];
}

export interface InventoryImportItem {
  id: number;
  importId: number;
  import?: InventoryImport;
  propertiesId: number;
  property?: Property;
  inventoryId: number;
  inventory?: Inventory;
  quantity: number;
  netPrice: number;
  warrantyPeriod?: number;
  warrantyExpiry?: Date;
  notes?: string;
}

// DTOs for inventory import management
export interface CreateInventoryImportDTO {
  userId: number;
  supplierId: number;
  reference?: string;
  description?: string;
  totalAmount: number;
  paymentStatus?: ImportPaymentStatus;
  importStatus?: ImportStatus;
  importItems: CreateInventoryImportItemDTO[];
}

export interface CreateInventoryImportItemDTO {
  propertiesId: number;
  quantity: number;
  netPrice: number;
  warrantyPeriod?: number;
  warrantyExpiry?: Date;
  notes?: string;
}

export interface UpdateImportStatusDTO {
  importId: number;
  importStatus: ImportStatus;
}

export interface UpdateImportPaymentStatusDTO {
  importId: number;
  paymentStatus: ImportPaymentStatus;
}

export interface ImportSummary {
  id: number;
  reference?: string;
  supplierName: string;
  userName: string;
  totalAmount: number;
  itemCount: number;
  paymentStatus: ImportPaymentStatus;
  importStatus: ImportStatus;
  createdAt: Date;
}

export interface ImportDetails {
  id: number;
  userId: number;
  supplierId: number;
  reference?: string;
  description?: string;
  totalAmount: number;
  paymentStatus: ImportPaymentStatus;
  importStatus: ImportStatus;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    fullname?: string;
    email: string;
  };
  supplier: {
    id: number;
    name: string;
  };
  importItems: Array<
    InventoryImportItem & {
      property: PropertyWithDetails;
    }
  >;
}

// Types for pending imports checking
export interface PendingImportInfo {
  hasPending: boolean;
  pendingImports: PendingImport[];
}

export interface PendingImport {
  importId: number;
  importStatus: ImportStatus;
  reference?: string;
  quantity: number;
}

// Types for inventory history
export interface InventoryHistoryItem {
  id: number;
  importId: number;
  date: Date;
  quantity: number;
  netPrice: number;
  supplier: string;
  createdBy: string;
  reference?: string;
  warrantyPeriod?: number;
  warrantyExpiry?: Date;
}

// Types for import dashboard
export interface ImportDashboardSummary {
  statusCounts: {
    draft: number;
    pending: number;
    processing: number;
    completed: number;
    cancelled: number;
  };
  paymentCounts: {
    pending: number;
    partiallyPaid: number;
    paid: number;
    cancelled: number;
  };
  recentImports: ImportSummary[];
  totalValue: number;
}

// Types for filtering imports
export interface ImportFilterParams {
  importStatus?: ImportStatus;
  paymentStatus?: ImportPaymentStatus;
  startDate?: Date;
  endDate?: Date;
  supplierId?: number;
  query?: string;
}

// Types for bulk operations
export interface BulkImportUpdateDTO {
  importIds: number[];
  action: "cancel" | "process" | "markAsPaid" | "markAsPartiallyPaid";
}

export interface ImportProcessResult {
  success: boolean;
  message: string;
  processedImport?: InventoryImport;
  updatedInventory?: { id: number; propertiesId: number; newQuantity: number }[];
}

// Types for product warranty information
export interface ProductWarrantyInfo {
  importId: number;
  importReference?: string;
  importDate: Date;
  warrantyPeriod?: number;
  warrantyExpiry?: Date;
  warrantyStatus: "active" | "expired" | "unknown";
  daysRemaining: number;
}
