import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Card } from '@/components/ui';
import { fetchCategories, fetchProducts, fetchSalesStats, fetchSalesYears } from '../services/apiService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement
);

export const Dashboard: React.FC = () => {
  // State for filters
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // State for data
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [salesStats, setSalesStats] = useState<{ sales: any, total: number, orders: number }>({ sales: {}, total: 0, orders: 0 });
  const [years, setYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all dashboard data
  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      fetchProducts(selectedCategory),
      fetchCategories(),
      fetchSalesStats(selectedYear, selectedCategory),
      fetchSalesYears()
    ])
      .then(([productsData, categoriesData, salesStatsData, yearsData]) => {
        setProducts(productsData || []);
        setCategories(categoriesData || []);
        setSalesStats(salesStatsData || { sales: {}, total: 0, orders: 0 });
        setYears(yearsData?.length ? yearsData : [new Date().getFullYear()]);
      })
      .catch((err) => {
        setError('Failed to load dashboard data.');
      })
      .finally(() => setLoading(false));
  }, [selectedYear, selectedCategory]);

  // Prepare chart data
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const monthlySales = months.map((_, i) => {
    const monthNum = (i + 1).toString();
    return salesStats.sales && salesStats.sales[monthNum]
      ? salesStats.sales[monthNum].total_price || 0
      : 0;
  });
  const monthlyProfit = monthlySales.map(amount => amount * 0.3);

  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded">
        <p>Error loading dashboard data: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">Dashboard</h1>
      {/* Filter controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="w-full md:w-auto">
          <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Year
          </label>
          <select
            id="year"
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 dark:text-gray-200"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="w-full md:w-auto">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 dark:text-gray-200"
          >
            <option value="">All Categories</option>
            {(Array.isArray(categories) ? categories : []).map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>
      </div>
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Revenue</h2>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(salesStats.total)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            For {selectedYear} {selectedCategory ? `in selected category` : ''}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Orders</h2>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {salesStats.orders}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Items sold in {selectedYear}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Products</h2>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {Array.isArray(products) ? products.length : 0}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {selectedCategory ? 'In selected category' : 'Across all categories'}
          </p>
        </div>
      </div>
      {/* Monthly Sales Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <Bar
            data={{
              labels: months,
              datasets: [
                {
                  label: 'Sales',
                  data: monthlySales,
                  backgroundColor: 'rgba(59, 130, 246, 0.7)',
                  borderColor: 'rgba(59, 130, 246, 1)',
                  borderWidth: 1,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                title: { display: true, text: `Monthly Sales (${selectedYear})` },
              },
              scales: {
                y: { beginAtZero: true, ticks: { callback: (v: number) => formatCurrency(v) } },
              },
            }}
          />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <Bar
            data={{
              labels: months,
              datasets: [
                {
                  label: 'Profit',
                  data: monthlyProfit,
                  backgroundColor: 'rgba(16, 185, 129, 0.7)',
                  borderColor: 'rgba(16, 185, 129, 1)',
                  borderWidth: 1,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                title: { display: true, text: `Monthly Profit (${selectedYear})` },
              },
              scales: {
                y: { beginAtZero: true, ticks: { callback: (v: number) => formatCurrency(v) } },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};
