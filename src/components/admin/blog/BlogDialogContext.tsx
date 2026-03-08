import React, { createContext, useContext, useState, ReactNode } from "react";
import { Blog } from "@/services/type";

export type BlogDialogMode = "add" | "edit" | "view";

interface BlogDialogContextType {
  isOpen: boolean;
  mode: BlogDialogMode;
  selectedBlog: Blog | null;
  openAddDialog: () => void;
  openEditDialog: (blog: Blog) => void;
  openViewDialog: (blog: Blog) => void;
  closeDialog: () => void;
  formData: Partial<Blog>;
  setFormData: (data: Partial<Blog>) => void;
  resetFormData: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (loading: boolean) => void;
}

const BlogDialogContext = createContext<BlogDialogContextType | null>(null);

export const useBlogDialog = () => {
  const context = useContext(BlogDialogContext);
  if (!context) {
    throw new Error("useBlogDialog must be used within a BlogDialogProvider");
  }
  return context;
};

interface BlogDialogProviderProps {
  children: ReactNode;
}

const defaultFormData: Partial<Blog> = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  thumbnail: "",
  tags: [],
};

export const BlogDialogProvider: React.FC<BlogDialogProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<BlogDialogMode>("add");
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [formData, setFormData] = useState<Partial<Blog>>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openAddDialog = () => {
    setMode("add");
    setSelectedBlog(null);
    setFormData(defaultFormData);
    setIsOpen(true);
  };

  const openEditDialog = (blog: Blog) => {
    setMode("edit");
    setSelectedBlog(blog);
    setFormData({
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      content: blog.content,
      thumbnail: blog.thumbnail,
      status: blog.status,
      tags: blog.tags,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
    });
    setIsOpen(true);
  };

  const openViewDialog = (blog: Blog) => {
    setMode("view");
    setSelectedBlog(blog);
    setFormData({
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      content: blog.content,
      thumbnail: blog.thumbnail,
      status: blog.status,
      tags: blog.tags,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
    });
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setMode("add");
    setSelectedBlog(null);
    setFormData(defaultFormData);
    setIsSubmitting(false);
  };

  const resetFormData = () => {
    setFormData(defaultFormData);
  };

  const contextValue: BlogDialogContextType = {
    isOpen,
    mode,
    selectedBlog,
    openAddDialog,
    openEditDialog,
    openViewDialog,
    closeDialog,
    formData,
    setFormData,
    resetFormData,
    isSubmitting,
    setIsSubmitting,
  };

  return <BlogDialogContext.Provider value={contextValue}>{children}</BlogDialogContext.Provider>;
};
