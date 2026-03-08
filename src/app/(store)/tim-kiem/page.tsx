"use client";

import { fCurrency } from "@/shared/utils/format-number";
import { Clock } from "lucide-react";
import { CircularProgress, NumberInput } from "@heroui/react";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";
import { Select, SelectItem } from "@heroui/react";
import { Pagination } from "@heroui/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { findAll } from "@/services/product";
import { Product } from "@/services/type";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  useEffect(() => {
    const query = searchParams.get("tu-khoa");

    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const res = await findAll({
          search: query || "",
        });

        setProducts(res.data.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  return (
    <div className="max-w-7xl mx-auto">
      <Breadcrumbs className="mt-8">
        <BreadcrumbItem>HuthShop</BreadcrumbItem>
        <BreadcrumbItem>Netflix</BreadcrumbItem>
      </Breadcrumbs>
      <div className="mt-6 grid grid-cols-4 gap-4">
        <div className="col-span-1">
          <div>
            <h2 className="font-semibold">Khoảng giá</h2>
            <div className="mt-4 flex items-center gap-2">
              <NumberInput placeholder="Từ" />
              <span>-</span>
              <NumberInput placeholder="Đến" />
            </div>
          </div>
        </div>
        <div className="col-span-3">
          {isLoading ? (
            <div className="min-h-96 flex justify-center items-center">
              <CircularProgress aria-label="Loading..." size="lg" color="primary" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span>Tìm thấy {products.length} kết quả</span>
                <Select className="max-w-64" size="sm" label="Sắp xếp theo" defaultSelectedKeys={["0"]}>
                  <SelectItem key={0}>Đề xuất</SelectItem>
                  <SelectItem key={1}>Giá từ thấp đến cao</SelectItem>
                  <SelectItem key={2}>Giá từ cao đến thấp</SelectItem>
                </Select>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-4">
                {products.map((product) => (
                  <Card>
                    <CardHeader className="flex gap-3">
                      <h3 className="font-semibold">{product.title}</h3>
                    </CardHeader>
                    <CardBody>
                      <div className="mt-2 flex justify-between gap-4">
                        <p className="text-sm text-gray-400">{product.description}</p>
                        <img width={56} height={56} className="rounded-xl" src={product.images[0]} />
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <span>{fCurrency(product.variants[0].retailPrice)}</span>
                        <span className="flex items-center gap-2">
                          <Clock size={16} /> 10 phút
                        </span>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
              <div className="mt-8 flex justify-center">
                <Pagination initialPage={1} total={10} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
