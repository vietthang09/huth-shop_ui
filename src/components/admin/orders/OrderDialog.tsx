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
} from "@/components/ui";
import { useOrderDialog } from "./OrderDialogContext";
import { create, update, remove, findOne } from "@/services/supplier";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Zod schema for order validation
const orderSchema = z.object({
  name: z
    .string()
    .min(1, "Tên đơn hàng là bắt buộc")
    .min(2, "Tên đơn hàng phải có ít nhất 2 ký tự")
    .max(100, "Tên đơn hàng không được vượt quá 100 ký tự")
    .trim(),
});

type OrderFormData = z.infer<typeof orderSchema>;

export const OrderDialog: React.FC = () => {
  const { isOpen, mode, selectedOrder, closeDialog, isSubmitting, setIsSubmitting } = useOrderDialog();

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // React Hook Form setup
  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      name: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = form;

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
        const response = await create({ name: data.name.trim() });
        if (response.status === 200 || response.status === 201) {
          toast.success("Thêm nhà cung cấp thành công");
          closeDialog();
          // Trigger refresh of the parent component
          window.location.reload();
        }
      } else if (mode === "edit" && selectedOrder) {
        const response = await update(selectedOrder.id, { name: data.name.trim() });
        if (response.status === 200 || response.status === 201) {
          toast.success("Cập nhật đơn hàng thành công");
          closeDialog();
          // Trigger refresh of the parent component
          window.location.reload();
        }
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
        return "Thêm nhà cung cấp mới";
      case "edit":
        return "Chỉnh sửa nhà cung cấp";
      case "view":
        return "Chi tiết nhà cung cấp";
      default:
        return "Nhà cung cấp";
    }
  };

  // Get dialog description based on mode
  const getDialogDescription = () => {
    switch (mode) {
      case "add":
        return "Điền thông tin để thêm nhà cung cấp mới vào hệ thống.";
      case "edit":
        return "Cập nhật thông tin nhà cung cấp.";
      case "view":
        return `Thông tin chi tiết của nhà cung cấp ${selectedOrder?.id || ""}.`;
      default:
        return "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent
        size="lg"
        className="max-h-[90vh] overflow-hidden flex flex-col w-[95vw] sm:w-[90vw] md:w-[75vw] lg:w-[65vw] xl:max-w-xl"
      >
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1 -mx-1">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Tên nhà cung cấp <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Nhập tên nhà cung cấp..."
                  disabled={mode === "view"}
                  className={errors.name ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                  {...register("name")}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>

              {/* Show additional info in view/edit mode */}
              {mode !== "add" && selectedOrder && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">ID</label>
                    <p className="text-sm text-gray-900 font-mono">#{selectedOrder.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Ngày tạo</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedOrder.createdAt)}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Cập nhật lần cuối</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedOrder.updatedAt)}</p>
                  </div>
                </div>
              )}
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
                Xóa nhà cung cấp
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
                  {mode === "add" ? "Thêm nhà cung cấp" : "Cập nhật"}
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
