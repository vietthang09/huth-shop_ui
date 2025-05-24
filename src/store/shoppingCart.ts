import { PayloadAction, configureStore, createSlice } from "@reduxjs/toolkit";

// Define type locally to avoid import issues
type TCartItem = {
  productId: string;
  quantity: number;
  variantId?: number | null;
};

import { loadState, saveState } from "./storeLocalStorage";

export type TCartState = {
  items: TCartItem[];
  isVisible: boolean;
};

type QuantityChange = {
  productId: string;
  amount: number;
};

const initialState: TCartState = { isVisible: false, items: [] };

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    add: (state: TCartState, action: PayloadAction<TCartItem>) => {
      // Find if the same product with the same variant ID exists
      const isAvailable = state.items.findIndex(
        (item) => item.productId === action.payload.productId && item.variantId === action.payload.variantId
      );

      if (isAvailable > -1) {
        state.items[isAvailable].quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      state.isVisible = true;
    },
    toggleCart: (state: TCartState, action: PayloadAction<boolean>) => {
      state.isVisible = action.payload.valueOf();
    },
    remove: (state: TCartState, action: PayloadAction<{ productId: string; variantId?: number | null }>) => {
      state.items = state.items.filter(
        (item) => !(item.productId === action.payload.productId && item.variantId === action.payload.variantId)
      );
    },
    modifyQuantity: (state: TCartState, action: PayloadAction<QuantityChange & { variantId?: number | null }>) => {
      state.items.map((item) =>
        item.productId === action.payload.productId && item.variantId === action.payload.variantId
          ? (item.quantity += action.payload.amount)
          : ""
      );
    },
    clearCart: (state: TCartState) => {
      state.items = [];
      state.isVisible = false;
    },
  },
});

export const shoppingCartStore = configureStore({
  reducer: {
    cart: cartSlice.reducer,
  },
  preloadedState: loadState(),
});
shoppingCartStore.subscribe(() => {
  saveState(shoppingCartStore.getState());
});

export type RootState = ReturnType<typeof shoppingCartStore.getState>;
export type AppDispatch = typeof shoppingCartStore.dispatch;

export const { add, remove, modifyQuantity, toggleCart, clearCart } = cartSlice.actions;
