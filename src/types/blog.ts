import { Log } from "./log";
import { User } from "./user";

export type Post = {
  id: number;
  userId: number | null;
  user: User | null;
  slug: string;
  title: string;
  shortDescription: string | null;
  content: string | null;
  cover: string | null;
  createdAt: Date;
  updatedAt: Date;
  logs: Log[];
};
