"use client";
import { useState } from "react";

import { deleteProduct, updateProduct, getOneProduct } from "@/actions/product/product";
import Button from "@/components/UI/button";
import Popup from "@/components/UI/popup";
import ProductForm from "@/components/admin/product/productForm";
import { TProductListItem, TAddProductFormValues } from "@/types/product";

type TProps = {
  data: TProductListItem;
  requestReload: () => void;
};

const ProductListItem = ({ data, requestReload }: TProps) => {
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formValues, setFormValues] = useState<TAddProductFormValues>({
    name: "",
    brandID: "",
    specialFeatures: [],
    isAvailable: false,
    desc: "",
    price: "",
    salePrice: "",
    images: [],
    categoryID: "",
    specifications: [],
  });

  const handleDelete = async () => {
    setIsLoading(true);
    const response = await deleteProduct(data.id);
    if (response.error) {
      setIsLoading(false);
    }
    if (response.res) {
      setIsLoading(false);
      requestReload();
    }
  };

  const handleEdit = async () => {
    setIsLoading(true);
    const response = await updateProduct({
      ...formValues,
      id: data.id,
      price: formValues.price || "0",
      salePrice: formValues.salePrice || "",
      specialFeatures: formValues.specialFeatures.length ? formValues.specialFeatures : ["", "", ""],
    });

    if (response.error) {
      console.error("Update error:", response.error);
      setIsLoading(false);
    }
    if (response.res) {
      setIsLoading(false);
      setShowEdit(false);
      requestReload();
    }
  };

  const handleShowEdit = async () => {
    setIsLoading(true);
    const response = await getOneProduct(data.id);
    if (response.error) {
      setIsLoading(false);
      return;
    }
    if (response.res) {
      const product = response.res;
      setFormValues({
        name: product.name,
        brandID: product.brandID || "",
        specialFeatures: product.specialFeatures || ["", "", ""],
        isAvailable: product.isAvailable,
        desc: product.desc || "",
        richDesc: product.richDesc || "",
        price: product.price ? product.price.toString() : "",
        salePrice: product.salePrice ? product.salePrice.toString() : "",
        images: product.images || [],
        categoryID: product.category.id,
        specifications: product.specifications || [],
      });
      setIsLoading(false);
      setShowEdit(true);
    }
  };

  return (
    <div className="w-full h-12 px-4 grid grid-cols-3 justify-between items-center text-sm text-gray-800 rounded-lg transition-colors duration-300 select-none hover:bg-gray-100">
      <span className={"styles.name"}>{data.name}</span>
      <span className={"styles.category"}>{data.category.name}</span>
      <div className="flex gap-2 justify-end">
        <Button onClick={handleShowEdit}>edit</Button>
        <Button onClick={() => setShowDelete(true)}>delete</Button>
      </div>
      {showDelete && (
        <Popup
          content={<span className="block text-center p-6 pb-10">Are You Sure?</span>}
          width="300px"
          isLoading={isLoading}
          onCancel={() => setShowDelete(false)}
          onClose={() => setShowDelete(false)}
          onSubmit={() => handleDelete()}
          cancelBtnText="NO"
          confirmBtnText="YES"
        />
      )}
      {showEdit && (
        <Popup
          content={<ProductForm formValues={formValues} onChange={setFormValues} />}
          width="1000px" // Change from 500px to 1000px to accommodate the wider form
          isLoading={isLoading}
          onCancel={() => setShowEdit(false)}
          onClose={() => setShowEdit(false)}
          onSubmit={() => handleEdit()}
          cancelBtnText="Cancel"
          confirmBtnText="Save"
        />
      )}
    </div>
  );
};

export default ProductListItem;
