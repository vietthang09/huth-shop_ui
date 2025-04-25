"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import { getAllProducts } from "@/actions/product/product";
import { getTopSellingProducts, updateTopSellingProducts } from "@/actions/product/topSelling";
import { DashboardHeading } from "@/components/dashboard/DashboardHeading";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { TProduct } from "@/types/product";

export default function TopSellingPage() {
  const [products, setProducts] = useState<TProduct[]>([]);
  const [topSellingProducts, setTopSellingProducts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const allProducts = await getAllProducts();
        setProducts(allProducts || []);

        const topSelling = await getTopSellingProducts();
        setTopSellingProducts(topSelling || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Không thể tải dữ liệu sản phẩm");
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
    try {
      await updateTopSellingProducts(topSellingProducts);
      toast.success("Đã cập nhật sản phẩm bán chạy");
    } catch (error) {
      console.error("Error saving top selling products:", error);
      toast.error("Không thể cập nhật sản phẩm bán chạy");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="container py-10">
      <DashboardHeading title="Quản lý sản phẩm bán chạy" description="Chọn sản phẩm hiển thị ở trang chủ" />

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
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {isLoading ? (
          <div className="text-center py-10">Đang tải dữ liệu...</div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <div key={product._id} className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={product._id}
                    checked={topSellingProducts.includes(product._id)}
                    onCheckedChange={() => toggleProduct(product._id)}
                  />
                  <label htmlFor={product._id} className="cursor-pointer flex-1">
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

            {filteredProducts.length === 0 && (
              <div className="text-center py-10 text-gray-500">Không tìm thấy sản phẩm</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
