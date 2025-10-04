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
  Textarea,
} from "@/components/ui";
import { useCategoryDialog } from "./CategoryDialogContext";
import { create, update, remove, findOne } from "@/services/category";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { toast } from "sonner";
import { Trash2, Upload, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Zod schema for category validation
const categorySchema = z.object({
  title: z
    .string()
    .min(1, "Tên danh mục là bắt buộc")
    .min(2, "Tên danh mục phải có ít nhất 2 ký tự")
    .max(100, "Tên danh mục không được vượt quá 100 ký tự")
    .trim(),
  description: z.string().max(500, "Mô tả không được vượt quá 500 ký tự").trim(),
  image: z.string().url("URL hình ảnh không hợp lệ").optional().or(z.literal("")),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export const CategoryDialog: React.FC = () => {
  const { isOpen, mode, selectedCategory, closeDialog, isSubmitting, setIsSubmitting } = useCategoryDialog();

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [imagePreview, setImagePreview] = React.useState<string>("");

  // React Hook Form setup
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      title: "",
      description: "",
      image: "",
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

  const watchedImage = watch("image");

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

  // Update image preview when image URL changes
  React.useEffect(() => {
    if (watchedImage && watchedImage.trim()) {
      setImagePreview(watchedImage);
    } else {
      setImagePreview("");
    }
  }, [watchedImage]);

  // Reset form when dialog opens/closes or mode changes
  React.useEffect(() => {
    if (isOpen) {
      if (mode === "add") {
        reset({ title: "", description: "", image: "" });
        setImagePreview("");
      } else if ((mode === "edit" || mode === "view") && selectedCategory) {
        reset({
          title: selectedCategory.title,
          description: selectedCategory.description,
          image: selectedCategory.image,
        });
        setImagePreview(selectedCategory.image || "");
      }
    } else {
      reset({ title: "", description: "", image: "" });
      setImagePreview("");
    }
  }, [isOpen, mode, selectedCategory, reset]);

  // Handle form submission
  const onSubmit = async (data: CategoryFormData) => {
    if (mode === "view") return;

    setIsSubmitting(true);

    try {
      const payload = {
        title: data.title.trim(),
        description: data.description.trim(),
        image: data.image?.trim() || "",
      };

      if (mode === "add") {
        const response = await create(payload);
        if (response.status === 200 || response.status === 201) {
          toast.success("Thêm danh mục thành công");
          closeDialog();
          // Trigger refresh of the parent component
          window.location.reload();
        }
      } else if (mode === "edit" && selectedCategory) {
        const response = await update(selectedCategory.id, payload);
        if (response.status === 200 || response.status === 201) {
          toast.success("Cập nhật danh mục thành công");
          closeDialog();
          // Trigger refresh of the parent component
          window.location.reload();
        }
      }
    } catch (error: any) {
      console.error("Error saving category:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(mode === "add" ? "Có lỗi xảy ra khi thêm danh mục" : "Có lỗi xảy ra khi cập nhật danh mục");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete category
  const handleDelete = async () => {
    if (!selectedCategory) return;

    setIsDeleting(true);
    try {
      const response = await remove(selectedCategory.id);
      if (response.status === 200 || response.status === 204) {
        toast.success(`Đã xóa danh mục "${selectedCategory.title}" thành công`);
        setDeleteDialogOpen(false);
        closeDialog();
        // Trigger refresh of the parent component
        window.location.reload();
      }
    } catch (error: any) {
      console.error("Error deleting category:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Có lỗi xảy ra khi xóa danh mục");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle image URL change
  const handleImageChange = (url: string) => {
    setValue("image", url);
  };

  // Get dialog title based on mode
  const getDialogTitle = () => {
    switch (mode) {
      case "add":
        return "Thêm danh mục mới";
      case "edit":
        return "Chỉnh sửa danh mục";
      case "view":
        return "Chi tiết danh mục";
      default:
        return "Danh mục";
    }
  };

  // Get dialog description based on mode
  const getDialogDescription = () => {
    switch (mode) {
      case "add":
        return "Điền thông tin để thêm danh mục mới vào hệ thống.";
      case "edit":
        return "Cập nhật thông tin danh mục.";
      case "view":
        return `Thông tin chi tiết của danh mục ${selectedCategory?.title || ""}.`;
      default:
        return "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Tên danh mục <span className="text-red-500">*</span>
              </label>
              <Input
                id="title"
                type="text"
                placeholder="Nhập tên danh mục..."
                disabled={mode === "view"}
                className={errors.title ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                {...register("title")}
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả
              </label>
              <Textarea
                id="description"
                placeholder="Nhập mô tả danh mục..."
                disabled={mode === "view"}
                rows={3}
                className={errors.description ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                {...register("description")}
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
            </div>

            {/* Image Upload Section */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                Hình ảnh danh mục
              </label>
              <div className="space-y-3">
                <Input
                  id="image"
                  type="url"
                  placeholder="Nhập URL hình ảnh..."
                  disabled={mode === "view"}
                  className={errors.image ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                  {...register("image")}
                />
                {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>}

                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={() => setImagePreview("")}
                    />
                    {mode !== "view" && (
                      <button
                        type="button"
                        onClick={() => {
                          setValue("image", "");
                          setImagePreview("");
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Show additional info in view/edit mode */}
            {mode !== "add" && selectedCategory && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">ID</label>
                  <p className="text-sm text-gray-900 font-mono">#{selectedCategory.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Ngày tạo</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedCategory.createdAt)}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Cập nhật lần cuối</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedCategory.updatedAt)}</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <div className="flex justify-between w-full">
              {/* Delete button on the left (only in view mode) */}
              {mode === "view" && selectedCategory && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={isSubmitting}
                  className="mr-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa danh mục
                </Button>
              )}

              {/* Action buttons on the right */}
              <div className="flex gap-2 ml-auto">
                <Button type="button" variant="outline" onClick={closeDialog} disabled={isSubmitting}>
                  {mode === "view" ? "Đóng" : "Hủy"}
                </Button>
                {mode !== "view" && (
                  <Button type="submit" variant="primary" disabled={isSubmitting} loading={isSubmitting}>
                    {mode === "add" ? "Thêm danh mục" : "Cập nhật"}
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Xóa danh mục"
        description={`Bạn có chắc chắn muốn xóa danh mục "${selectedCategory?.title}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa danh mục"
        isLoading={isDeleting}
      />
    </Dialog>
  );
};
