import React, { createContext, useContext, useState, ReactNode } from "react";
import { TOrder } from "@/services/order";

export type OrderDialogMode = "add" | "edit" | "view" | "process";

interface OrderDialogContextType {
  // Dialog states
  isOpen: boolean;
  mode: OrderDialogMode;
  selectedOrder: TOrder | null;

  // Dialog actions
  openAddDialog: () => void;
  openEditDialog: (order: TOrder) => void;
  openViewDialog: (order: TOrder) => void;
  openProcessDialog: (order: TOrder) => void;
  closeDialog: () => void;

  // Form state
  formData: Partial<TOrder>;
  setFormData: (data: Partial<TOrder>) => void;
  resetFormData: () => void;

  // Loading states
  isSubmitting: boolean;
  setIsSubmitting: (loading: boolean) => void;
}

const OrderDialogContext = createContext<OrderDialogContextType | null>(null);

export const useOrderDialog = () => {
  const context = useContext(OrderDialogContext);
  if (!context) {
    throw new Error("useOrderDialog must be used within an OrderDialogProvider");
  }
  return context;
};

interface OrderDialogProviderProps {
  children: ReactNode;
  onOrderCreated?: (order: TOrder) => void;
  onOrderUpdated?: (order: TOrder) => void;
  onOrderDeleted?: (id: number) => void;
}

const defaultFormData: Partial<TOrder> = {
  total: 0,
  status: "pending",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const OrderDialogProvider: React.FC<OrderDialogProviderProps> = ({
  children,
  onOrderCreated,
  onOrderUpdated,
  onOrderDeleted,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<OrderDialogMode>("add");
  const [selectedOrder, setSelectedOrder] = useState<TOrder | null>(null);
  const [formData, setFormData] = useState<Partial<TOrder>>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openAddDialog = () => {
    setMode("add");
    setSelectedOrder(null);
    setFormData(defaultFormData);
    setIsOpen(true);
  };

  const openEditDialog = (order: TOrder) => {
    setMode("edit");
    setSelectedOrder(order);
    // setFormData({
    //   id: supplier.id,
    //   name: supplier.name,
    //   createdAt: supplier.createdAt,
    //   updatedAt: supplier.updatedAt,
    // });
    setIsOpen(true);
  };

  const openViewDialog = (order: TOrder) => {
    setMode("view");
    setSelectedOrder(order);
    // setFormData({
    //   id: supplier.id,
    //   name: supplier.name,
    //   createdAt: supplier.createdAt,
    //   updatedAt: supplier.updatedAt,
    // });
    setIsOpen(true);
  };

  const openProcessDialog = (order: TOrder) => {
    setMode("process");
    setSelectedOrder(order);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setMode("add");
    setSelectedOrder(null);
    setFormData(defaultFormData);
    setIsSubmitting(false);
  };

  const resetFormData = () => {
    setFormData(defaultFormData);
  };

  const contextValue: OrderDialogContextType = {
    isOpen,
    mode,
    selectedOrder,
    openAddDialog,
    openEditDialog,
    openViewDialog,
    openProcessDialog,
    closeDialog,
    formData,
    setFormData,
    resetFormData,
    isSubmitting,
    setIsSubmitting,
  };

  return <OrderDialogContext.Provider value={contextValue}>{children}</OrderDialogContext.Provider>;
};
