import React, { createContext, useContext, useState, ReactNode } from "react";
import { TCategory } from "@/services/category";

export type CategoryDialogMode = "add" | "edit" | "view";

interface CategoryDialogContextType {
  // Dialog states
  isOpen: boolean;
  mode: CategoryDialogMode;
  selectedCategory: TCategory | null;

  // Dialog actions
  openAddDialog: () => void;
  openEditDialog: (category: TCategory) => void;
  openViewDialog: (category: TCategory) => void;
  closeDialog: () => void;

  // Form state
  formData: Partial<TCategory>;
  setFormData: (data: Partial<TCategory>) => void;
  resetFormData: () => void;

  // Loading states
  isSubmitting: boolean;
  setIsSubmitting: (loading: boolean) => void;
}

const CategoryDialogContext = createContext<CategoryDialogContextType | null>(null);

export const useCategoryDialog = () => {
  const context = useContext(CategoryDialogContext);
  if (!context) {
    throw new Error("useCategoryDialog must be used within a CategoryDialogProvider");
  }
  return context;
};

interface CategoryDialogProviderProps {
  children: ReactNode;
  onCategoryCreated?: (category: TCategory) => void;
  onCategoryUpdated?: (category: TCategory) => void;
  onCategoryDeleted?: (id: number) => void;
}

const defaultFormData: Partial<TCategory> = {
  title: "",
  description: "",
  image: "",
};

export const CategoryDialogProvider: React.FC<CategoryDialogProviderProps> = ({
  children,
  onCategoryCreated,
  onCategoryUpdated,
  onCategoryDeleted,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<CategoryDialogMode>("add");
  const [selectedCategory, setSelectedCategory] = useState<TCategory | null>(null);
  const [formData, setFormData] = useState<Partial<TCategory>>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openAddDialog = () => {
    setMode("add");
    setSelectedCategory(null);
    setFormData(defaultFormData);
    setIsOpen(true);
  };

  const openEditDialog = (category: TCategory) => {
    setMode("edit");
    setSelectedCategory(category);
    setFormData({
      id: category.id,
      title: category.title,
      description: category.description,
      image: category.image,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    });
    setIsOpen(true);
  };

  const openViewDialog = (category: TCategory) => {
    setMode("view");
    setSelectedCategory(category);
    setFormData({
      id: category.id,
      title: category.title,
      description: category.description,
      image: category.image,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    });
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setMode("add");
    setSelectedCategory(null);
    setFormData(defaultFormData);
    setIsSubmitting(false);
  };

  const resetFormData = () => {
    setFormData(defaultFormData);
  };

  const contextValue: CategoryDialogContextType = {
    isOpen,
    mode,
    selectedCategory,
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

  return <CategoryDialogContext.Provider value={contextValue}>{children}</CategoryDialogContext.Provider>;
};
