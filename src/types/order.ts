import { OrderStatus } from "@prisma/client";

export type TOrderItem = {
  productId: string;
  quantity: number;
  price: number;
  totalPrice: number;
  product?: {
    name: string;
    images: string[];
    id: string;
  };
};

export type TShippingInfo = {
  fullName: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
};

export type TPaymentInfo = {
  amount: number;
  method: string;
  status: string;
  transactionId?: string;
  paidAt?: Date;
};

export type TOrder = {
  id: string;
  userId: string;
  status: OrderStatus;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  orderItems: TOrderItem[];
  shippingInfo?: TShippingInfo;
  paymentInfo?: TPaymentInfo;
  user?: {
    name: string;
    email: string;
  };
};
