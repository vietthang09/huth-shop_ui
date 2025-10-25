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
  Autocomplete,
} from "@/components/ui";
import type { AutocompleteOption } from "@/components/ui";
import { useProductDialog } from "./ProductDialogContext";
import { create, update, remove } from "@/services/product";
import { uploadFile } from "@/services/cloud";
import { findAll as findAllCategories, TCategory } from "@/services/category";
import { findAll as findAllSuppliers, TSupplier } from "@/services/supplier";
import * as productVariantService from "@/services/product-variants";
import { TProductVariant } from "@/services/product-variants";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { toast } from "sonner";
import { Trash2, Upload, X, Plus, Edit3, DollarSign } from "lucide-react";
import { fCurrency } from "@/shared/utils/format-number";

type FormData = {
  sku: string;
  title: string;
  description: string;
  categoryId: string;
};

type FormErrors = {
  sku?: string;
  title?: string;
  description?: string;
  categoryId?: string;
};

type VariantFormData = {
  id?: number;
  title: string;
  netPrice: string;
  retailPrice: string;
  supplierId: string;
};

type VariantFormErrors = {
  title?: string;
  netPrice?: string;
  retailPrice?: string;
  supplierId?: string;
};

type VariantFormField = "title" | "netPrice" | "retailPrice" | "supplierId";

