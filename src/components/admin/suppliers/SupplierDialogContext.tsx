import React, { createContext, useContext, useState, ReactNode } from "react";
import { TSupplier } from "@/services/supplier";

export type SupplierDialogMode = "add" | "edit" | "view";

interface SupplierDialogContextType {
  // Dialog states
  isOpen: boolean;
  mode: SupplierDialogMode;
  selectedSupplier: TSupplier | null;

  // Dialog actions
  openAddDialog: () => void;
  openEditDialog: (supplier: TSupplier) => void;
  openViewDialog: (supplier: TSupplier) => void;
  closeDialog: () => void;

  // Form state
  formData: Partial<TSupplier>;
  setFormData: (data: Partial<TSupplier>) => void;
  resetFormData: () => void;

  // Loading states
  isSubmitting: boolean;
  setIsSubmitting: (loading: boolean) => void;
}

const SupplierDialogContext = createContext<SupplierDialogContextType | null>(null);

export const useSupplierDialog = () => {
  const context = useContext(SupplierDialogContext);
  if (!context) {
    throw new Error("useSupplierDialog must be used within a SupplierDialogProvider");
  }
  return context;
};

interface SupplierDialogProviderProps {
  children: ReactNode;
  onSupplierCreated?: (supplier: TSupplier) => void;
  onSupplierUpdated?: (supplier: TSupplier) => void;
  onSupplierDeleted?: (id: number) => void;
}

const defaultFormData: Partial<TSupplier> = {
  name: "",
};

export const SupplierDialogProvider: React.FC<SupplierDialogProviderProps> = ({
  children,
  onSupplierCreated,
  onSupplierUpdated,
  onSupplierDeleted,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<SupplierDialogMode>("add");
  const [selectedSupplier, setSelectedSupplier] = useState<TSupplier | null>(null);
  const [formData, setFormData] = useState<Partial<TSupplier>>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openAddDialog = () => {
    setMode("add");
    setSelectedSupplier(null);
    setFormData(defaultFormData);
    setIsOpen(true);
  };

  const openEditDialog = (supplier: TSupplier) => {
    setMode("edit");
    setSelectedSupplier(supplier);
    setFormData({
      id: supplier.id,
      name: supplier.name,
      createdAt: supplier.createdAt,
      updatedAt: supplier.updatedAt,
    });
    setIsOpen(true);
  };

  const openViewDialog = (supplier: TSupplier) => {
    setMode("view");
    setSelectedSupplier(supplier);
    setFormData({
      id: supplier.id,
      name: supplier.name,
      createdAt: supplier.createdAt,
      updatedAt: supplier.updatedAt,
    });
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setMode("add");
    setSelectedSupplier(null);
    setFormData(defaultFormData);
    setIsSubmitting(false);
  };

  const resetFormData = () => {
    setFormData(defaultFormData);
  };

  const contextValue: SupplierDialogContextType = {
    isOpen,
    mode,
    selectedSupplier,
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

  return <SupplierDialogContext.Provider value={contextValue}>{children}</SupplierDialogContext.Provider>;
};
