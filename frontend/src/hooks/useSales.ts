import { useState, useEffect } from 'react';
import { fetchSales, Sale } from '../services/apiService';

/**
 * Custom Hook: useSales
 * 
 * Manages sales data fetching and state management.
 * Provides a convenient way to access sales data across the application.
 * 
 * Features:
 * - Automatic data fetching on mount
 * - Loading state management
 * - Error handling
 * - Centralized sales data access
 * - Manual refresh capability
 * 
 * @returns Object containing:
 *   - sales: Array of sale objects
 *   - loading: Boolean indicating if data is being fetched
 *   - error: Error message if fetch failed
 *   - refetch: Function to manually trigger a refetch
 * 
 * @example
 * const { sales, loading, error, refetch } = useSales();
 * 
 * // After creating a new sale
 * const handleSaleCompleted = () => {
 *   refetch(); // Refresh the sales list
 * };
 */
export const useSales = () => {
  // State management for sales data, loading state, and errors
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch sales data from the API
   * Manages loading and error states during the process
   */
  const fetchSalesData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchSales();
      setSales(data);
    } catch (err) {
      console.error('Error in useSales hook:', err);
      setError('Failed to load sales data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Effect hook to fetch sales on component mount
   */
  useEffect(() => {
    fetchSalesData();
  }, []);

  /**
   * Return sales data along with loading state, error state, and refetch function
   */
  return {
    sales,
    loading,
    error,
    refetch: fetchSalesData
  };
};
