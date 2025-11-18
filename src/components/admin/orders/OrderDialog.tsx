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
} from "@/components/ui";
import { useOrderDialog } from "./OrderDialogContext";
import { create, update, remove, findOne } from "@/services/supplier";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { fCurrency } from "@/shared/utils/format-number";
import { OrderStatus } from "@/common/contants";
import { ProductVariantKind } from "@/types/product";

// Zod schema for order validation
const orderSchema = z.object({});

type OrderFormData = z.infer<typeof orderSchema>;

export const OrderDialog: React.FC = () => {
  const { isOpen, mode, selectedOrder, closeDialog, isSubmitting, setIsSubmitting } = useOrderDialog();

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // React Hook Form setup
  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {},
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = form;

  // Reset form when dialog opens/closes or mode changes
  React.useEffect(() => {
    if (isOpen) {
      if (mode === "add") {
        reset({ name: "" });
      } else if ((mode === "edit" || mode === "view") && selectedOrder) {
        reset({ name: selectedOrder.id + "" });
      }
    } else {
      reset({ name: "" });
    }
  }, [isOpen, mode, selectedOrder, reset]);

  // Handle form submission
  const onSubmit = async (data: OrderFormData) => {
    if (mode === "view") return;

    setIsSubmitting(true);

    try {
      if (mode === "add") {
        toast.success(`Đơn hàng mới đã được tạo thành công`);
        closeDialog();
      } else if (mode === "edit" && selectedOrder) {
        toast.success(`Đơn hàng "${selectedOrder.id}" đã được cập nhật thành công`);
        closeDialog();
      } else if (mode === "process" && selectedOrder) {
        // Update order

        // Send confirmation email

        toast.success(`Đơn hàng "${selectedOrder.id}" đã được xử lý thành công`);
        closeDialog();
      }
    } catch (error: any) {
      console.error("Error saving supplier:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(mode === "add" ? "Có lỗi xảy ra khi thêm nhà cung cấp" : "Có lỗi xảy ra khi cập nhật nhà cung cấp");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete order
  const handleDelete = async () => {
    if (!selectedOrder) return;

    setIsDeleting(true);
    try {
      const response = await remove(selectedOrder.id);
      if (response.status === 200 || response.status === 204) {
        toast.success(`Đã xóa đơn hàng "${selectedOrder.id}" thành công`);
        setDeleteDialogOpen(false);
        closeDialog();
        // Trigger refresh of the parent component
        window.location.reload();
      }
    } catch (error: any) {
      console.error("Error deleting supplier:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Có lỗi xảy ra khi xóa nhà cung cấp");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Get dialog title based on mode
  const getDialogTitle = () => {
    switch (mode) {
      case "add":
        return "Tạo đơn hàng mới";
      case "edit":
        return "Chỉnh sửa đơn hàng";
      case "view":
        return "Chi tiết đơn hàng";
      case "process":
        return "Xử lý đơn hàng";
      default:
        return "Đơn hàng";
    }
  };

  // Get dialog description based on mode
  const getDialogDescription = () => {
    switch (mode) {
      case "add":
        return "Điền thông tin để tạo đơn hàng mới vào hệ thống.";
      case "edit":
        return "Cập nhật thông tin đơn hàng.";
      case "view":
        return `Thông tin chi tiết của đơn hàng #${selectedOrder?.id || ""}.`;
      default:
        return "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent
        size="2xl"
        className="max-h-[90vh] overflow-hidden flex flex-col w-[95vw] sm:w-[90vw] md:w-[75vw] lg:w-[65vw] xl:max-w-xl"
      >
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1 -mx-1">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input id="email" type="email" placeholder="email@example.com" value={selectedOrder?.user.email} />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái đơn hàng
                </label>
                <Select id="status" className="w-full">
                  {Object.entries(OrderStatus).map(([key, value]) => (
                    <option key={key} value={value}>
                      {value}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div>
              <h3>Đơn hàng gồm:</h3>
              <div className="mt-2 space-y-2">
                {selectedOrder?.orderItems.map((item) => (
                  <div className="p-2 border border-gray-300 w-full rounded-md">
                    <p>Tên sản phẩm: {item.product.title}</p>
                    <p>Phân loại: {item.variant.title}</p>
                    <p>Giá: {fCurrency(item.variant.retailPrice, { currency: "VND" })}</p>
                    <p>Số lượng: {item.quantity}</p>

                    {item.variant.kind === ProductVariantKind.PRE_MADE_ACCOUNT && (
                      <div className="border border-gray-300 p-2 rounded space-y-4">
                        <div>
                          <label htmlFor="email-username" className="block text-sm font-medium text-gray-700 mb-2">
                            Email/Tên tài khoản <span className="text-red-500">*</span>
                          </label>
                          <Input id="email-username" type="text" />
                        </div>
                        <div>
                          <label htmlFor="account-password" className="block text-sm font-medium text-gray-700 mb-2">
                            Mật khẩu <span className="text-red-500">*</span>
                          </label>
                          <Input id="account-password" type="text" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>

        <DialogFooter className="flex-shrink-0 mt-6">
          <div className="flex flex-col sm:flex-row sm:justify-between w-full gap-3 sm:gap-2">
            {/* Delete button on the left (only in view mode) */}
            {mode === "view" && selectedOrder && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa đơn hàng
              </Button>
            )}

            {/* Action buttons on the right */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 sm:ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={closeDialog}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {mode === "view" ? "Đóng" : "Hủy"}
              </Button>
              {mode !== "view" && (
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  loading={isSubmitting}
                  className="w-full sm:w-auto"
                  onClick={handleSubmit(onSubmit)}
                >
                  {mode === "process" ? "Gửi hàng" : "-"}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Xóa nhà cung cấp"
        description={`Bạn có chắc chắn muốn xóa nhà cung cấp "${selectedOrder?.id}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa nhà cung cấp"
        isLoading={isDeleting}
      />
    </Dialog>
  );
};
