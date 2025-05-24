import { Property } from "./property";

export type Inventory = {
  id: number;
  propertiesId: number;
  property: Property;
  quantity: number;
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
