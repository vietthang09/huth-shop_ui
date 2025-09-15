// types.ts
export interface Product {
    id: string;
    name: string;
    price: number;
    // Add other product properties as needed
}

export interface CartItem extends Product {
    quantity: number;
}

export interface CartState {
    cartItems: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
}