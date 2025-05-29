"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

import { getProductsByCategory } from "@/actions/product/categoryProducts";
import { searchProducts, getAllProducts } from "@/actions/product/product";
import ProductCard from "@/components/store/common/productCard";
import Filters from "@/components/store/listPage/filters";
import { SK_Box } from "@/components/UI/skeleton";
import { TFilters } from "@/types/product";
import { TListSort, TPageStatus } from "@/types/list";
import { ChevronLeft, ChevronRight, Filter, Search, SortDesc } from "lucide-react";

interface ProductType {
  id: number;
  title: string;
  sku: string;
  image?: string | null;
  cardColor?: string | null;
  properties: Array<{
    retailPrice: number | any; // Using any to handle Prisma Decimal type
    salePrice?: number | null | any; // Using any to handle Prisma Decimal type
  }>;
  isAvailable?: boolean;
  supplier?: { name: string } | null;
  category?: { name: string; slug: string } | null;
  categoryId?: number | null;
  supplierId?: number | null;
  lowestPrice?: number; // Added for category API response
  lowestSalePrice?: number | null; // Added for category API response
}

const ListPage = () => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageStatus, setPageStatus] = useState<TPageStatus>("pageLoading");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [searchTerm, setSearchTerm] = useState("");

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Filters state
  const [filters, setFilters] = useState<TFilters>({
    category: "",
  });
  // Extract category from URL parameters
  useEffect(() => {
    const params = pathname.split("/").filter((segment) => segment && segment !== "danh-muc");
    if (params.length > 0) {
      const categoryId = params[0];
      if (categoryId) {
        setFilters((prevFilters) => ({
          ...prevFilters,
          category: categoryId,
        }));
      }
    }

    // Get any existing search parameters
    const search = searchParams.get("search");
    if (search) {
      setSearchTerm(search);
      setFilters((prevFilters) => ({
        ...prevFilters,
        search,
      }));
    }
  }, [pathname, searchParams]);

  // Update URL parameters
  const updateURLParams = useCallback(() => {
    const params = new URLSearchParams();

    // Add search parameter
    if (searchTerm) {
      params.set("search", searchTerm);
    }

    // Update URL without refreshing the page
    const newURL = `${pathname}?${params.toString()}`;
    router.push(newURL, { scroll: false });
  }, [pathname, router, searchTerm, currentPage]);

  // Effect to update URL when parameters change
  useEffect(() => {
    updateURLParams();
  }, [searchTerm, currentPage, updateURLParams]);

  // Get pagination items - for category view, the API already gives us the current page of products
  const paginatedProducts = filters.category
    ? filteredProducts // For category view with API pagination, use filtered products directly
    : filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage); // For non-category view, do client-side pagination

  // Calculate lowest price for each product
  const getLowestPrice = (properties: ProductType["properties"]) => {
    return properties.reduce((lowest, property) => {
      const propertyPrice = property.retailPrice;
      return lowest === 0 || propertyPrice < lowest ? propertyPrice : lowest;
    }, 0);
  };

  // Calculate lowest sale price for each product
  const getLowestSalePrice = (properties: ProductType["properties"]) => {
    // Check if any property has a sale price
    const hasSalePrice = properties.some((prop) => prop.salePrice !== null && prop.salePrice !== undefined);

    if (!hasSalePrice) return null;

    return properties.reduce((lowest, property) => {
      if (property.salePrice === null || property.salePrice === undefined) return lowest;
      return lowest === 0 || property.salePrice < lowest ? property.salePrice : lowest;
    }, 0);
  };
  // Check if product is available based on inventory
  const isProductAvailable = (product: ProductType) => {
    return product.isAvailable !== undefined ? product.isAvailable : true;
  };
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setPageStatus("pageLoading");
    console.log("Fetching products with filters:", filters);
    try {
      // Determine whether we need to search, fetch by category, or get all products
      let response;
      const searchQuery = searchParams.get("search");
      if (searchQuery && searchQuery.trim()) {
        console.log("Performing search for:", searchQuery);
        // Use search function when we have a search query
        response = await searchProducts(searchQuery.trim(), {
          includeCategory: true,
          includeProperties: true,
          limit: 100, // Get more results for search, we'll handle pagination client-side
        });
        if (response.success && response.data) {
          const productsData = response.data;

          // Set up the products data
          setProducts(productsData as unknown as ProductType[]);
          setTotalItems(productsData.length);

          // Extract min/max prices from search results
          let minPrice = Number.MAX_VALUE;
          let maxPrice = 0;

          productsData.forEach((product) => {
            const lowestPrice = getLowestPrice(product.properties);
            minPrice = Math.min(minPrice, lowestPrice || 0);
            maxPrice = Math.max(maxPrice, lowestPrice || 0);
          });

          // For search results, we'll have limited brand filtering since supplier isn't included
          const brands: Array<{ id: number; name: string; isSelected: boolean }> = [];

          // Set price range filter and brands
          setFilters((prev) => ({
            ...prev,
            priceMinMax: [minPrice === Number.MAX_VALUE ? 0 : minPrice, maxPrice],
            priceMinMaxLimitation: [minPrice === Number.MAX_VALUE ? 0 : minPrice, maxPrice],
            brands,
            search: searchQuery,
          }));

          // Apply any additional filters client-side
          applyFilters(productsData as unknown as ProductType[]);
        } else {
          setError(response.error || "Failed to search products");
          setPageStatus("filterHasNoProduct");
        }
      } else if (filters.category) {
        console.log("Fetching products by category:", filters.category);
        // Use the category-specific function when we have a category
        response = await getProductsByCategory(filters.category, {
          limit: itemsPerPage,
          includeOutOfStock: true,
        });

        console.log("Category products response:", response);

        if (response.success && response.data) {
          // Set up the products data
          const { products: productsData, pagination, category } = response.data;

          // Use type assertion to ensure compatibility with ProductType
          setProducts(productsData as unknown as ProductType[]);

          // Update pagination information from API response
          setCurrentPage(pagination.page);
          setTotalItems(pagination.total);

          // Extract min/max prices from formatted products
          let minPrice = Number.MAX_VALUE;
          let maxPrice = 0;

          productsData.forEach((product) => {
            // For category API responses, use lowestPrice directly
            const lowestPrice =
              product.lowestPrice !== undefined ? product.lowestPrice : getLowestPrice(product.properties);
            minPrice = Math.min(minPrice, lowestPrice || 0);
            maxPrice = Math.max(maxPrice, lowestPrice || 0);
          });

          // Set price range filter and brands
          setFilters((prev) => ({
            ...prev,
            category: category.slug,
          }));

          // If we have search or other filters, apply them client-side
          if (filters.search) {
            // applyFilters(productsData as unknown as ProductType[]);
          } else {
            // Otherwise use the API-filtered results directly
            setFilteredProducts(productsData as unknown as ProductType[]);
            setPageStatus(productsData.length > 0 ? "filledProductList" : "categoryHasNoProduct");
          }
        } else {
          setError(response.error || "Failed to fetch category products");
          setPageStatus("categoryHasNoProduct");
        }
      } else {
        console.log("Fetching all products");
        // Get all products when no category or search
        response = await getAllProducts();

        if (response.success && response.data) {
          const productsData = response.data;

          setProducts(productsData as unknown as ProductType[]);
          setTotalItems(productsData.length);

          // Extract min/max prices
          let minPrice = Number.MAX_VALUE;
          let maxPrice = 0;

          productsData.forEach((product) => {
            const lowestPrice = getLowestPrice(product.properties);
            minPrice = Math.min(minPrice, lowestPrice || 0);
            maxPrice = Math.max(maxPrice, lowestPrice || 0);
          }); // Extract available brands for filter (getAllProducts doesn't include supplier)
          const brands: Array<{ id: number; name: string; isSelected: boolean }> = [];

          // Set price range filter and brands
          setFilters((prev) => ({
            ...prev,
            priceMinMax: [minPrice === Number.MAX_VALUE ? 0 : minPrice, maxPrice],
            priceMinMaxLimitation: [minPrice === Number.MAX_VALUE ? 0 : minPrice, maxPrice],
            brands,
          }));

          // Apply filters
          // applyFilters(productsData as unknown as ProductType[]);
        } else {
          setError(response.error || "Failed to fetch products");
          setPageStatus("categoryHasNoProduct");
        }
      }
    } catch (err) {
      setError("An error occurred while fetching products");
      console.error(err);
      setPageStatus("categoryHasNoProduct");
    } finally {
      setIsLoading(false);
    }
  }, [filters.category, searchParams, itemsPerPage, router]);

  useEffect(() => {
    console.log("Fetching products with filters:", filters);
    fetchProducts();
  }, [searchParams]);

  return (
    <div className="container mx-auto">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Product Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-[320px] rounded-xl bg-gray-100 animate-pulse">
                  <SK_Box width="100%" height="320px" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 text-lg">No products found</p>
              <button
                onClick={() => {
                  // Reset filters
                  setFilters({
                    search: "",
                    category: filters.category,
                  });
                  setSearchTerm("");
                }}
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-10 gap-4">
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    className="col-span-10 lg:col-span-2"
                    id={product.sku}
                    name={product.title}
                    price={getLowestPrice(product.properties)}
                    dealPrice={getLowestSalePrice(product.properties) as number | undefined}
                    imgUrl={product.image || "/images/products/default.jpg"}
                    isAvailable={isProductAvailable(product)}
                    cardColor={product.cardColor || "blue-500"}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListPage;
