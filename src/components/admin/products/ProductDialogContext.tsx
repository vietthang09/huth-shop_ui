import React, { createContext, useContext, useState, ReactNode } from "react";
import { TProduct } from "@/services/product";

export type ProductDialogMode = "add" | "edit" | "view";

interface ProductDialogContextType {
  // Dialog states
  isOpen: boolean;
  mode: ProductDialogMode;
  selectedProduct: TProduct | null;

  // Dialog actions
  openAddDialog: () => void;
  openEditDialog: (product: TProduct) => void;
  openViewDialog: (product: TProduct) => void;
  closeDialog: () => void;

  // Form state
  formData: Partial<TProduct>;
  setFormData: (data: Partial<TProduct>) => void;
  resetFormData: () => void;

  // Loading states
  isSubmitting: boolean;
  setIsSubmitting: (loading: boolean) => void;
}

const ProductDialogContext = createContext<ProductDialogContextType | null>(null);

export const useProductDialog = () => {
  const context = useContext(ProductDialogContext);
  if (!context) {
    throw new Error("useProductDialog must be used within a ProductDialogProvider");
  }
  return context;
};

interface ProductDialogProviderProps {
  children: ReactNode;
  onProductCreated?: (product: TProduct) => void;
  onProductUpdated?: (product: TProduct) => void;
  onProductDeleted?: (id: number) => void;
}

const defaultFormData: Partial<TProduct> = {
  sku: "",
  title: "",
  description: "",
  categoryId: 0,
  images: [],
};

export const ProductDialogProvider: React.FC<ProductDialogProviderProps> = ({
  children,
  onProductCreated,
  onProductUpdated,
  onProductDeleted,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ProductDialogMode>("add");
  const [selectedProduct, setSelectedProduct] = useState<TProduct | null>(null);
  const [formData, setFormData] = useState<Partial<TProduct>>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openAddDialog = () => {
    setMode("add");
    setSelectedProduct(null);
    setFormData(defaultFormData);
    setIsOpen(true);
  };

  const openEditDialog = (product: TProduct) => {
    setMode("edit");
    setSelectedProduct(product);
    setFormData({
      id: product.id,
      sku: product.sku,
      title: product.title,
      description: product.description,
      categoryId: product.categoryId,
      images: product.images,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    });
    setIsOpen(true);
  };

  const openViewDialog = (product: TProduct) => {
    setMode("view");
    setSelectedProduct(product);
    setFormData({
      id: product.id,
      sku: product.sku,
      title: product.title,
      description: product.description,
      categoryId: product.categoryId,
      images: product.images,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    });
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setMode("add");
    setSelectedProduct(null);
    setFormData(defaultFormData);
    setIsSubmitting(false);
  };

  const resetFormData = () => {
    setFormData(defaultFormData);
  };

  const contextValue: ProductDialogContextType = {
    isOpen,
    mode,
    selectedProduct,
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

  return <ProductDialogContext.Provider value={contextValue}>{children}</ProductDialogContext.Provider>;
};
