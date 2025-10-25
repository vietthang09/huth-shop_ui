import { Post } from "./blog";
import { InventoryImport } from "./inventory";
import { Log } from "./log";
import { Order } from "./order";

export type TUser = {
  id: number;
  fullname: string | null;
  email: string;
  password: string;
  role: string | null;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  lastLogin: Date | null;
  posts: Post[];
  logs: Log[];
  orders: Order[];
  inventoryImports?: InventoryImport[];
};
