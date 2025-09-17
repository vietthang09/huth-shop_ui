// store/cartStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartState } from './types';

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            cartItems: [],
            addToCart: (product) => {
                set((state) => {
                    const existingItem = state.cartItems.find((item) => item.id === product.id);
                    if (existingItem) {
                        return {
                            cartItems: state.cartItems.map((item) =>
                                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                            ),
                        };
                    } else {
                        return { cartItems: [...state.cartItems, { ...product, quantity: 1 }] };
                    }
                });
            },
            removeFromCart: (productId) => {
                set((state) => ({
                    cartItems: state.cartItems.filter((item) => item.id !== productId),
                }));
            },
            updateQuantity: (productId, quantity) => {
                set((state) => ({
                    cartItems: state.cartItems.map((item) =>
                        item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
                    ),
                }));
            },
            clearCart: () => {
                set({ cartItems: [] });
            },
        }),
        {
            name: 'cart-storage', 
            storage: createJSONStorage(() => sessionStorage), 
        }
    )
);