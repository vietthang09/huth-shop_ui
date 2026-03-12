import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Autocomplete,
  AutocompleteItem,
} from "@heroui/react";
import { RichTextEditor } from "@/components/ui";
import { useProductDialog } from "./ProductDialogContext";
import { create, update, remove } from "@/services/product";
import { uploadFile } from "@/services/cloud";
import { findAll as findAllCategories } from "@/services/category";
import { findAll as findAllSuppliers, TSupplier } from "@/services/supplier";
import * as productVariantService from "@/services/product-variants";
import { TProductVariant } from "@/services/product-variants";
import { ProductVariantKind } from "@/types/product";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { toast } from "sonner";
import { Trash2, Upload, X, Plus, Edit3, DollarSign, Package, PackagePlus, Pen, Hash, Clock } from "lucide-react";
import { fCurrency } from "@/shared/utils/format-number";
import { Category, Supplier } from "@/services/type";

type FormData = {
  sku: string;
  title: string;
  description: string;
  shortDescription: string;
  categoryId: string;
};

type FormErrors = {
  sku?: string;
  title?: string;
  description?: string;
  shortDescription?: string;
  categoryId?: string;
};

type VariantFormData = {
  id?: number;
  title: string;
  netPrice: string;
  retailPrice: string;
  salePrice: string;
  supplierId: string;
  kind?: ProductVariantKind | string;
  fields?: Array<{
    label: string;
    type?: string;
    required?: boolean;
  }>;
};

type VariantFormErrors = {
  title?: string;
  netPrice?: string;
  retailPrice?: string;
  salePrice?: string;
  supplierId?: string;
  kind?: string;
  fields?: string;
};

type VariantFormField = "title" | "netPrice" | "retailPrice" | "salePrice" | "supplierId" | "kind";