export const ProductDialog: React.FC = () => {
  const { isOpen, mode, selectedProduct, closeDialog, isSubmitting, setIsSubmitting } = useProductDialog();

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [categories, setCategories] = React.useState<TCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = React.useState(false);

  // Variant related state
  const [suppliers, setSuppliers] = React.useState<TSupplier[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = React.useState(false);
  const [variants, setVariants] = React.useState<TProductVariant[]>([]);
  const [showVariantForm, setShowVariantForm] = React.useState(false);
  const [editingVariant, setEditingVariant] = React.useState<TProductVariant | null>(null);
  const [variantFormData, setVariantFormData] = React.useState<VariantFormData>({
    title: "",
    netPrice: "",
    retailPrice: "",
    supplierId: "",
  });
  const [variantFormErrors, setVariantFormErrors] = React.useState<VariantFormErrors>({});

  // Convert categories to autocomplete options
  const categoryOptions: AutocompleteOption[] = React.useMemo(() => {
    return categories.map((category) => ({
      value: category.id.toString(),
      label: category.title,
    }));
  }, [categories]);

  // Convert suppliers to autocomplete options
  const supplierOptions: AutocompleteOption[] = React.useMemo(() => {
    return suppliers.map((supplier) => ({
      value: supplier.id.toString(),
      label: supplier.name,
    }));
  }, [suppliers]);
  const [imageFiles, setImageFiles] = React.useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = React.useState<string[]>([]);

  // Form state
  const [formData, setFormData] = React.useState<FormData>({
    sku: "",
    title: "",
    description: "",
    categoryId: "",
  });

  const [errors, setErrors] = React.useState<FormErrors>({});

  // Fetch categories and suppliers when dialog opens
  React.useEffect(() => {
    const fetchData = async () => {
      if (!isOpen) return;

      setLoadingCategories(true);
      setLoadingSuppliers(true);

      try {
        const [categoriesResponse, suppliersResponse] = await Promise.all([findAllCategories(), findAllSuppliers()]);

        if (categoriesResponse.status === 200) {
          setCategories(categoriesResponse.data as TCategory[]);
        }

        if (suppliersResponse.status === 200) {
          setSuppliers(suppliersResponse.data as TSupplier[]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Có lỗi xảy ra khi tải dữ liệu");
      } finally {
        setLoadingCategories(false);
        setLoadingSuppliers(false);
      }
    };

    fetchData();
  }, [isOpen]);

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

  // Helper function to compare variants and detect changes
  const getVariantChanges = (originalVariants: TProductVariant[], currentVariants: TProductVariant[]) => {
    const original = originalVariants || [];
    const current = currentVariants || [];

    // Find variants to delete (exist in original but not in current)
    const toDelete = original.filter((orig) => !current.some((curr) => curr.id === orig.id));

    // Find variants to create (have negative ID or ID doesn't exist in original)
    const toCreate = current.filter((curr) => curr.id < 0 || !original.some((orig) => orig.id === curr.id));

    // Find variants to update (exist in both, have positive ID, and have different data)
    const toUpdate = current.filter((curr) => {
      if (curr.id < 0) return false; // Skip new variants

      const orig = original.find((o) => o.id === curr.id);
      if (!orig) return false;

      return (
        orig.title !== curr.title ||
        orig.netPrice !== curr.netPrice ||
        orig.retailPrice !== curr.retailPrice ||
        orig.supplierId !== curr.supplierId
      );
    });

    return { toDelete, toCreate, toUpdate };
  };

  // Reset form when dialog opens/closes or mode changes
  React.useEffect(() => {
    if (isOpen) {
      if (mode === "add") {
        setFormData({
          sku: "",
          title: "",
          description: "",
          categoryId: "",
        });
        setImageFiles([]);
        setImagePreviewUrls([]);
        setVariants([]);
      } else if ((mode === "edit" || mode === "view") && selectedProduct) {
        setFormData({
          sku: selectedProduct.sku,
          title: selectedProduct.title,
          description: selectedProduct.description || "",
          categoryId: selectedProduct.categoryId?.toString() || "",
        });

        // Handle existing images
        if (selectedProduct.images && Array.isArray(selectedProduct.images)) {
          setImagePreviewUrls(selectedProduct.images);
        } else {
          setImagePreviewUrls([]);
        }
        setImageFiles([]);

        // Handle existing variants
        if (selectedProduct.variants && Array.isArray(selectedProduct.variants)) {
          setVariants(selectedProduct.variants);
        } else {
          setVariants([]);
        }
      }
      setErrors({});
      setShowVariantForm(false);
      setEditingVariant(null);
      setVariantFormData({
        title: "",
        netPrice: "",
        retailPrice: "",
        supplierId: "",
      });
      setVariantFormErrors({});
    } else {
      setFormData({
        sku: "",
        title: "",
        description: "",
        categoryId: "",
      });
      setImageFiles([]);
      setImagePreviewUrls([]);
      setVariants([]);
      setErrors({});
      setShowVariantForm(false);
      setEditingVariant(null);
      setVariantFormData({
        title: "",
        netPrice: "",
        retailPrice: "",
        supplierId: "",
      });
      setVariantFormErrors({});
    }
  }, [isOpen, mode, selectedProduct]);

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.sku.trim()) {
      newErrors.sku = "SKU là bắt buộc";
    } else if (formData.sku.trim().length < 3) {
      newErrors.sku = "SKU phải có ít nhất 3 ký tự";
    } else if (formData.sku.trim().length > 50) {
      newErrors.sku = "SKU không được vượt quá 50 ký tự";
    } else if (!/^[A-Z0-9-_]+$/i.test(formData.sku.trim())) {
      newErrors.sku = "SKU chỉ được chứa chữ cái, số, dấu gạch ngang và gạch dưới";
    }

    if (!formData.title.trim()) {
      newErrors.title = "Tên sản phẩm là bắt buộc";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Tên sản phẩm phải có ít nhất 3 ký tự";
    } else if (formData.title.trim().length > 200) {
      newErrors.title = "Tên sản phẩm không được vượt quá 200 ký tự";
    }

    if (formData.description.length > 1000) {
      newErrors.description = "Mô tả không được vượt quá 1000 ký tự";
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Vui lòng chọn danh mục";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate variant form
  const validateVariantForm = (): boolean => {
    const newErrors: VariantFormErrors = {};

    if (!variantFormData.title.trim()) {
      newErrors.title = "Tên variant là bắt buộc";
    } else if (variantFormData.title.trim().length < 3) {
      newErrors.title = "Tên variant phải có ít nhất 3 ký tự";
    } else if (variantFormData.title.trim().length > 100) {
      newErrors.title = "Tên variant không được vượt quá 100 ký tự";
    }

    if (!variantFormData.netPrice.trim()) {
      newErrors.netPrice = "Giá nhập là bắt buộc";
    } else if (isNaN(Number(variantFormData.netPrice)) || Number(variantFormData.netPrice) < 0) {
      newErrors.netPrice = "Giá nhập phải là số dương";
    } else if (Number(variantFormData.netPrice) > 999999999) {
      newErrors.netPrice = "Giá nhập không được vượt quá 999,999,999";
    }

    if (!variantFormData.retailPrice.trim()) {
      newErrors.retailPrice = "Giá bán là bắt buộc";
    } else if (isNaN(Number(variantFormData.retailPrice)) || Number(variantFormData.retailPrice) < 0) {
      newErrors.retailPrice = "Giá bán phải là số dương";
    } else if (Number(variantFormData.retailPrice) > 999999999) {
      newErrors.retailPrice = "Giá bán không được vượt quá 999,999,999";
    } else if (Number(variantFormData.retailPrice) < Number(variantFormData.netPrice || "0")) {
      newErrors.retailPrice = "Giá bán không được thấp hơn giá nhập";
    }

    if (!variantFormData.supplierId) {
      newErrors.supplierId = "Vui lòng chọn nhà cung cấp";
    }

    setVariantFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle variant form input change
  const handleVariantInputChange = (field: VariantFormField, value: string) => {
    setVariantFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (variantFormErrors[field]) {
      setVariantFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle add new variant
  const handleAddVariant = () => {
    setEditingVariant(null);
    setVariantFormData({
      title: "",
      netPrice: "",
      retailPrice: "",
      supplierId: "",
    });
    setVariantFormErrors({});
    setShowVariantForm(true);
  };

  // Handle edit variant
  const handleEditVariant = (variant: TProductVariant) => {
    setEditingVariant(variant);
    setVariantFormData({
      id: variant.id,
      title: variant.title,
      netPrice: variant.netPrice.toString(),
      retailPrice: variant.retailPrice.toString(),
      supplierId: variant.supplierId.toString(),
    });
    setVariantFormErrors({});
    setShowVariantForm(true);
  };

  // Handle save variant
  const handleSaveVariant = () => {
    if (!validateVariantForm()) {
      return;
    }

    const newVariant: any = {
      id: editingVariant?.id || -Date.now(), // Use negative timestamp for new variants
      productId: selectedProduct?.id || 0, // Will be set after product creation
      title: variantFormData.title.trim(),
      netPrice: Number(variantFormData.netPrice),
      retailPrice: Number(variantFormData.retailPrice),
      supplierId: Number(variantFormData.supplierId),
    };

    if (editingVariant) {
      // Update existing variant
      setVariants((prev) => prev.map((v) => (v.id === editingVariant.id ? newVariant : v)));
      toast.success("Cập nhật variant thành công");
    } else {
      // Add new variant
      setVariants((prev) => [...prev, newVariant]);
      toast.success("Thêm variant thành công");
    }

    setShowVariantForm(false);
    setEditingVariant(null);
  };

  // Handle cancel variant form
  const handleCancelVariantForm = () => {
    setShowVariantForm(false);
    setEditingVariant(null);
    setVariantFormData({
      title: "",
      netPrice: "",
      retailPrice: "",
      supplierId: "",
    });
    setVariantFormErrors({});
  };

  // Handle remove variant
  const handleRemoveVariant = (variantId: number) => {
    setVariants((prev) => prev.filter((v) => v.id !== variantId));
    toast.success("Xóa variant thành công");
  };

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate file types
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const invalidFiles = files.filter((file) => !validTypes.includes(file.type));

    if (invalidFiles.length > 0) {
      toast.error("Chỉ hỗ trợ file ảnh định dạng JPG, JPEG, PNG, WEBP");
      return;
    }

    // Validate file size (max 5MB per file)
    const oversizedFiles = files.filter((file) => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error("Kích thước file không được vượt quá 5MB");
      return;
    }

    // Limit total images (max 5)
    const currentImageCount = imageFiles.length + imagePreviewUrls.length;
    if (currentImageCount + files.length > 5) {
      toast.error("Tối đa 5 ảnh cho mỗi sản phẩm");
      return;
    }

    setImageFiles((prev) => [...prev, ...files]);

    // Create preview URLs
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreviewUrls((prev) => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove image
  const removeImage = (index: number) => {
    const isNewFile = index >= imagePreviewUrls.length - imageFiles.length;

    if (isNewFile) {
      const fileIndex = index - (imagePreviewUrls.length - imageFiles.length);
      setImageFiles((prev) => prev.filter((_, i) => i !== fileIndex));
    }

    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "view") return;

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload new image files and get URLs
      let uploadedImageUrls: string[] = [];
      if (imageFiles.length > 0) {
        const uploadResults = await Promise.all(imageFiles.map((file) => uploadFile(file)));
        uploadedImageUrls = uploadResults.map((res) => res.data?.url || "").filter(Boolean);
      }

      // Combine existing image URLs (from imagePreviewUrls that are not previews) and new uploaded URLs
      // If imagePreviewUrls contains both previews and URLs, filter out previews (base64)
      const existingUrls = imagePreviewUrls.filter((url) => url.startsWith("http"));
      const allImageUrls = [...existingUrls, ...uploadedImageUrls];

      const productData = {
        sku: formData.sku.trim().toLowerCase(),
        title: formData.title.trim(),
        description: formData.description.trim() || "",
        categoryId: parseInt(formData.categoryId),
        images: allImageUrls,
      };

      let productId: number;

      if (mode === "add") {
        // Create product first
        const response = await create(productData);
        if (response.status === 200 || response.status === 201) {
          productId = response.data.id || response.data.product?.id;

          // Create all variants for the new product
          if (variants.length > 0) {
            await Promise.all(
              variants.map((variant) =>
                productVariantService.create({
                  productId,
                  title: variant.title,
                  netPrice: variant.netPrice,
                  retailPrice: variant.retailPrice,
                  supplierId: variant.supplierId,
                })
              )
            );
          }

          toast.success("Thêm sản phẩm thành công");
          closeDialog();
          window.location.reload();
        }
      } else if (mode === "edit" && selectedProduct) {
        productId = selectedProduct.id;

        // Update product first
        const response = await update(selectedProduct.id, productData);
        if (response.status === 200 || response.status === 201) {
          // Handle variant updates - only if there are changes
          const existingVariants = selectedProduct.variants || [];
          const { toDelete, toCreate, toUpdate } = getVariantChanges(existingVariants, variants);

          // Only make API calls if there are actual changes
          const hasVariantChanges = toDelete.length > 0 || toCreate.length > 0 || toUpdate.length > 0;

          if (hasVariantChanges) {
            const apiCalls: Promise<any>[] = [];

            // Delete removed variants
            if (toDelete.length > 0) {
              toDelete.forEach((variant) => {
                apiCalls.push(productVariantService.remove(variant.id));
              });
            }

            // Update existing variants
            if (toUpdate.length > 0) {
              toUpdate.forEach((variant) => {
                apiCalls.push(
                  productVariantService.update(variant.id, {
                    title: variant.title,
                    netPrice: variant.netPrice,
                    retailPrice: variant.retailPrice,
                    supplierId: variant.supplierId,
                  })
                );
              });
            }

            // Create new variants
            if (toCreate.length > 0) {
              toCreate.forEach((variant) => {
                apiCalls.push(
                  productVariantService.create({
                    productId,
                    title: variant.title,
                    netPrice: variant.netPrice,
                    retailPrice: variant.retailPrice,
                    supplierId: variant.supplierId,
                  })
                );
              });
            }

            // Execute all API calls
            await Promise.all(apiCalls);
          }

          toast.success("Cập nhật sản phẩm thành công");
          closeDialog();
          window.location.reload();
        }
      }
    } catch (error: any) {
      console.error("Error saving product:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(mode === "add" ? "Có lỗi xảy ra khi thêm sản phẩm" : "Có lỗi xảy ra khi cập nhật sản phẩm");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete product
  const handleDelete = async () => {
    if (!selectedProduct) return;

    setIsDeleting(true);
    try {
      const response = await remove(selectedProduct.id);
      if (response.status === 200 || response.status === 204) {
        toast.success(`Đã xóa sản phẩm "${selectedProduct.title}" thành công`);
        setDeleteDialogOpen(false);
        closeDialog();
        // Trigger refresh of the parent component
        window.location.reload();
      }
    } catch (error: any) {
      console.error("Error deleting product:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Có lỗi xảy ra khi xóa sản phẩm");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Get dialog title based on mode
  const getDialogTitle = () => {
    switch (mode) {
      case "add":
        return "Thêm sản phẩm mới";
      case "edit":
        return "Chỉnh sửa sản phẩm";
      case "view":
        return "Chi tiết sản phẩm";
      default:
        return "Sản phẩm";
    }
  };

  // Get dialog description based on mode
  const getDialogDescription = () => {
    switch (mode) {
      case "add":
        return "Điền thông tin để thêm sản phẩm mới vào hệ thống.";
      case "edit":
        return "Cập nhật thông tin sản phẩm.";
      case "view":
        return `Thông tin chi tiết của sản phẩm ${selectedProduct?.title || ""}.`;
      default:
        return "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent
        size="xl"
        className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-[80vw] xl:max-w-4xl"
      >
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1 -mx-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-2">
                  SKU <span className="text-red-500">*</span>
                </label>
                <Input
                  id="sku"
                  type="text"
                  placeholder="VD: LAPTOP-DELL-001"
                  value={formData.sku}
                  onChange={(e) => handleInputChange("sku", e.target.value)}
                  disabled={mode === "view"}
                  className={errors.sku ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                />
                {errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku}</p>}
              </div>

              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
                  Danh mục <span className="text-red-500">*</span>
                </label>
                <Autocomplete
                  options={categoryOptions}
                  value={formData.categoryId}
                  onChange={(value) => handleInputChange("categoryId", value?.toString() || "")}
                  disabled={mode === "view" || loadingCategories}
                  loading={loadingCategories}
                  placeholder="Chọn danh mục..."
                  searchPlaceholder="Tìm kiếm danh mục..."
                  noOptionsText="Không tìm thấy danh mục"
                  className={errors.categoryId ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                  variant={errors.categoryId ? "error" : "default"}
                />
                {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Tên sản phẩm <span className="text-red-500">*</span>
              </label>
              <Input
                id="title"
                type="text"
                placeholder="Nhập tên sản phẩm..."
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                disabled={mode === "view"}
                className={errors.title ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả sản phẩm
              </label>
              <Textarea
                id="description"
                placeholder="Nhập mô tả sản phẩm..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                disabled={mode === "view"}
                rows={3}
                className={errors.description ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh sản phẩm</label>

              {mode !== "view" && (
                <div className="mb-4">
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center hover:border-gray-400 transition-colors">
                      <Upload className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mb-2" />
                      <p className="text-xs sm:text-sm text-gray-600">Nhấp để tải lên hoặc kéo thả hình ảnh vào đây</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Hỗ trợ JPG, JPEG, PNG, WEBP. Tối đa 5MB mỗi file, 5 ảnh.
                      </p>
                    </div>
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              )}

              {/* Image Preview */}
              {imagePreviewUrls.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 sm:h-24 object-cover rounded-lg border"
                      />
                      {mode !== "view" && (
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-2 w-2 sm:h-3 sm:w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Variants Management Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">Variants sản phẩm</label>
                {mode !== "view" && (
                  <Button type="button" variant="outline" size="sm" onClick={handleAddVariant} disabled={isSubmitting}>
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm variant
                  </Button>
                )}
              </div>

              {/* Existing Variants List */}
              {variants.length > 0 && (
                <div className="space-y-3 mb-4">
                  {variants.map((variant, index) => {
                    const supplier = suppliers.find((s) => s.id === variant.supplierId);
                    return (
                      <div key={variant.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                              <div>
                                <p className="text-sm font-medium text-gray-600">Tên variant</p>
                                <p className="text-sm text-gray-900">{variant.title}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600">Giá nhập</p>
                                <p className="text-sm text-gray-900 font-mono">
                                  {fCurrency(variant.netPrice, { currency: "VND" })}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600">Giá bán</p>
                                <p className="text-sm text-gray-900 font-mono">
                                  {fCurrency(variant.retailPrice, { currency: "VND" })}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600">Nhà cung cấp</p>
                                <p className="text-sm text-gray-900">{supplier?.name || "N/A"}</p>
                              </div>
                            </div>
                          </div>
                          {mode !== "view" && (
                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditVariant(variant)}
                                disabled={isSubmitting}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemoveVariant(variant.id)}
                                disabled={isSubmitting}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Variant Form */}
              {showVariantForm && (
                <div className="border rounded-lg p-4 bg-blue-50 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">
                      {editingVariant ? "Chỉnh sửa variant" : "Thêm variant mới"}
                    </h4>
                    <Button type="button" variant="outline" size="sm" onClick={handleCancelVariantForm}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="variant-title" className="block text-sm font-medium text-gray-700 mb-1">
                        Tên variant <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="variant-title"
                        type="text"
                        placeholder="VD: Màu đỏ, Size L..."
                        value={variantFormData.title}
                        onChange={(e) => handleVariantInputChange("title", e.target.value)}
                        className={
                          variantFormErrors.title ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""
                        }
                      />
                      {variantFormErrors.title && (
                        <p className="mt-1 text-sm text-red-600">{variantFormErrors.title}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="variant-supplier" className="block text-sm font-medium text-gray-700 mb-1">
                        Nhà cung cấp <span className="text-red-500">*</span>
                      </label>
                      <Autocomplete
                        options={supplierOptions}
                        value={variantFormData.supplierId}
                        onChange={(value) => handleVariantInputChange("supplierId", value?.toString() || "")}
                        disabled={loadingSuppliers}
                        loading={loadingSuppliers}
                        placeholder="Chọn nhà cung cấp..."
                        searchPlaceholder="Tìm kiếm nhà cung cấp..."
                        noOptionsText="Không tìm thấy nhà cung cấp"
                        className={
                          variantFormErrors.supplierId ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""
                        }
                        variant={variantFormErrors.supplierId ? "error" : "default"}
                      />
                      {variantFormErrors.supplierId && (
                        <p className="mt-1 text-sm text-red-600">{variantFormErrors.supplierId}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="variant-net-price" className="block text-sm font-medium text-gray-700 mb-1">
                        Giá nhập <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="variant-net-price"
                          type="number"
                          placeholder="0"
                          value={variantFormData.netPrice}
                          onChange={(e) => handleVariantInputChange("netPrice", e.target.value)}
                          className={`pl-10 ${
                            variantFormErrors.netPrice ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""
                          }`}
                          min="0"
                          step="1000"
                        />
                      </div>
                      {variantFormErrors.netPrice && (
                        <p className="mt-1 text-sm text-red-600">{variantFormErrors.netPrice}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="variant-retail-price" className="block text-sm font-medium text-gray-700 mb-1">
                        Giá bán <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="variant-retail-price"
                          type="number"
                          placeholder="0"
                          value={variantFormData.retailPrice}
                          onChange={(e) => handleVariantInputChange("retailPrice", e.target.value)}
                          className={`pl-10 ${
                            variantFormErrors.retailPrice
                              ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                              : ""
                          }`}
                          min="0"
                          step="1000"
                        />
                      </div>
                      {variantFormErrors.retailPrice && (
                        <p className="mt-1 text-sm text-red-600">{variantFormErrors.retailPrice}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={handleCancelVariantForm}>
                      Hủy
                    </Button>
                    <Button type="button" variant="primary" onClick={handleSaveVariant}>
                      {editingVariant ? "Cập nhật" : "Thêm variant"}
                    </Button>
                  </div>
                </div>
              )}

              {variants.length === 0 && !showVariantForm && (
                <div className="text-center py-6 text-gray-500">
                  <p className="text-sm">Chưa có variant nào được thêm</p>
                  {mode !== "view" && <p className="text-xs mt-1">Nhấp "Thêm variant" để tạo variant đầu tiên</p>}
                </div>
              )}
            </div>

            {/* Show additional info in view/edit mode */}
            {mode !== "add" && selectedProduct && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">ID</label>
                  <p className="text-sm text-gray-900 font-mono">#{selectedProduct.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Ngày tạo</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedProduct.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Cập nhật lần cuối</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedProduct.updatedAt)}</p>
                </div>
              </div>
            )}
          </form>
        </div>

        <DialogFooter className="flex-shrink-0 mt-6">
          <div className="flex flex-col sm:flex-row sm:justify-between w-full gap-3 sm:gap-2">
            {/* Delete button on the left (only in view mode) */}
            {mode === "view" && selectedProduct && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa sản phẩm
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
                  onClick={handleSubmit}
                >
                  {mode === "add" ? "Thêm sản phẩm" : "Cập nhật"}
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
        title="Xóa sản phẩm"
        description={`Bạn có chắc chắn muốn xóa sản phẩm "${selectedProduct?.title}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa sản phẩm"
        isLoading={isDeleting}
      />
    </Dialog>
  );
};
