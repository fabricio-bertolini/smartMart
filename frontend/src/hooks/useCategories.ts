import { useState, useEffect } from 'react';
import { fetchCategories, Category } from '../services/apiService';

/**
 * Custom Hook: useCategories
 * 
 * Manages category data fetching and state management.
 * Provides a convenient way to access category data across the application.
 * 
 * Features:
 * - Automatic data fetching on mount
 * - Loading state management
 * - Error handling
 * - Centralized category data access
 * - Manual refresh capability
 * 
 * @returns Object containing:
 *   - categories: Array of category objects
 *   - loading: Boolean indicating if data is being fetched
 *   - error: Error message if fetch failed
 *   - refetch: Function to manually trigger a refetch
 * 
 * @example
 * const { categories, loading, error, refetch } = useCategories();
 * 
 * // After creating a new category
 * const handleCategoryCreated = () => {
 *   refetch(); // Refresh the categories list
 * };
 */
export const useCategories = () => {
  // State management for categories data, loading state, and errors
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch categories data from the API
   * Manages loading and error states during the process
   */
  const fetchCategoriesData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error in useCategories hook:', err);
      setError('Failed to load categories. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Effect hook to fetch categories on component mount
   */
  useEffect(() => {
    fetchCategoriesData();
  }, []);

  /**
   * Return categories data along with loading state, error state, and refetch function
   */
  return {
    categories,
    loading,
    error,
    refetch: fetchCategoriesData
  };
};
