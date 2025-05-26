import { InventoryImport } from "./inventory";
import { Product } from "./product";

export type Supplier = {
  id: number;
  name: string;
  products: Product[];
  inventoryImports?: InventoryImport[];
};
