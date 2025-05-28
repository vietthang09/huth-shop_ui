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
  const [showFilters, setShowFilters] = useState(false);
  const [pageStatus, setPageStatus] = useState<TPageStatus>("pageLoading");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [sortConfig, setSortConfig] = useState<TListSort>({ sortName: "id", sortType: "asc" });
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterChanged, setIsFilterChanged] = useState(false);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Filters state
  const [filters, setFilters] = useState<TFilters>({
    stockStatus: "all",
    priceMinMax: [0, 10000000],
    priceMinMaxLimitation: [0, 10000000],
    brands: [],
    search: "",
    category: "",
  });
  // Extract category from URL parameters
  useEffect(() => {
    const params = pathname.split("/").filter((segment) => segment && segment !== "list");
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

    // Get sort parameters
    const sortName = searchParams.get("sortName") as "id" | "price" | "name" | null;
    const sortType = searchParams.get("sortType") as "asc" | "desc" | null;
    if (sortName && sortType) {
      setSortConfig({ sortName, sortType });
    }

    // Get page parameters
    const page = searchParams.get("page");
    if (page) {
      setCurrentPage(parseInt(page));
    }
  }, [pathname, searchParams]);

  // Filter products based on current filters
  const applyFilters = useCallback(
    (productList: ProductType[]) => {
      setPageStatus("filterLoading");

      let filtered = [...productList];

      // Apply category filter
      if (filters.category !== undefined) {
        filtered = filtered.filter((product) => product.category?.slug === filters.category);
      }

      // Apply stock status filter
      if (filters.stockStatus !== "all") {
        filtered = filtered.filter((product) => {
          if (filters.stockStatus === "inStock") {
            return isProductAvailable(product);
          } else {
            return !isProductAvailable(product);
          }
        });
      } // Apply price range filter
      filtered = filtered.filter((product) => {
        // Use lowestPrice from API if available, otherwise calculate it
        const lowestPrice =
          product.lowestPrice !== undefined ? product.lowestPrice : getLowestPrice(product.properties);
        return lowestPrice >= filters.priceMinMax[0] && lowestPrice <= filters.priceMinMax[1];
      });

      // Apply brand filter
      const selectedBrands = filters.brands.filter((brand) => brand.isSelected).map((brand) => brand.name);
      if (selectedBrands.length > 0) {
        filtered = filtered.filter((product) => product.supplier && selectedBrands.includes(product.supplier.name));
      }

      // Apply search filter
      if (filters.search && filters.search.trim() !== "") {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(
          (product) =>
            product.title.toLowerCase().includes(searchLower) ||
            (product.supplier?.name && product.supplier.name.toLowerCase().includes(searchLower)) ||
            (product.category?.name && product.category.name.toLowerCase().includes(searchLower))
        );
      }

      // Apply sorting
      filtered = sortProducts(filtered, sortConfig);

      if (filtered.length > 0) {
        setPageStatus("filledProductList");
      } else {
        setPageStatus("filterHasNoProduct");
      }

      setFilteredProducts(filtered);
      setIsFilterChanged(false);
    },
    [filters, sortConfig]
  );
  // Function to handle sorting
  const sortProducts = (productsToSort: ProductType[], sort: TListSort) => {
    return [...productsToSort].sort((a, b) => {
      if (sort.sortName === "price") {
        // Use lowestPrice from API if available, otherwise calculate it
        const priceA = a.lowestPrice !== undefined ? a.lowestPrice : getLowestPrice(a.properties);
        const priceB = b.lowestPrice !== undefined ? b.lowestPrice : getLowestPrice(b.properties);
        return sort.sortType === "asc" ? priceA - priceB : priceB - priceA;
      } else if (sort.sortName === "name") {
        return sort.sortType === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
      } else {
        // sort by id
        return sort.sortType === "asc" ? a.id - b.id : b.id - a.id;
      }
    });
  };

  // Update URL parameters
  const updateURLParams = useCallback(() => {
    const params = new URLSearchParams();

    // Add search parameter
    if (searchTerm) {
      params.set("search", searchTerm);
    }

    // Add sort parameters
    params.set("sortName", sortConfig.sortName);
    params.set("sortType", sortConfig.sortType);

    // Add page parameter
    if (currentPage > 1) {
      params.set("page", currentPage.toString());
    }

    // Update URL without refreshing the page
    const newURL = `${pathname}?${params.toString()}`;
    router.push(newURL, { scroll: false });
  }, [pathname, router, searchTerm, sortConfig, currentPage]);

  // Effect to update URL when parameters change
  useEffect(() => {
    updateURLParams();
  }, [searchTerm, sortConfig, currentPage, updateURLParams]);

  // Effect to apply filters when they change
  useEffect(() => {
    if (products.length > 0) {
      applyFilters(products);
    }
  }, [products, filters, sortConfig, applyFilters]);

  // Handle filter changes
  const handleFilterChange = (newFilters: TFilters) => {
    setFilters(newFilters);
    setIsFilterChanged(true);
  };

  // Handle brand selection change
  const handleBrandChange = (index: number) => {
    const updatedBrands = [...filters.brands];
    updatedBrands[index].isSelected = !updatedBrands[index].isSelected;

    setFilters({
      ...filters,
      brands: updatedBrands,
    });

    setIsFilterChanged(true);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setFilters({
      ...filters,
      search: value,
    });
  };

  // Handle sort change
  const handleSortChange = (sortName: "id" | "price" | "name") => {
    setSortConfig((prevSort) => {
      if (prevSort.sortName === sortName) {
        // Toggle sort direction if same field is clicked
        return {
          sortName,
          sortType: prevSort.sortType === "asc" ? "desc" : "asc",
        };
      }
      return {
        sortName,
        sortType: "asc",
      };
    });
  };
  // Get pagination items - for category view, the API already gives us the current page of products
  const paginatedProducts = filters.category
    ? filteredProducts // For category view with API pagination, use filtered products directly
    : filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage); // For non-category view, do client-side pagination

  // Calculate page counts
  const totalPages = filters.category
    ? Math.ceil(totalItems / itemsPerPage) // For category view, use total from API response
    : Math.ceil(filteredProducts.length / itemsPerPage); // For all products view
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);

    // If we're using category view, we need to refetch from the API with the new page
    if (filters.category) {
      // Update URL first, then the fetchProducts will be triggered by the effect that watches searchParams
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", page.toString());
      const newURL = `${pathname}?${params.toString()}`;
      router.push(newURL, { scroll: false });
    }
  };
  // Helper function to map our UI sort config to the API sortBy parameter
  const getSortMapping = (sort: TListSort): "newest" | "priceAsc" | "priceDesc" => {
    if (sort.sortName === "price") {
      return sort.sortType === "asc" ? "priceAsc" : "priceDesc";
    } else if (sort.sortName === "name") {
      // Name sorting handled in the UI since API doesn't support it
      return "newest";
    } else {
      return "newest"; // Default sort
    }
  };

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
    try {
      // Determine whether we need to search, fetch by category, or get all products
      let response;
      const pageParams = searchParams.get("page") ? parseInt(searchParams.get("page") as string) : 1;
      const sortBy = getSortMapping(sortConfig);
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
          page: pageParams,
          limit: itemsPerPage,
          sortBy,
          includeOutOfStock: true, // We'll handle stock filtering in the UI
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

          // Extract available brands for filter
          const brands = Array.from(
            new Set(productsData.filter((p) => p.supplier?.name).map((p) => p.supplier?.name))
          ).map((name, id) => ({
            id,
            name: name as string,
            isSelected: false,
          }));

          // Set price range filter and brands
          setFilters((prev) => ({
            ...prev,
            priceMinMax: [minPrice, maxPrice],
            priceMinMaxLimitation: [minPrice, maxPrice],
            brands,
            category: category.slug,
          }));

          // If we have search or other filters, apply them client-side
          if (filters.search || filters.stockStatus !== "all" || filters.brands.some((brand) => brand.isSelected)) {
            applyFilters(productsData as unknown as ProductType[]);
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
          applyFilters(productsData as unknown as ProductType[]);
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
  }, [applyFilters, filters.category, searchParams, sortConfig, itemsPerPage, router]);

  // Fetch products on initial load and when search parameters change
  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  return (
    <div className="container mx-auto">
      <div className="flex items-center mb-6 text-sm">
        <a href="/" className="text-gray-500 hover:text-gray-800">
          Home
        </a>
        <span className="mx-2 text-gray-400">/</span>
        <a
          href="/list"
          className={`${!filters.category ? "font-medium text-gray-800" : "text-gray-500 hover:text-gray-800"}`}
        >
          Products
        </a>
        {filters.category && (
          <>
            <span className="mx-2 text-gray-400">/</span>
            <span className="font-medium text-gray-800">{filteredProducts[0]?.category?.name || "Category"}</span>
          </>
        )}
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          {filters.category && filteredProducts[0]?.category?.name ? filteredProducts[0].category.name : "All Products"}
        </h1>

        <div className="flex items-center gap-4">
          <div className="relative md:w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search products..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 w-full"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1"
          >
            <Filter size={18} />
            <span className="hidden sm:inline">Filters</span>
          </button>

          <div className="relative group">
            <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1">
              <SortDesc size={18} />
              <span className="hidden sm:inline">Sort</span>
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 hidden group-hover:block">
              <div className="py-1">
                <button
                  onClick={() => handleSortChange("name")}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between"
                >
                  <span>By Name</span>
                  {sortConfig.sortName === "name" && <span>{sortConfig.sortType === "asc" ? "↑" : "↓"}</span>}
                </button>
                <button
                  onClick={() => handleSortChange("price")}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between"
                >
                  <span>By Price</span>
                  {sortConfig.sortName === "price" && <span>{sortConfig.sortType === "asc" ? "↑" : "↓"}</span>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="w-full p-4 mb-6 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filter sidebar */}
        <Filters
          showFilters={showFilters}
          filters={filters}
          isFilterChanged={isFilterChanged}
          pageStatus={pageStatus}
          onToggleWindow={(value) => setShowFilters(value)}
          onFilterChange={handleFilterChange}
          onBrandChange={handleBrandChange}
          onApplyFilter={() => applyFilters(products)}
        />

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
                    stockStatus: "all",
                    priceMinMax: filters.priceMinMaxLimitation,
                    priceMinMaxLimitation: filters.priceMinMaxLimitation,
                    brands: filters.brands.map((brand) => ({ ...brand, isSelected: false })),
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
              {" "}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.sku}
                    name={product.title}
                    price={getLowestPrice(product.properties)}
                    dealPrice={getLowestSalePrice(product.properties) as number | undefined}
                    imgUrl={product.image || "/images/products/default.jpg"}
                    isAvailable={isProductAvailable(product)}
                    staticWidth={false}
                    cardColor={product.cardColor || undefined}
                  />
                ))}
              </div>
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    {/* Page numbers */}
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handlePageChange(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === i + 1
                            ? "z-10 bg-green-50 border-green-500 text-green-600"
                            : "text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListPage;
