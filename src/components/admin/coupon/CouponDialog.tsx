import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
  Select,
  Textarea,
} from "@/components/ui";
import { useCouponDialog } from "./CouponDialogContext";
import { create, update, remove, CreateCouponPayload, UpdateCouponPayload } from "@/services/coupon";
import { Coupon, DiscountType } from "@/services/type";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

type FormData = {
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: string;
  minOrderAmount: string;
  maxDiscountAmount: string;
  maxUses: string;
  maxUsesPerUser: string;
  isActive: "true" | "false";
  validFrom: string;
  validTo: string;
};

type FormErrors = {
  code?: string;
  description?: string;
  discountType?: string;
  discountValue?: string;
  minOrderAmount?: string;
  maxDiscountAmount?: string;
  maxUses?: string;
  maxUsesPerUser?: string;
  isActive?: string;
  validFrom?: string;
  validTo?: string;
};

const toDateTimeLocal = (value?: Date | string | null) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (num: number) => String(num).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
    date.getMinutes(),
  )}`;
};

const toDisplayDate = (value?: Date | string | null) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const createDefaultFormData = (coupon?: Coupon | null): FormData => ({
  code: coupon?.code || "",
  description: coupon?.description || "",
  discountType: coupon?.discountType || DiscountType.PERCENTAGE,
  discountValue: coupon ? String(coupon.discountValue) : "",
  minOrderAmount: coupon ? String(coupon.minOrderAmount) : "0",
  maxDiscountAmount: coupon ? String(coupon.maxDiscountAmount) : "1",
  maxUses: coupon ? String(coupon.maxUses) : "1",
  maxUsesPerUser: coupon ? String(coupon.maxUsesPerUser) : "1",
  isActive: String(coupon?.isActive ?? true) as "true" | "false",
  validFrom: toDateTimeLocal(coupon?.validFrom),
  validTo: toDateTimeLocal(coupon?.validTo),
});

export const CouponDialog: React.FC = () => {
  const { isOpen, mode, selectedCoupon, closeDialog, isSubmitting, setIsSubmitting } = useCouponDialog();

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [formData, setFormData] = React.useState<FormData>(createDefaultFormData());
  const [errors, setErrors] = React.useState<FormErrors>({});

  React.useEffect(() => {
    if (!isOpen) {
      setFormData(createDefaultFormData());
      setErrors({});
      setDeleteDialogOpen(false);
      return;
    }

    if (mode === "add") {
      setFormData(createDefaultFormData());
    } else {
      setFormData(createDefaultFormData(selectedCoupon));
    }

    setErrors({});
  }, [isOpen, mode, selectedCoupon]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    const nextErrors: FormErrors = {};

    const code = formData.code.trim().toUpperCase();
    const discountValue = Number(formData.discountValue);
    const minOrderAmount = Number(formData.minOrderAmount);
    const maxDiscountAmount = Number(formData.maxDiscountAmount);
    const maxUses = Number(formData.maxUses);
    const maxUsesPerUser = Number(formData.maxUsesPerUser);
    const validFromTime = new Date(formData.validFrom).getTime();
    const validToTime = new Date(formData.validTo).getTime();

    if (!code) {
      nextErrors.code = "Mã giảm giá là bắt buộc";
    } else if (code.length < 3) {
      nextErrors.code = "Mã giảm giá phải có ít nhất 3 ký tự";
    } else if (code.length > 50) {
      nextErrors.code = "Mã giảm giá không được vượt quá 50 ký tự";
    } else if (!/^[A-Z0-9_-]+$/.test(code)) {
      nextErrors.code = "Mã giảm giá chỉ gồm chữ hoa, số, gạch ngang và gạch dưới";
    }

    if (formData.description.trim().length > 500) {
      nextErrors.description = "Mô tả không được vượt quá 500 ký tự";
    }

    if (Number.isNaN(discountValue) || discountValue <= 0) {
      nextErrors.discountValue = "Giá trị giảm phải lớn hơn 0";
    } else if (formData.discountType === DiscountType.PERCENTAGE && discountValue > 100) {
      nextErrors.discountValue = "Giảm theo phần trăm không được vượt quá 100";
    }

    if (Number.isNaN(minOrderAmount) || minOrderAmount < 0) {
      nextErrors.minOrderAmount = "Giá trị đơn hàng tối thiểu phải lớn hơn hoặc bằng 0";
    }

    if (Number.isNaN(maxDiscountAmount) || maxDiscountAmount <= 0) {
      nextErrors.maxDiscountAmount = "Giảm tối đa phải lớn hơn 0";
    }

    if (Number.isNaN(maxUses) || maxUses < 1) {
      nextErrors.maxUses = "Số lượt sử dụng tối đa phải lớn hơn hoặc bằng 1";
    }

    if (Number.isNaN(maxUsesPerUser) || maxUsesPerUser < 1) {
      nextErrors.maxUsesPerUser = "Số lượt dùng mỗi người phải lớn hơn hoặc bằng 1";
    } else if (!Number.isNaN(maxUses) && maxUsesPerUser > maxUses) {
      nextErrors.maxUsesPerUser = "Số lượt dùng mỗi người không được vượt quá tổng lượt dùng";
    }

    if (!formData.validFrom) {
      nextErrors.validFrom = "Vui lòng chọn thời gian bắt đầu";
    } else if (Number.isNaN(validFromTime)) {
      nextErrors.validFrom = "Thời gian bắt đầu không hợp lệ";
    }

    if (!formData.validTo) {
      nextErrors.validTo = "Vui lòng chọn thời gian kết thúc";
    } else if (Number.isNaN(validToTime)) {
      nextErrors.validTo = "Thời gian kết thúc không hợp lệ";
    } else if (!Number.isNaN(validFromTime) && validToTime <= validFromTime) {
      nextErrors.validTo = "Thời gian kết thúc phải sau thời gian bắt đầu";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildPayload = (): CreateCouponPayload => {
    return {
      code: formData.code.trim().toUpperCase(),
      description: formData.description.trim(),
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue),
      minOrderAmount: Number(formData.minOrderAmount),
      maxDiscountAmount: Number(formData.maxDiscountAmount),
      maxUses: Number(formData.maxUses),
      maxUsesPerUser: Number(formData.maxUsesPerUser),
      isActive: formData.isActive === "true",
      validFrom: new Date(formData.validFrom),
      validTo: new Date(formData.validTo),
    };
  };

  const buildUpdatePayload = (): UpdateCouponPayload => buildPayload();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "view") return;

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = buildPayload();

      if (mode === "add") {
        const response = await create(payload);
        if (response.status === 200 || response.status === 201) {
          toast.success("Tạo mã giảm giá thành công");
          closeDialog();
        }
      }

      if (mode === "edit" && selectedCoupon) {
        const response = await update(selectedCoupon.id, buildUpdatePayload());
        if (response.status === 200 || response.status === 201) {
          toast.success("Cập nhật mã giảm giá thành công");
          closeDialog();
        }
      }
    } catch (error: any) {
      console.error("Error saving coupon:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(mode === "add" ? "Có lỗi xảy ra khi tạo mã giảm giá" : "Có lỗi xảy ra khi cập nhật mã giảm giá");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCoupon) return;

    setIsDeleting(true);
    try {
      const response = await remove(selectedCoupon.id);
      if (response.status === 200 || response.status === 204) {
        toast.success(`Đã xóa mã giảm giá "${selectedCoupon.code}" thành công`);
        setDeleteDialogOpen(false);
        closeDialog();
      }
    } catch (error: any) {
      console.error("Error deleting coupon:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Có lỗi xảy ra khi xóa mã giảm giá");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const dialogTitle =
    mode === "add" ? "Thêm mã giảm giá" : mode === "edit" ? "Chỉnh sửa mã giảm giá" : "Chi tiết mã giảm giá";

  const dialogDescription =
    mode === "add"
      ? "Điền thông tin để tạo mã giảm giá mới."
      : mode === "edit"
        ? "Cập nhật thông tin mã giảm giá."
        : `Thông tin chi tiết của mã giảm giá ${selectedCoupon?.code || ""}.`;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeDialog();
      }}
    >
      <DialogContent size="lg" className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1 -mx-1">
          <form id="coupon-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                  Mã giảm giá <span className="text-red-500">*</span>
                </label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleInputChange("code", e.target.value)}
                  placeholder="VD: SUMMER2026"
                  disabled={mode === "view"}
                  className={errors.code ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                />
                {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
              </div>

              <div>
                <label htmlFor="discountType" className="block text-sm font-medium text-gray-700 mb-1">
                  Loại giảm giá <span className="text-red-500">*</span>
                </label>
                <Select
                  id="discountType"
                  value={formData.discountType}
                  onChange={(e) => handleInputChange("discountType", e.target.value)}
                  disabled={mode === "view"}
                >
                  <option value={DiscountType.PERCENTAGE}>Phần trăm</option>
                  <option value={DiscountType.FIXED_AMOUNT}>Số tiền cố định</option>
                </Select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả
              </label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Mô tả ngắn về mã giảm giá..."
                rows={3}
                disabled={mode === "view"}
                className={errors.description ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="discountValue" className="block text-sm font-medium text-gray-700 mb-1">
                  Giá trị giảm <span className="text-red-500">*</span>
                </label>
                <Input
                  id="discountValue"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.discountValue}
                  onChange={(e) => handleInputChange("discountValue", e.target.value)}
                  disabled={mode === "view"}
                  className={errors.discountValue ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                />
                {errors.discountValue && <p className="mt-1 text-sm text-red-600">{errors.discountValue}</p>}
              </div>

              <div>
                <label htmlFor="minOrderAmount" className="block text-sm font-medium text-gray-700 mb-1">
                  Đơn tối thiểu
                </label>
                <Input
                  id="minOrderAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.minOrderAmount}
                  onChange={(e) => handleInputChange("minOrderAmount", e.target.value)}
                  disabled={mode === "view"}
                  className={errors.minOrderAmount ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                />
                {errors.minOrderAmount && <p className="mt-1 text-sm text-red-600">{errors.minOrderAmount}</p>}
              </div>

              <div>
                <label htmlFor="maxDiscountAmount" className="block text-sm font-medium text-gray-700 mb-1">
                  Giảm tối đa
                </label>
                <Input
                  id="maxDiscountAmount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.maxDiscountAmount}
                  onChange={(e) => handleInputChange("maxDiscountAmount", e.target.value)}
                  disabled={mode === "view"}
                  className={errors.maxDiscountAmount ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                />
                {errors.maxDiscountAmount && <p className="mt-1 text-sm text-red-600">{errors.maxDiscountAmount}</p>}
              </div>

              <div>
                <label htmlFor="maxUses" className="block text-sm font-medium text-gray-700 mb-1">
                  Tổng lượt dùng <span className="text-red-500">*</span>
                </label>
                <Input
                  id="maxUses"
                  type="number"
                  min="1"
                  value={formData.maxUses}
                  onChange={(e) => handleInputChange("maxUses", e.target.value)}
                  disabled={mode === "view"}
                  className={errors.maxUses ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                />
                {errors.maxUses && <p className="mt-1 text-sm text-red-600">{errors.maxUses}</p>}
              </div>

              <div>
                <label htmlFor="maxUsesPerUser" className="block text-sm font-medium text-gray-700 mb-1">
                  Lượt dùng mỗi người <span className="text-red-500">*</span>
                </label>
                <Input
                  id="maxUsesPerUser"
                  type="number"
                  min="1"
                  value={formData.maxUsesPerUser}
                  onChange={(e) => handleInputChange("maxUsesPerUser", e.target.value)}
                  disabled={mode === "view"}
                  className={errors.maxUsesPerUser ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                />
                {errors.maxUsesPerUser && <p className="mt-1 text-sm text-red-600">{errors.maxUsesPerUser}</p>}
              </div>

              <div>
                <label htmlFor="isActive" className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái
                </label>
                <Select
                  id="isActive"
                  value={formData.isActive}
                  onChange={(e) => handleInputChange("isActive", e.target.value)}
                  disabled={mode === "view"}
                >
                  <option value="true">Đang hoạt động</option>
                  <option value="false">Ngưng hoạt động</option>
                </Select>
              </div>

              <div>
                <label htmlFor="validFrom" className="block text-sm font-medium text-gray-700 mb-1">
                  Hiệu lực từ <span className="text-red-500">*</span>
                </label>
                <Input
                  id="validFrom"
                  type="datetime-local"
                  value={formData.validFrom}
                  onChange={(e) => handleInputChange("validFrom", e.target.value)}
                  disabled={mode === "view"}
                  className={errors.validFrom ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                />
                {errors.validFrom && <p className="mt-1 text-sm text-red-600">{errors.validFrom}</p>}
              </div>

              <div>
                <label htmlFor="validTo" className="block text-sm font-medium text-gray-700 mb-1">
                  Hiệu lực đến <span className="text-red-500">*</span>
                </label>
                <Input
                  id="validTo"
                  type="datetime-local"
                  value={formData.validTo}
                  onChange={(e) => handleInputChange("validTo", e.target.value)}
                  disabled={mode === "view"}
                  className={errors.validTo ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                />
                {errors.validTo && <p className="mt-1 text-sm text-red-600">{errors.validTo}</p>}
              </div>
            </div>

            {mode !== "add" && selectedCoupon && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 mb-1">ID</p>
                  <p className="text-sm font-mono text-gray-900">#{selectedCoupon.id}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Đã sử dụng</p>
                  <p className="text-sm text-gray-900">{selectedCoupon.usedCount}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Ngày tạo</p>
                  <p className="text-sm text-gray-900">{toDisplayDate(selectedCoupon.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Cập nhật lần cuối</p>
                  <p className="text-sm text-gray-900">{toDisplayDate(selectedCoupon.updatedAt)}</p>
                </div>
              </div>
            )}
          </form>
        </div>

        <DialogFooter className="flex-shrink-0 mt-4">
          <div className="flex flex-col sm:flex-row sm:justify-between w-full gap-2">
            {mode === "view" && selectedCoupon && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={isSubmitting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa mã giảm giá
              </Button>
            )}

            <div className="flex gap-2 sm:ml-auto">
              <Button type="button" variant="outline" onClick={closeDialog} disabled={isSubmitting}>
                {mode === "view" ? "Đóng" : "Hủy"}
              </Button>

              {mode !== "view" && (
                <Button
                  type="submit"
                  form="coupon-form"
                  variant="primary"
                  disabled={isSubmitting}
                  loading={isSubmitting}
                >
                  {mode === "add" ? "Tạo mã giảm giá" : "Cập nhật"}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Xóa mã giảm giá"
        description={`Bạn có chắc chắn muốn xóa mã giảm giá "${selectedCoupon?.code}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa mã"
        isLoading={isDeleting}
      />
    </Dialog>
  );
};