export const ProductDialog: React.FC = () => {
  const { isOpen, mode, selectedProduct, closeDialog, isSubmitting, setIsSubmitting } = useProductDialog();

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [categories, setCategories] = React.useState<Category[]>([]);
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
    salePrice: "",
    supplierId: "",
    kind: "",
    fields: [],
  });
  const [variantFormErrors, setVariantFormErrors] = React.useState<VariantFormErrors>({});

  // Convert categories to autocomplete options
  const categoryOptions = React.useMemo(() => {
    return categories.map((category) => ({
      value: category.id.toString(),
      label: category.title,
    }));
  }, [categories]);

  // Convert suppliers to autocomplete options
  const supplierOptions = React.useMemo(() => {
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
    shortDescription: "",
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
          setCategories(categoriesResponse.data.data as Category[]);
        }

        if (suppliersResponse.status === 200) {
          setSuppliers(suppliersResponse.data as Supplier[]);
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
          shortDescription: "",
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
          shortDescription: selectedProduct.shortDescription || "",
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
          setVariants(
            selectedProduct.variants.map((v) => ({
              ...v,
              fields: v.fields ? [...v.fields] : [],
            })),
          );
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
        salePrice: "",
        supplierId: "",
        kind: "",
      });
      setVariantFormErrors({});
    } else {
      setFormData({
        sku: "",
        title: "",
        description: "",
        shortDescription: "",
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
        salePrice: "",
        supplierId: "",
        kind: "",
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
    } else if (formData.title.trim().length > 200) {
      newErrors.title = "Tên sản phẩm không được vượt quá 200 ký tự";
    }

    // if (formData.description.length > 100000) {
    //   newErrors.description = "Mô tả không được vượt quá 1000 ký tự";
    // }

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
      salePrice: "",
      supplierId: "",
      kind: "",
      fields: [],
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
      salePrice: variant.salePrice?.toString() || "",
      supplierId: variant.supplierId.toString(),
      kind: variant.kind || "",
      fields: variant.fields ? [...variant.fields] : [],
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
      salePrice: Number(variantFormData.salePrice),
      supplierId: Number(variantFormData.supplierId),
      kind: (variantFormData.kind as ProductVariantKind) || undefined,
      fields: variantFormData.fields ? [...variantFormData.fields] : [],
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
      salePrice: "",
      supplierId: "",
      kind: "",
      fields: [],
    });
    setVariantFormErrors({});
  };
  // Handlers for fields array in variant form
  const handleAddField = () => {
    setVariantFormData((prev) => ({
      ...prev,
      fields: [...(prev.fields || []), { label: "", type: "", required: false }],
    }));
  };

  const handleRemoveField = (index: number) => {
    setVariantFormData((prev) => ({
      ...prev,
      fields: (prev.fields || []).filter((_, i) => i !== index),
    }));
  };

  const handleFieldChange = (index: number, key: "label" | "type" | "required", value: string | boolean) => {
    setVariantFormData((prev) => {
      const updatedFields = (prev.fields || []).map((field, i) => (i === index ? { ...field, [key]: value } : field));
      return { ...prev, fields: updatedFields };
    });
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
        shortDescription: formData.shortDescription.trim() || "",
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
                  kind: variant.kind,
                  fields: variant.fields || [],
                }),
              ),
            );
          }

          toast.success("Thêm sản phẩm thành công");
          closeDialog();
          // window.location.reload();
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
                    ...(variant.salePrice && { salePrice: variant.salePrice }),
                    supplierId: variant.supplierId,
                    kind: variant.kind,
                    fields: variant.fields || [],
                  }),
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
                    ...(variant.salePrice && { salePrice: variant.salePrice }),
                    supplierId: variant.supplierId,
                    kind: variant.kind,
                    fields: variant.fields || [],
                  }),
                );
              });
            }

            // Execute all API calls
            await Promise.all(apiCalls);
          }

          toast.success("Cập nhật sản phẩm thành công");
          closeDialog();
          // window.location.reload();
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
        // window.location.reload();
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
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={closeDialog}
        size="4xl"
        scrollBehavior="inside"
        classNames={{ base: "max-h-[90vh]" }}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex items-start gap-3 border-b border-divider">
                <div
                  className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                    mode === "add"
                      ? "bg-success-100 text-success-600"
                      : mode === "edit"
                        ? "bg-primary-100 text-primary-600"
                        : "bg-default-100 text-default-600"
                  }`}
                >
                  {mode === "add" ? (
                    <PackagePlus className="h-5 w-5" />
                  ) : mode === "edit" ? (
                    <Pen className="h-5 w-5" />
                  ) : (
                    <Package className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold leading-tight">{getDialogTitle()}</h2>
                  <p className="text-sm text-default-400 font-normal mt-0.5">{getDialogDescription()}</p>
                </div>
              </ModalHeader>

              <ModalBody>
                <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="SKU"
                      isRequired
                      placeholder="VD: LAPTOP-DELL-001"
                      value={formData.sku}
                      onValueChange={(v) => handleInputChange("sku", v)}
                      isDisabled={mode === "view"}
                      isInvalid={!!errors.sku}
                      errorMessage={errors.sku}
                    />
                    <Autocomplete
                      label="Danh mục"
                      isRequired
                      defaultItems={categoryOptions}
                      selectedKey={formData.categoryId || null}
                      onSelectionChange={(key) => handleInputChange("categoryId", key?.toString() || "")}
                      isDisabled={mode === "view" || loadingCategories}
                      isLoading={loadingCategories}
                      placeholder="Chọn danh mục..."
                      isInvalid={!!errors.categoryId}
                      errorMessage={errors.categoryId}
                    >
                      {(item) => <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>}
                    </Autocomplete>
                  </div>

                  <Input
                    label="Tên sản phẩm"
                    isRequired
                    placeholder="Nhập tên sản phẩm..."
                    value={formData.title}
                    onValueChange={(v) => handleInputChange("title", v)}
                    isDisabled={mode === "view"}
                    isInvalid={!!errors.title}
                    errorMessage={errors.title}
                  />

                  <Input
                    label="Mô tả ngắn"
                    placeholder="Nhập mô tả ngắn về sản phẩm..."
                    value={formData.shortDescription}
                    onValueChange={(v) => handleInputChange("shortDescription", v)}
                    isDisabled={mode === "view"}
                  />

                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-default-400 whitespace-nowrap">
                        Mô tả sản phẩm
                      </span>
                      <div className="flex-1 h-px bg-divider" />
                    </div>
                    <RichTextEditor
                      value={formData.description}
                      onChange={(content) => handleInputChange("description", content)}
                      placeholder="Nhập mô tả sản phẩm..."
                      disabled={mode === "view"}
                      height="250px"
                    />
                    {errors.description && <p className="mt-1 text-sm text-danger">{errors.description}</p>}
                  </div>

                  {/* Image Upload Section */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-default-400 whitespace-nowrap">
                        Hình ảnh sản phẩm
                      </span>
                      <div className="flex-1 h-px bg-divider" />
                    </div>

                    {mode !== "view" && (
                      <div className="mb-4">
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <div className="border-2 border-dashed border-default-300 rounded-xl p-6 text-center hover:border-primary-300 hover:bg-primary-50/30 transition-all duration-200">
                            <div className="mx-auto w-10 h-10 rounded-full bg-default-100 flex items-center justify-center mb-3">
                              <Upload className="h-5 w-5 text-default-500" />
                            </div>
                            <p className="text-sm text-default-600 font-medium">
                              Nhấp để tải lên hoặc kéo thả hình ảnh vào đây
                            </p>
                            <p className="text-xs text-default-400 mt-1">
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

                    {imagePreviewUrls.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                        {imagePreviewUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 sm:h-28 object-cover rounded-xl border border-default-200"
                            />
                            {mode !== "view" && (
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-1.5 -right-1.5 bg-danger text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Variants Management Section */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xs font-semibold uppercase tracking-wider text-default-400 whitespace-nowrap">
                        Variants sản phẩm
                      </span>
                      <div className="flex-1 h-px bg-divider" />
                      {mode !== "view" && (
                        <Button
                          type="button"
                          size="sm"
                          color="primary"
                          variant="flat"
                          onPress={handleAddVariant}
                          isDisabled={isSubmitting}
                          className="shrink-0"
                        >
                          <Plus className="h-4 w-4" />
                          Thêm variant
                        </Button>
                      )}
                    </div>

                    {variants.length > 0 && (
                      <div className="space-y-3 mb-4">
                        {variants.map((variant) => {
                          const supplier = suppliers.find((s) => s.id === variant.supplierId);
                          return (
                            <div key={variant.id} className="relative border border-default-200 rounded-xl p-4 pl-5 bg-default-50 overflow-hidden">
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-xl" />
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                    <div>
                                      <p className="text-xs font-semibold uppercase tracking-wide text-default-400">Tên variant</p>
                                      <div className="flex items-center gap-1.5 mt-0.5">
                                        <p className="text-sm text-foreground font-medium">{variant.title}</p>
                                        {variant.kind && (
                                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary-100 text-primary-700 font-semibold leading-none">
                                            {variant.kind === "ownership_upgrade" ? "Upgrade" : variant.kind === "pre_made_account" ? "Pre-made" : "Sharing"}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div>
                                      <p className="text-xs font-semibold uppercase tracking-wide text-default-400">Giá nhập</p>
                                      <p className="text-sm text-foreground font-mono mt-0.5">
                                        {fCurrency(variant.netPrice, { currency: "VND" })}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs font-semibold uppercase tracking-wide text-default-400">Giá bán</p>
                                      <p className="text-sm text-foreground font-mono mt-0.5">
                                        {fCurrency(variant.retailPrice, { currency: "VND" })}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs font-semibold uppercase tracking-wide text-default-400">Nhà cung cấp</p>
                                      <p className="text-sm text-foreground mt-0.5">{supplier?.name || "N/A"}</p>
                                    </div>
                                  </div>
                                </div>
                                {mode !== "view" && (
                                  <div className="flex items-center gap-2 ml-4">
                                    <Button
                                      type="button"
                                      variant="bordered"
                                      size="sm"
                                      isIconOnly
                                      onPress={() => handleEditVariant(variant)}
                                      isDisabled={isSubmitting}
                                    >
                                      <Edit3 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      color="danger"
                                      size="sm"
                                      isIconOnly
                                      onPress={() => handleRemoveVariant(variant.id)}
                                      isDisabled={isSubmitting}
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

                    {showVariantForm && (
                      <div className="border border-default-200 rounded-xl p-5 bg-content2 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-foreground">
                            {editingVariant ? "Chỉnh sửa variant" : "Thêm variant mới"}
                          </h4>
                          <Button
                            type="button"
                            variant="light"
                            size="sm"
                            isIconOnly
                            onPress={handleCancelVariantForm}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Input
                            label="Tên variant"
                            isRequired
                            placeholder="VD: Màu đỏ, Size L..."
                            value={variantFormData.title}
                            onValueChange={(v) => handleVariantInputChange("title", v)}
                            isInvalid={!!variantFormErrors.title}
                            errorMessage={variantFormErrors.title}
                          />

                          <Autocomplete
                            label="Nhà cung cấp"
                            isRequired
                            defaultItems={supplierOptions}
                            selectedKey={variantFormData.supplierId || null}
                            onSelectionChange={(key) => handleVariantInputChange("supplierId", key?.toString() || "")}
                            isDisabled={loadingSuppliers}
                            isLoading={loadingSuppliers}
                            placeholder="Chọn nhà cung cấp..."
                            isInvalid={!!variantFormErrors.supplierId}
                            errorMessage={variantFormErrors.supplierId}
                          >
                            {(item) => <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>}
                          </Autocomplete>

                          <Select
                            label="Loại variant (tuỳ chọn)"
                            selectedKeys={variantFormData.kind ? new Set([variantFormData.kind]) : new Set()}
                            onSelectionChange={(keys) =>
                              handleVariantInputChange("kind", Array.from(keys)[0]?.toString() || "")
                            }
                            placeholder="-- Không chọn --"
                          >
                            <SelectItem key="ownership_upgrade">Ownership upgrade</SelectItem>
                            <SelectItem key="pre_made_account">Pre-made account</SelectItem>
                            <SelectItem key="sharing">Sharing</SelectItem>
                          </Select>

                          <Input
                            label="Giá nhập"
                            isRequired
                            type="number"
                            placeholder="0"
                            value={variantFormData.netPrice}
                            onValueChange={(v) => handleVariantInputChange("netPrice", v)}
                            isInvalid={!!variantFormErrors.netPrice}
                            errorMessage={variantFormErrors.netPrice}
                            min={0}
                            step={1000}
                            startContent={
                              <DollarSign className="h-4 w-4 text-default-400 pointer-events-none flex-shrink-0" />
                            }
                          />

                          <Input
                            label="Giá bán"
                            isRequired
                            type="number"
                            placeholder="0"
                            value={variantFormData.retailPrice}
                            onValueChange={(v) => handleVariantInputChange("retailPrice", v)}
                            isInvalid={!!variantFormErrors.retailPrice}
                            errorMessage={variantFormErrors.retailPrice}
                            min={0}
                            step={1000}
                            startContent={
                              <DollarSign className="h-4 w-4 text-default-400 pointer-events-none flex-shrink-0" />
                            }
                          />

                          <Input
                            label="Giá khuyến mãi (tuỳ chọn)"
                            type="number"
                            placeholder="0"
                            value={variantFormData.salePrice}
                            onValueChange={(v) => handleVariantInputChange("salePrice", v)}
                            isInvalid={!!variantFormErrors.salePrice}
                            errorMessage={variantFormErrors.salePrice}
                            min={0}
                            step={1000}
                            startContent={
                              <DollarSign className="h-4 w-4 text-default-400 pointer-events-none flex-shrink-0" />
                            }
                          />
                        </div>

                        {/* Fields Array Section */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-foreground">Trường tuỳ chỉnh (fields)</span>
                            <Button type="button" size="sm" variant="bordered" onPress={handleAddField}>
                              <Plus className="h-4 w-4 mr-1" /> Thêm trường
                            </Button>
                          </div>
                          {(variantFormData.fields || []).length === 0 && (
                            <div className="text-default-400 text-sm">Chưa có trường nào</div>
                          )}
                          {(variantFormData.fields || []).map((field, idx) => (
                            <div key={idx} className="flex gap-2 mb-2 items-center">
                              <Input
                                type="text"
                                placeholder="Nhãn trường (label)"
                                value={field.label}
                                onValueChange={(v) => handleFieldChange(idx, "label", v)}
                                className="w-1/3"
                              />
                              <Select
                                selectedKeys={field.type ? new Set([field.type]) : new Set()}
                                onSelectionChange={(keys) =>
                                  handleFieldChange(idx, "type", Array.from(keys)[0]?.toString() || "")
                                }
                                placeholder="Kiểu dữ liệu"
                                className="flex-1"
                              >
                                <SelectItem key="string">Văn bản</SelectItem>
                                <SelectItem key="number">Số</SelectItem>
                                <SelectItem key="boolean">Đúng/Sai</SelectItem>
                              </Select>
                              <label className="flex items-center gap-1 text-xs">
                                <input
                                  type="checkbox"
                                  checked={!!field.required}
                                  onChange={(e) => handleFieldChange(idx, "required", e.target.checked)}
                                />
                                Bắt buộc
                              </label>
                              <Button
                                type="button"
                                size="sm"
                                isIconOnly
                                color="danger"
                                onPress={() => handleRemoveField(idx)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="bordered" onPress={handleCancelVariantForm}>
                            Hủy
                          </Button>
                          <Button type="button" color="primary" onPress={handleSaveVariant}>
                            {editingVariant ? "Cập nhật" : "Thêm variant"}
                          </Button>
                        </div>
                      </div>
                    )}

                    {variants.length === 0 && !showVariantForm && (
                      <div className="text-center py-8 text-default-400">
                        <Package className="mx-auto h-10 w-10 mb-3 opacity-30" />
                        <p className="text-sm">Chưa có variant nào được thêm</p>
                        {mode !== "view" && (
                          <p className="text-xs mt-1">Nhấp "Thêm variant" để tạo variant đầu tiên</p>
                        )}
                      </div>
                    )}
                  </div>

                  {mode !== "add" && selectedProduct && (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold uppercase tracking-wider text-default-400 whitespace-nowrap">
                          Thông tin hệ thống
                        </span>
                        <div className="flex-1 h-px bg-divider" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-default-50 rounded-xl border border-default-100">
                        <div className="flex items-start gap-2">
                          <Hash className="h-4 w-4 text-default-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs text-default-400 font-medium">ID</p>
                            <p className="text-sm text-foreground font-mono">#{selectedProduct.id}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Clock className="h-4 w-4 text-default-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs text-default-400 font-medium">Ngày tạo</p>
                            <p className="text-sm text-foreground">{formatDate(selectedProduct.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Clock className="h-4 w-4 text-default-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs text-default-400 font-medium">Cập nhật lần cuối</p>
                            <p className="text-sm text-foreground">{formatDate(selectedProduct.updatedAt)}</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </form>
              </ModalBody>

              <ModalFooter className="border-t border-divider">
                <div className="flex flex-col sm:flex-row sm:justify-between w-full gap-3 sm:gap-2">
                  {mode === "view" && selectedProduct && (
                    <Button
                      type="button"
                      color="danger"
                      onPress={() => setDeleteDialogOpen(true)}
                      isDisabled={isSubmitting}
                      className="w-full sm:w-auto"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Xóa sản phẩm
                    </Button>
                  )}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 sm:ml-auto">
                    <Button
                      type="button"
                      variant="bordered"
                      onPress={closeDialog}
                      isDisabled={isSubmitting}
                      className="w-full sm:w-auto"
                    >
                      {mode === "view" ? "Đóng" : "Hủy"}
                    </Button>
                    {mode !== "view" && (
                      <Button
                        type="submit"
                        form="product-form"
                        color="primary"
                        isDisabled={isSubmitting}
                        isLoading={isSubmitting}
                        className="w-full sm:w-auto"
                      >
                        {mode === "add" ? "Thêm sản phẩm" : "Cập nhật"}
                      </Button>
                    )}
                  </div>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Xóa sản phẩm"
        description={`Bạn có chắc chắn muốn xóa sản phẩm "${selectedProduct?.title}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa sản phẩm"
        isLoading={isDeleting}
      />
    </>
  );
};
