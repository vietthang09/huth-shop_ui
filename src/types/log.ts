import { Post } from "./blog";
import { Product } from "./product";
import { User } from "./user";

export type Log = {
  id: number;
  userId: number | null;
  user: User | null;
  productId: number | null;
  product: Product | null;
  postId: number | null;
  post: Post | null;
  title: string | null;
  description: string | null;
  createdAt: Date;
};
