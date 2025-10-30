import { ProductVariantKind } from "./contants";

export function mapVariantKindToLabel(kind: ProductVariantKind | undefined): string {
  switch (kind) {
    case ProductVariantKind.OWNERSHIP_UPGRADE:
      return "Nâng cấp chính chủ";
    case ProductVariantKind.PRE_MADE_ACCOUNT:
      return "Tài khoản tạo sẵn";
    case ProductVariantKind.SHARING:
      return "Share";
    default:
      return "Không xác định";
  }
}
