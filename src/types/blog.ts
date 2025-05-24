import { Log } from "./log";
import { User } from "./user";

export type Post = {
  id: number;
  userId: number | null;
  user: User | null;
  topicId: number | null;
  topic: Topic | null;
  slug: string;
  title: string;
  shortDescription: string | null;
  content: string | null;
  cover: string | null;
  createdAt: Date;
  updatedAt: Date;
  logs: Log[];
};

export type Topic = {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  _count?: {
    posts: number;
  };
};

export type TBlogFormValues = {
  title: string;
  slug: string;
  shortText: string;
  content: string;
  imgUrl: string;
  isPublished: boolean;
  topicId?: number;
};
