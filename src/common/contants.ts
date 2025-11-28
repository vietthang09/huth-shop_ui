export enum ProductVariantKind {
  OWNERSHIP_UPGRADE = "ownership_upgrade",
  PRE_MADE_ACCOUNT = "pre_made_account",
  SHARING = "sharing",
}

export enum OrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  PROCESSING = "processing",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
}

export enum ProductSortBy {
  CREATED_AT = "createdAt",
  UPDATED_AT = "updatedAt",
  TITLE = "title",
  PRICE = "price",
}

export enum SortOrder {
  ASC = "ASC",
  DESC = "DESC",
}

export enum PaymentMethod {
  BANK_TRANSFER = "bank_transfer",
  MOMO = "momo",
  ViettelPay = "viettelpay",
}
