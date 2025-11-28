// store/cartStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartState } from "./types";
import { TProduct } from "../services/product";

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartItems: [],
      addToCart: (product: TProduct, variantId?: number) => {
        set((state) => {
          const existingItem = state.cartItems.find(
            (item) => item.product.id === product.id && item.variantId === variantId,
          );
          if (existingItem) {
            return {
              cartItems: state.cartItems.map((item) =>
                item.product.id === product.id && item.variantId === variantId
                  ? { ...item, quantity: item.quantity + 1 }
                  : item,
              ),
            };
          } else {
            return {
              cartItems: [...state.cartItems, { product, quantity: 1, variantId }],
            };
          }
        });
      },
      removeFromCart: (productId: number, variantId?: number) => {
        set((state) => ({
          cartItems: state.cartItems.filter((item) => !(item.product.id === productId && item.variantId === variantId)),
        }));
      },
      updateQuantity: (productId: number, quantity: number, variantId?: number) => {
        set((state) => ({
          cartItems: state.cartItems.map((item) =>
            item.product.id === productId && item.variantId === variantId
              ? { ...item, quantity: Math.max(1, quantity) }
              : item,
          ),
        }));
      },
      clearCart: () => {
        set({ cartItems: [] });
      },
      getTotalItems: () => {
        const state = get();
        return state.cartItems.reduce((total, item) => total + item.quantity, 0);
      },
      getTotalPrice: () => {
        const state = get();
        return state.cartItems.reduce((total, item) => {
          // Get price from variant if available
          const variant = item.variantId ? item.product.variants?.find((v) => v.id === item.variantId) : null;
          const price = variant?.retailPrice || 0;
          return total + price * item.quantity;
        }, 0);
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
