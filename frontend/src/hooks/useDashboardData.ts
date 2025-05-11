import { useEffect, useState } from 'react';
import { fetchCategories, fetchProducts, fetchSalesStats, fetchSalesYears } from '../services/apiService';

/**
 * Interface for Sales Statistics
 */
interface SalesStats {
  total: number;
  orders: number;
  total_profit: number;
  sales: Record<string, { orders: number; total_price: number; profit: number }>;
}

/**
 * Interface for Category
 */
interface Category {
  id: number;
  name: string;
}

/**
 * Interface for Product
 */
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  brand: string;
}

/**
 * Interface for Sales Data
 */
interface SalesData {
  total_price?: number;
  quantity?: number;
}

/**
 * Custom Hook: useDashboardData
 * 
 * Comprehensive hook that aggregates all data needed for the dashboard.
 * Centralizes data fetching and state management for the dashboard view.
 * 
 * Features:
 * - Fetches products, categories, sales stats, and available years
 * - Supports filtering by year and category
 * - Handles loading states for all data sources
 * - Unified error handling
 * - Optimized to minimize API calls
 * 
 * @param year - The selected year for filtering sales data
 * @param categoryId - The selected category ID for filtering data
 * @returns Object containing all dashboard data and states
 * 
 * @example
 * const {
 *   products, categories, sales, salesStats,
 *   loading, error, availableYears
 * } = useDashboardData(2024, '1');
 */
export const useDashboardData = (year: number, categoryId: string) => {
  // State management for various data types
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sales, setSales] = useState<Record<string, SalesData>>({});
  const [salesStats, setSalesStats] = useState<SalesStats>({
    total: 0,
    orders: 0,
    total_profit: 0,
    sales: {},
  });
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  
  // State for loading and error handling
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches all required data for the dashboard
   * Manages loading and error states during multiple API calls
   */
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all data in parallel for efficiency
      const [productsData, categoriesData, salesStatsData, yearsData] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchSalesStats(year, categoryId),
        fetchSalesYears()
      ]);
      
      // Filter products by category if a category is selected
      const filteredProducts = categoryId
        ? productsData.filter((p: Product) => String(p.category_id) === categoryId)
        : productsData;
      setProducts(filteredProducts);
      setCategories(categoriesData);
      setSales(salesStatsData.sales || {});
      setAvailableYears(yearsData);
      setSalesStats({
        sales: salesStatsData.sales || {},
        total: salesStatsData.total || 0,
        orders: salesStatsData.orders || 0,
        total_profit: salesStatsData.total_profit || 0
      });
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Effect hook to fetch data when year or category selection changes
   */
  useEffect(() => {
    fetchData();
  }, [year, categoryId]);

  /**
   * Return all dashboard data and states
   */
  return {
    products,
    categories,
    sales,
    salesStats,
    loading,
    error,
    availableYears,
    refetch: fetchData
  };
};
