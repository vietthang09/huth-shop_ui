export type TBlogFormValues = {
  title: string;
  content: string;
  shortText: string;
  imgUrl: string;
  slug: string;
  isPublished: boolean;
};

export type TBlog = TBlogFormValues & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  authorId?: string;
};
