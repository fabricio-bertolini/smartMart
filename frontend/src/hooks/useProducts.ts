import { useState, useEffect } from 'react';
import { fetchProducts, Product } from '../services/apiService';

/**
 * Custom Hook: useProducts
 * 
 * Manages product data fetching and state management.
 * Provides a convenient way to access product data across the application.
 * 
 * Features:
 * - Automatic data fetching on mount
 * - Loading state management
 * - Error handling
 * - Centralized product data access
 * 
 * @returns Object containing:
 *   - products: Array of product objects
 *   - loading: Boolean indicating if data is being fetched
 *   - error: Error message if fetch failed
 *   - refetch: Function to manually trigger a refetch
 * 
 * @example
 * const { products, loading, error, refetch } = useProducts();
 * 
 * if (loading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage message={error} />;
 * 
 * return (
 *   <ProductList products={products} onUpdate={refetch} />
 * );
 */
export const useProducts = () => {
  // State management for products data, loading state, and errors
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch products data from the API
   * Manages loading and error states during the process
   */
  const fetchProductsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      console.error('Error in useProducts hook:', err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Effect hook to fetch products on component mount
   */
  useEffect(() => {
    fetchProductsData();
  }, []);

  /**
   * Return products data along with loading state, error state, and refetch function
   */
  return {
    products,
    loading,
    error,
    refetch: fetchProductsData
  };
};
