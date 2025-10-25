import { TProduct } from "../services/product";

export type TApiError = {
  statusCode: number;
  error: string;
  message: string | string[];
};

export interface CartItem {
  product: TProduct;
  quantity: number;
  variantId?: number;
}

export interface CartState {
  cartItems: CartItem[];
  addToCart: (product: TProduct, variantId?: number) => void;
  removeFromCart: (productId: number, variantId?: number) => void;
  updateQuantity: (productId: number, quantity: number, variantId?: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}
