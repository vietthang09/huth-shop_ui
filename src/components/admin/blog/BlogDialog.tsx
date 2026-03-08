"use client";

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
  Select,
  RichTextEditor,
} from "@/components/ui";
import { useBlogDialog } from "./BlogDialogContext";
import { create, remove, update } from "@/services/blog";
import { uploadFile } from "@/services/cloud";
import { BlogStatus } from "@/services/type";
import { toast } from "sonner";
import { Trash2, Upload, X } from "lucide-react";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";

type BlogFormData = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  thumbnail: string;
  status: BlogStatus;
  tags: string;
};

type BlogFormErrors = {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  thumbnail?: string;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const formatDate = (dateInput: string | Date) => {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getTagsFromInput = (value: string): string[] => {
  const tagSet = new Set(
    value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
  );

  return Array.from(tagSet);
};

export const BlogDialog: React.FC = () => {
  const { isOpen, mode, selectedBlog, closeDialog, isSubmitting, setIsSubmitting } = useBlogDialog();

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [selectedImageFile, setSelectedImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState("");

  const [formData, setFormData] = React.useState<BlogFormData>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    thumbnail: "",
    status: BlogStatus.DRAFT,
    tags: "",
  });

  const [errors, setErrors] = React.useState<BlogFormErrors>({});

  React.useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        thumbnail: "",
        status: BlogStatus.DRAFT,
        tags: "",
      });
      setErrors({});
      setSelectedImageFile(null);
      setImagePreview("");
      return;
    }

    if (mode === "add") {
      setFormData({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        thumbnail: "",
        status: BlogStatus.DRAFT,
        tags: "",
      });
      setErrors({});
      setSelectedImageFile(null);
      setImagePreview("");
      return;
    }

    if ((mode === "edit" || mode === "view") && selectedBlog) {
      setFormData({
        title: selectedBlog.title || "",
        slug: selectedBlog.slug || "",
        excerpt: selectedBlog.excerpt || "",
        content: selectedBlog.content || "",
        thumbnail: selectedBlog.thumbnail || "",
        status: selectedBlog.status || BlogStatus.DRAFT,
        tags: (selectedBlog.tags || []).join(", "),
      });
      setErrors({});
      setSelectedImageFile(null);
      setImagePreview(selectedBlog.thumbnail || "");
    }
  }, [isOpen, mode, selectedBlog]);

  const validateForm = (): boolean => {
    const nextErrors: BlogFormErrors = {};

    if (!formData.title.trim()) {
      nextErrors.title = "Tieu de la bat buoc";
    } else if (formData.title.trim().length > 200) {
      nextErrors.title = "Tieu de khong duoc vuot qua 200 ky tu";
    }

    if (formData.slug.trim() && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug.trim())) {
      nextErrors.slug = "Slug chi gom chu thuong, so va dau gach ngang";
    }

    if (!formData.excerpt.trim()) {
      nextErrors.excerpt = "Tom tat la bat buoc";
    } else if (formData.excerpt.trim().length > 500) {
      nextErrors.excerpt = "Tom tat khong duoc vuot qua 500 ky tu";
    }

    if (!formData.content.trim()) {
      nextErrors.content = "Noi dung bai viet la bat buoc";
    }

    if (mode === "add" && !formData.thumbnail.trim() && !selectedImageFile) {
      nextErrors.thumbnail = "Anh dai dien la bat buoc";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleInputChange = <K extends keyof BlogFormData>(key: K, value: BlogFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));

    if (errors[key as keyof BlogFormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Vui long chon tep hinh anh hop le");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Kich thuoc anh khong duoc vuot qua 5MB");
      return;
    }

    setSelectedImageFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const preview = event.target?.result;
      if (typeof preview === "string") {
        setImagePreview(preview);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (mode === "view") return;
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      let thumbnailUrl = formData.thumbnail.trim();

      if (selectedImageFile) {
        const uploadResponse = await uploadFile(selectedImageFile);
        thumbnailUrl = uploadResponse.data?.url || "";
      }

      const payload = {
        title: formData.title.trim(),
        excerpt: formData.excerpt.trim(),
        content: formData.content,
        thumbnail: thumbnailUrl,
        status: formData.status,
        tags: getTagsFromInput(formData.tags),
      };

      if (mode === "add") {
        const response = await create(payload);
        if (response.status === 200 || response.status === 201) {
          toast.success("Them bai viet thanh cong");
          closeDialog();
          window.location.reload();
        }
      }

      if (mode === "edit" && selectedBlog) {
        const response = await update(selectedBlog.id, payload);
        if (response.status === 200 || response.status === 201) {
          toast.success("Cap nhat bai viet thanh cong");
          closeDialog();
          window.location.reload();
        }
      }
    } catch (error: any) {
      console.error("Error saving blog:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(mode === "add" ? "Co loi xay ra khi them bai viet" : "Co loi xay ra khi cap nhat bai viet");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBlog) return;

    setIsDeleting(true);
    try {
      const response = await remove(selectedBlog.id);
      if (response.status === 200 || response.status === 204) {
        toast.success(`Da xoa bai viet \"${selectedBlog.title}\" thanh cong`);
        setDeleteDialogOpen(false);
        closeDialog();
        window.location.reload();
      }
    } catch (error: any) {
      console.error("Error deleting blog:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Co loi xay ra khi xoa bai viet");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const getDialogTitle = () => {
    switch (mode) {
      case "add":
        return "Them bai viet moi";
      case "edit":
        return "Chinh sua bai viet";
      case "view":
        return "Chi tiet bai viet";
      default:
        return "Bai viet";
    }
  };

  const getDialogDescription = () => {
    switch (mode) {
      case "add":
        return "Nhap thong tin de tao bai viet moi.";
      case "edit":
        return "Cap nhat noi dung bai viet.";
      case "view":
        return `Thong tin chi tiet cua bai viet ${selectedBlog?.title || ""}.`;
      default:
        return "";
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={closeDialog}>
        <DialogContent
          size="full"
          className="max-h-[92vh] overflow-hidden flex flex-col w-[98vw] sm:w-[95vw] md:w-[92vw] lg:w-[90vw] xl:max-w-6xl"
        >
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>{getDialogTitle()}</DialogTitle>
            <DialogDescription>{getDialogDescription()}</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-1 -mx-1">
            <div className="space-y-5 pb-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Tieu de <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    disabled={mode === "view"}
                    placeholder="Nhap tieu de bai viet..."
                    className={errors.title ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Trang thai
                  </label>
                  <Select
                    id="status"
                    value={formData.status}
                    onChange={(e) => handleInputChange("status", e.target.value as BlogStatus)}
                    disabled={mode === "view"}
                  >
                    <option value={BlogStatus.DRAFT}>Ban nhap</option>
                    <option value={BlogStatus.PUBLISHED}>Da xuat ban</option>
                  </Select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  {mode !== "view" && (
                    <Button
                      type="button"
                      size="xs"
                      variant="outline"
                      onClick={() => handleInputChange("slug", slugify(formData.title))}
                    >
                      Tao tu tieu de
                    </Button>
                  )}
                </div>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange("slug", e.target.value)}
                  disabled={mode === "view"}
                  placeholder="vi-du-bai-viet-moi"
                  className={errors.slug ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                />
                {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                    The (tach bang dau phay)
                  </label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => handleInputChange("tags", e.target.value)}
                    disabled={mode === "view"}
                    placeholder="game, huong-dan, bao-mat"
                  />
                </div>

                <div>
                  <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                    Tom tat <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => handleInputChange("excerpt", e.target.value)}
                    disabled={mode === "view"}
                    rows={3}
                    placeholder="Tom tat ngan cho bai viet..."
                    className={errors.excerpt ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                  />
                  {errors.excerpt && <p className="mt-1 text-sm text-red-600">{errors.excerpt}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anh dai dien {mode === "add" && <span className="text-red-500">*</span>}
                </label>
                <div
                  className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 transition-colors duration-200 ${
                    mode === "view"
                      ? "bg-gray-100 cursor-not-allowed"
                      : "hover:border-blue-400 bg-gray-50 cursor-pointer"
                  }`}
                  onDragOver={
                    mode !== "view"
                      ? (e) => {
                          e.preventDefault();
                        }
                      : undefined
                  }
                  onDrop={
                    mode !== "view"
                      ? (e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files?.[0];
                          if (file) {
                            handleImageUpload(file);
                          }
                        }
                      : undefined
                  }
                  style={{ minHeight: "130px" }}
                >
                  {mode !== "view" && (
                    <input
                      id="thumbnail-upload"
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(file);
                        }
                      }}
                    />
                  )}

                  {!imagePreview ? (
                    <div className="flex flex-col items-center justify-center pointer-events-none">
                      <Upload className="h-8 w-8 text-blue-400 mb-2" />
                      <span className="text-gray-500 text-sm text-center">Keo tha hoac nhan de chon anh dai dien</span>
                    </div>
                  ) : (
                    <div className="relative w-40 h-28 border-2 border-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover"
                        onError={() => setImagePreview("")}
                      />
                      {mode !== "view" && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImageFile(null);
                            setImagePreview("");
                            handleInputChange("thumbnail", "");
                          }}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
                {errors.thumbnail && <p className="mt-1 text-sm text-red-600">{errors.thumbnail}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Noi dung bai viet <span className="text-red-500">*</span>
                </label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(content) => handleInputChange("content", content)}
                  disabled={mode === "view"}
                  placeholder="Nhap noi dung chi tiet bai viet..."
                  height="420px"
                />
                {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
              </div>

              {selectedBlog && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 rounded-md bg-gray-50 border border-gray-200">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-gray-800">Ngay tao:</span> {formatDate(selectedBlog.createdAt)}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-gray-800">Cap nhat:</span> {formatDate(selectedBlog.updatedAt)}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex-shrink-0">
            {(mode === "edit" || mode === "view") && selectedBlog && (
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                className="mr-auto"
                disabled={isSubmitting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Xoa
              </Button>
            )}

            <Button variant="outline" onClick={closeDialog} disabled={isSubmitting}>
              {mode === "view" ? "Dong" : "Huy"}
            </Button>

            {mode !== "view" && (
              <Button onClick={handleSubmit} loading={isSubmitting}>
                {mode === "add" ? "Them bai viet" : "Cap nhat"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Xac nhan xoa bai viet"
        description={`Ban co chac chan muon xoa bai viet \"${selectedBlog?.title || ""}\"?`}
        isLoading={isDeleting}
      />
    </>
  );
};
