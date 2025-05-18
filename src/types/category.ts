import { Product } from "./product";

export type Category = {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  products: Productt[];
};