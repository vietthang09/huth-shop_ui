"use client";

import { ChangeEvent } from "react";
import Input from "@/components/UI/input";
import { TBlogFormValues } from "@/types/blog";
import ProductSunEditor from "@/components/admin/product/sunEditor";

interface BlogFormProps {
  blog: TBlogFormValues;
  onChange: (blog: TBlogFormValues) => void;
}

const BlogForm = ({ blog, onChange }: BlogFormProps) => {
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      onChange({
        ...blog,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else {
      onChange({
        ...blog,
        [name]: value,
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-2">
        <label htmlFor="title" className="text-sm font-medium">
          Title
        </label>
        <Input
          id="title"
          name="title"
          value={blog.title}
          onChange={handleInputChange}
          type="text"
          placeholder="Blog title"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="slug" className="text-sm font-medium">
          Slug
        </label>
        <Input
          id="slug"
          name="slug"
          value={blog.slug}
          onChange={handleInputChange}
          type="text"
          placeholder="blog-post-slug"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="shortText" className="text-sm font-medium">
          Short Description
        </label>
        <textarea
          id="shortText"
          name="shortText"
          value={blog.shortText}
          onChange={handleInputChange}
          placeholder="Short description"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="imgUrl" className="text-sm font-medium">
          Image URL
        </label>
        <Input
          id="imgUrl"
          name="imgUrl"
          value={blog.imgUrl}
          onChange={handleInputChange}
          type="text"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Content</label>
        <ProductSunEditor value={blog.content} onChange={(content) => onChange({ ...blog, content })} />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="isPublished"
          name="isPublished"
          type="checkbox"
          checked={blog.isPublished}
          onChange={(e) => onChange({ ...blog, isPublished: e.target.checked })}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="isPublished" className="text-sm font-medium">
          Publish
        </label>
      </div>
    </div>
  );
};

export default BlogForm;
