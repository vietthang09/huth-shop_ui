"use client";

import { useEffect, useState } from "react";

import { addProduct, getAllProducts } from "@/actions/product/product";
import ProductForm from "@/components/admin/product/productForm";
import ProductListItem from "@/components/admin/product/productListItem";
import Button from "@/components/UI/button";
import Popup from "@/components/UI/popup";
import { TAddProductFormValues, TProductListItem } from "@/types/product";

const initialForm: TAddProductFormValues = {
  name: "",
  brandID: "",
  specialFeatures: ["", "", ""],
  isAvailable: false,
  desc: "",
  price: "",
  salePrice: "",
  images: [],
  categoryID: "",
  specifications: [],
};

const AdminProducts = () => {
  const [showProductWindow, setShowProductWindow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formValues, setFormValues] = useState<TAddProductFormValues>(initialForm);
  const [productsList, setProductsList] = useState<TProductListItem[]>([]);

  useEffect(() => {
    getProductsList();
  }, []);

  const getProductsList = async () => {
    const response = await getAllProducts();
    if (response.res) setProductsList(response.res);
  };

  const handleAddProduct = async () => {
    setIsLoading(true);
    const result = await addProduct(formValues);
    if (result.error) {
      setIsLoading(false);
    }
    if (result.res) {
      setIsLoading(false);
      setShowProductWindow(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center h-20 mb-8">
        <Button onClick={() => setShowProductWindow(true)}>Add new product</Button>
      </div>
      <div className="flex flex-col text-sm text-gray-800">
        {productsList.length ? (
          <>
            {productsList.map((product) => (
              <ProductListItem key={product.id} data={product} requestReload={getProductsList} />
            ))}
          </>
        ) : (
          <div>There is no product!</div>
        )}
      </div>
      {showProductWindow && (
        <Popup
          content={<ProductForm formValues={formValues} onChange={setFormValues} />}
          isLoading={isLoading}
          onCancel={() => setShowProductWindow(false)}
          onClose={() => setShowProductWindow(false)}
          onSubmit={() => handleAddProduct()}
          confirmBtnText="Add Product"
          title="Add New Product"
        />
      )}
    </div>
  );
};

export default AdminProducts;
