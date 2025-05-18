// Updated to fix imports
export type TCartItem = {
  productId: string;
  quantity: number;
  variantId?: number | null;
};

export type TCartItemData = {
  productId: string;
  productName: string;
  imgUrl: string;
  price: number;
  dealPrice?: number;
  quantity: number;
  variantId?: number | null;
  variantAttributes?: string;
};
