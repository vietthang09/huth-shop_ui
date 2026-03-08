import React, { createContext, useContext, useState, ReactNode } from "react";
import { Coupon, DiscountType } from "@/services/type";

export type CouponDialogMode = "add" | "edit" | "view";

interface CouponDialogContextType {
  // Dialog states
  isOpen: boolean;
  mode: CouponDialogMode;
  selectedCoupon: Coupon | null;

  // Dialog actions
  openAddDialog: () => void;
  openEditDialog: (coupon: Coupon) => void;
  openViewDialog: (coupon: Coupon) => void;
  closeDialog: () => void;

  // Form state
  formData: Partial<Coupon>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Coupon>>>;
  resetFormData: () => void;

  // Loading states
  isSubmitting: boolean;
  setIsSubmitting: (loading: boolean) => void;
}

const CouponDialogContext = createContext<CouponDialogContextType | null>(null);

export const useCouponDialog = () => {
  const context = useContext(CouponDialogContext);
  if (!context) {
    throw new Error("useCouponDialog must be used within a CouponDialogProvider");
  }
  return context;
};

interface CouponDialogProviderProps {
  children: ReactNode;
  onCouponCreated?: (coupon: Coupon) => void;
  onCouponUpdated?: (coupon: Coupon) => void;
  onCouponDeleted?: (id: number) => void;
}

const defaultFormData: Partial<Coupon> = {
  code: "",
  description: "",
  discountType: DiscountType.PERCENTAGE,
  discountValue: 0,
  minOrderAmount: 0,
  maxDiscountAmount: 0,
  maxUses: 1,
  usedCount: 0,
  maxUsesPerUser: 1,
  isActive: true,
  usages: [],
};

export const CouponDialogProvider: React.FC<CouponDialogProviderProps> = ({
  children,
  onCouponCreated: _onCouponCreated,
  onCouponUpdated: _onCouponUpdated,
  onCouponDeleted: _onCouponDeleted,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<CouponDialogMode>("add");
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState<Partial<Coupon>>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openAddDialog = () => {
    setMode("add");
    setSelectedCoupon(null);
    setFormData(defaultFormData);
    setIsOpen(true);
  };

  const openEditDialog = (coupon: Coupon) => {
    setMode("edit");
    setSelectedCoupon(coupon);
    setFormData({
      ...coupon,
    });
    setIsOpen(true);
  };

  const openViewDialog = (coupon: Coupon) => {
    setMode("view");
    setSelectedCoupon(coupon);
    setFormData({
      ...coupon,
    });
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setMode("add");
    setSelectedCoupon(null);
    setFormData(defaultFormData);
    setIsSubmitting(false);
  };

  const resetFormData = () => {
    setFormData(defaultFormData);
  };

  const contextValue: CouponDialogContextType = {
    isOpen,
    mode,
    selectedCoupon,
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

  return <CouponDialogContext.Provider value={contextValue}>{children}</CouponDialogContext.Provider>;
};

// Backward compatibility while older imports are still being migrated.
export const useProductDialog = useCouponDialog;
export type ProductDialogMode = CouponDialogMode;
