"use client";

import { useEffect, useState } from "react";

import { getAllProducts } from "@/actions/product/product";
import { getTopSellingProducts, updateTopSellingProducts } from "@/actions/product/topSelling";
import Button from "@/components/UI/button";
import Input from "@/components/UI/input";
import { TProduct } from "@/types/product";

export default function TopSellingPage() {
  const [products, setProducts] = useState<TProduct[]>([]);
  const [topSellingProducts, setTopSellingProducts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch products
        const productsResponse = await getAllProducts();
        if (productsResponse.res) {
          setProducts(productsResponse.res);
        }

        // Fetch current top selling products
        const topSellingResponse = await getTopSellingProducts();
        if (topSellingResponse.res) {
          setTopSellingProducts(topSellingResponse.res);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrorMessage("Lỗi khi tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleProduct = (productId: string) => {
    setTopSellingProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    try {
      await updateTopSellingProducts(topSellingProducts);
      setSuccessMessage("Đã cập nhật sản phẩm bán chạy");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Error saving top selling products:", error);
      setErrorMessage("Không thể cập nhật sản phẩm bán chạy");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="container py-10">
      <div className="flex flex-col mb-6">
        <h1 className="text-2xl font-bold mb-2">Quản lý sản phẩm bán chạy</h1>
        <p className="text-gray-600">Chọn sản phẩm hiển thị ở trang chủ</p>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <Input
          placeholder="Tìm kiếm sản phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>

        {successMessage && <span className="text-green-600">{successMessage}</span>}

        {errorMessage && <span className="text-red-500">{errorMessage}</span>}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {isLoading ? (
          <div className="text-center py-10">Đang tải dữ liệu...</div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={product.id}
                    checked={topSellingProducts.includes(product.id)}
                    onChange={() => toggleProduct(product.id)}
                    className="h-4 w-4"
                  />
                  <label htmlFor={product.id} className="cursor-pointer flex-1">
                    {product.name}
                  </label>
                </div>
                <div className="text-sm text-gray-500">
                  {product.price.toLocaleString("vi-VN")}₫
                  {product.salePrice && (
                    <span className="ml-2 text-red-500">{product.salePrice.toLocaleString("vi-VN")}₫</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
