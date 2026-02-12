import { Product } from "@/services/type";

export type TApiError = {
  statusCode: number;
  error: string;
  message: string | string[];
};

export interface CartItem {
  product: Product;
  quantity: number;
  variantId?: number;
  /**
   * User-provided values for product variant fields (if any).
   * Example: { Size: 'XL', Note: 'Gift wrap' }
   */
  fields?: Record<string, any>;
}

export interface CartState {
  cartItems: CartItem[];
  addToCart: (product: Product, variantId?: number, fields?: Record<string, any>) => void;
  removeFromCart: (productId: number, variantId?: number) => void;
  updateQuantity: (productId: number, quantity: number, variantId?: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}
