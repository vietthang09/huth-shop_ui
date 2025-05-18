// Types for frontend order handling

export type TOrderItem = {
  productId: string;
  quantity: number;
  price: number;
  totalPrice: number;
  variantId?: number | null;
  variantAttributes?: string;
};

// Shipping information type
export type TShippingInfo = {
  fullName: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
};
