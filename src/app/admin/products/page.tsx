"use client";
import { useState, useEffect } from "react";
import { deleteProduct, getAllProducts, getOneProduct } from "@/actions/product/product";
import ProductModal from "@/components/modals/ProductModal";
import { Search } from "lucide-react";

interface ProductType {
  id: number;
  sku: string;
  title: string;
  image?: string;
  description?: string;
  supplierId?: number;
  categoryId?: number;
  supplier?: { name: string } | null;
  category?: { name: string } | null;
  properties: Array<{
    id: number;
    netPrice: number;
    retailPrice: number;
    salePrice?: number | null;
    attributeSetHash?: string;
    attributeSet?: any;
  }>;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null);
  const [productToEdit, setProductToEdit] = useState<ProductType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getAllProducts();
        if (response.success && response.data) {
          // Use a proper type conversion to fix decimal issues
          const productsData = response.data.map(product => ({
            ...product,
            properties: product.properties.map(prop => ({
              ...prop,
              netPrice: Number(prop.netPrice),
              retailPrice: Number(prop.retailPrice),
              salePrice: prop.salePrice ? Number(prop.salePrice) : null
            }))
          })) as ProductType[];

          setProducts(productsData);
          setFilteredProducts(productsData);
        } else {
          setError(response.error || "Failed to fetch products");
        }
      } catch (err) {
        setError("An error occurred while fetching products");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleModalClose = () => {
    setIsModalOpen(false);
    // Reset the product to edit
    setProductToEdit(null);
    // Refresh products list after modal closes
    getAllProducts().then(response => {
      if (response.success && response.data) {
        // Use a proper type conversion to fix decimal issues
        const productsData = response.data.map(product => ({
          ...product,
          properties: product.properties.map(prop => ({
            ...prop,
            netPrice: Number(prop.netPrice),
            retailPrice: Number(prop.retailPrice),
            salePrice: prop.salePrice ? Number(prop.salePrice) : null
          }))
        })) as ProductType[];

        setProducts(productsData);
        setFilteredProducts(filterProducts(productsData, searchTerm));
      }
    });
  };

  const handleDeleteClick = (productId: number) => {
    setDeleteProductId(productId);
    if (window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      handleDelete(productId);
    }
  };

  const handleDelete = async (productId: number) => {
    try {
      setIsDeleting(true);
      const response = await deleteProduct(productId);

      if (response.success) {
        // Remove the product from the local state to update UI instantly
        const updatedProducts = products.filter(product => product.id !== productId);
        setProducts(updatedProducts);
        setFilteredProducts(filterProducts(updatedProducts, searchTerm));
      } else {
        setError(response.error || "Failed to delete product");
      }
    } catch (err) {
      setError("An error occurred while deleting the product");
      console.error(err);
    } finally {
      setIsDeleting(false);
      setDeleteProductId(null);
    }
  };
  const handleEditClick = async (product: ProductType) => {
    // Fetch the full product details including attributes
    try {
      const response = await getOneProduct(product.id.toString());
      if (response.success && response.data) {
        setProductToEdit(product); // Use the product data we already have
        setIsModalOpen(true);
      } else {
        setError("Failed to load product details for editing");
      }
    } catch (err) {
      setError("An error occurred while preparing product for editing");
      console.error(err);
    }
  };

  const filterProducts = (products: ProductType[], term: string) => {
    if (!term.trim()) return products;

    const lowerTerm = term.toLowerCase();
    return products.filter(product =>
      product.sku.toLowerCase().includes(lowerTerm) ||
      product.title.toLowerCase().includes(lowerTerm) ||
      product.supplier?.name?.toLowerCase().includes(lowerTerm) ||
      product.category?.name?.toLowerCase().includes(lowerTerm)
    );
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    setFilteredProducts(filterProducts(products, term));
  };

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';

    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    setSortConfig({ key, direction });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
      // Handle nested properties
      if (key.includes('.')) {
        const [parent, child] = key.split('.');

        // Type-safe approach for nested properties
        if (parent === 'supplier' && a.supplier && b.supplier) {
          const valA = a.supplier[child as keyof typeof a.supplier] || '';
          const valB = b.supplier[child as keyof typeof b.supplier] || '';
          if (valA < valB) return direction === 'asc' ? -1 : 1;
          if (valA > valB) return direction === 'asc' ? 1 : -1;
          return 0;
        }

        if (parent === 'category' && a.category && b.category) {
          const valA = a.category[child as keyof typeof a.category] || '';
          const valB = b.category[child as keyof typeof b.category] || '';
          if (valA < valB) return direction === 'asc' ? -1 : 1;
          if (valA > valB) return direction === 'asc' ? 1 : -1;
          return 0;
        }

        return 0;
      }

      // Special handling for price from properties
      if (key === 'price') {
        const priceA = a.properties.length > 0 ? a.properties[0].retailPrice : 0;
        const priceB = b.properties.length > 0 ? b.properties[0].retailPrice : 0;

        return direction === 'asc' ? priceA - priceB : priceB - priceA;
      }

      // Handle regular properties
      const valA = a[key as keyof ProductType] || '';
      const valB = b[key as keyof ProductType] || '';

      if (typeof valA === 'string' && typeof valB === 'string') {
        return direction === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      // For number comparison
      if (typeof valA === 'number' && typeof valB === 'number') {
        return direction === 'asc' ? valA - valB : valB - valA;
      }

      return 0;
    });

    setFilteredProducts(sortedProducts);
  };

  const getSortIndicator = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  if (loading) return (
    <div className="p-4 flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="p-4 text-red-500 border border-red-300 bg-red-50 rounded-md">
      <p className="font-bold">Error:</p>
      <p>{error}</p>
    </div>
  );

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Products Management</h1>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition-colors duration-300 shadow-sm"
          onClick={() => setIsModalOpen(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add New Product
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
            <div className="text-lg font-medium text-gray-700">
              Total Products: {filteredProducts.length}
            </div>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search products..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('id')}
                >
                  ID{getSortIndicator('id')}
                </th>
                <th
                  className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('sku')}
                >
                  SKU{getSortIndicator('sku')}
                </th>
                <th
                  className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('title')}
                >
                  Title{getSortIndicator('title')}
                </th>
                <th
                  className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('supplier.name')}
                >
                  Supplier{getSortIndicator('supplier.name')}
                </th>
                <th
                  className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('category.name')}
                >
                  Category{getSortIndicator('category.name')}
                </th>
                <th
                  className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('price')}
                >
                  Base Price{getSortIndicator('price')}
                </th>
                <th className="px-6 py-3 border-b text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 border-b text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500 bg-gray-50">
                    <div className="flex flex-col items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mb-2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="8" y1="12" x2="16" y2="12"></line>
                      </svg>
                      {searchTerm ? "No products found matching your search" : "No products found"}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">{product.sku}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium truncate max-w-[200px]">{product.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.supplier?.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category?.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">
                      {product.properties.length > 0
                        ? `$${Number(product.properties[0].retailPrice).toFixed(2)}`
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex justify-center">
                        {product.properties.length > 0 && product.properties[0].salePrice !== null ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            On Sale
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Regular
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-900 transition-colors duration-200 bg-blue-50 hover:bg-blue-100 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
                          onClick={() => handleEditClick(product)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900 transition-colors duration-200 bg-red-50 hover:bg-red-100 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-red-300"
                          onClick={() => handleDeleteClick(product.id)}
                          disabled={isDeleting && deleteProductId === product.id}
                        >
                          {isDeleting && deleteProductId === product.id ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Deleting
                            </span>
                          ) : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <ProductModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          product={productToEdit as any}
        />
      )}
    </div>
  );
};

export default AdminProducts;
