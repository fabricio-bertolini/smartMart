import React from 'react';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';

/**
 * Interface for product data structure
 */
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  brand: string;
  status: 'active' | 'out_of_stock' | 'discontinued';
}

/**
 * ProductList Component
 * 
 * A comprehensive product management interface that displays a filterable,
 * searchable, and paginated list of products. Supports both light and dark modes.
 * 
 * Features:
 * - Product search functionality
 * - Category filtering
 * - Responsive grid layout
 * - Pagination
 * - Loading states
 * - Dark mode support
 */
export const ProductList = () => {
  // State management for filters and pagination
  const [selectedCategory, setSelectedCategory] = React.useState<number | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const productsPerPage = 9; // Number of products to display per page

  // Fetch products and categories data using custom hooks
  const { products, loading: productsLoading, error: productsError } = useProducts();
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();

  /**
   * Filter products based on category and search query
   * Applies both filters in combination for precise results
   */
  const filteredProducts = React.useMemo(() => {
    return (Array.isArray(products) ? products : [])
      .filter(p => selectedCategory ? p.category_id === selectedCategory : true)
      .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [products, selectedCategory, searchQuery]);

  /**
   * Calculate paginated subset of filtered products
   * Determines which products to show on the current page
   */
  const paginatedProducts = React.useMemo(() => {
    const startIndex = (currentPage - 1) * productsPerPage;
    return filteredProducts.slice(startIndex, startIndex + productsPerPage);
  }, [filteredProducts, currentPage]);

  // Loading state handler
  if (productsLoading || categoriesLoading) {
    return (
      <div className="flex justify-center py-8">
        <span className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></span>
      </div>
    );
  }

  // Error state handler
  if (productsError || categoriesError) {
    return (
      <div className="text-red-500 dark:text-red-400">
        {productsError || categoriesError}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and filter controls */}
      <div className="flex gap-4 mb-4">
        {/* Search input */}
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border rounded flex-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 dark:border-gray-600 dark:placeholder-gray-400"
        />
        {/* Category filter */}
        <select 
          onChange={(e) => setSelectedCategory(Number(e.target.value))}
          className="p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 dark:border-gray-600"
        >
          <option value="" className="dark:bg-gray-800">All Categories</option>
          {(Array.isArray(categories) ? categories : []).map(cat => (
            <option key={cat.id} value={cat.id} className="dark:bg-gray-800">
              {cat.name}
            </option>
          ))}
        </select>
      </div>
      
      {/* Product grid */}
      <div className="overflow-x-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedProducts.length === 0 ? (
            // Empty state
            <div className="col-span-full text-gray-500 dark:text-gray-400 text-center py-8">
              No products found.
            </div>
          ) : (
            // Product cards
            paginatedProducts.map(product => (
              <div 
                key={product.id} 
                className="p-4 border rounded shadow hover:shadow-lg transition-shadow 
                  bg-white dark:bg-gray-800 dark:border-gray-700"
              >
                <h3 className="font-bold text-gray-900 dark:text-gray-100">
                  {product.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {product.description}
                </p>
                <p className="text-blue-600 dark:text-blue-400">
                  ${product.price}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination controls */}
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: Math.ceil(filteredProducts.length / productsPerPage) })
          .map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 border rounded transition-colors ${
                currentPage === i + 1 
                  ? 'bg-blue-500 dark:bg-blue-600 text-white font-bold' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900 dark:border-gray-600'
              }`}
              aria-current={currentPage === i + 1 ? 'page' : undefined}
            >
              {i + 1}
            </button>
          ))}
      </div>
    </div>
  );
};
