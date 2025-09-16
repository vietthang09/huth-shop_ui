// types.ts
export interface Product {
    id: number;
    name: string;
    price: number;
}

export interface CartItem extends Product {
    quantity: number;
}

export interface CartState {
    cartItems: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
}