import React, { useEffect, useState } from 'react';
import { fetchSalesStats, fetchProducts, fetchCategories, fetchSalesYears } from '../services/apiService';
import { Bar } from 'react-chartjs-2';

interface SaleStats {
  sales: {
    [key: string]: {
      orders: number;
      total_price: number;
      profit: number;
    };
  };
  total: number;
  orders: number;
  total_profit: number;
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [salesStats, setSalesStats] = useState<SaleStats | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching dashboard data...');

        const [stats, prods, cats, yrs] = await Promise.all([
          fetchSalesStats(selectedYear, selectedCategory),
          fetchProducts(selectedCategory),
          fetchCategories(),
          fetchSalesYears()
        ]);

        console.log('Received stats:', stats);
        console.log('Received categories:', cats);
        console.log('Received years:', yrs);

        // Set default year if no years returned
        if (!yrs || yrs.length === 0) {
          setYears([new Date().getFullYear()]);
        } else {
          setYears(yrs);
        }

        // Ensure stats has the correct structure
        const formattedStats: SaleStats = {
          sales: stats?.sales || {},
          total: stats?.total || 0,
          orders: stats?.orders || 0,
          total_profit: stats?.total_profit || 0
        };

        setSalesStats(formattedStats);
        setProducts(prods || []);
        setCategories(cats || []);

      } catch (error) {
        console.error('Dashboard error:', error);
        setError('Failed to load dashboard data. Please check the console for details.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear, selectedCategory]);

  // Prepare chart data
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Extract sales quantity and profit per month from backend stats
  const salesQuantity = salesStats?.sales
    ? months.map((_, idx) => salesStats.sales[(idx + 1).toString()]?.orders ?? 0)
    : Array(12).fill(0);

  const salesTotal = salesStats?.sales
    ? months.map((_, idx) => salesStats.sales[(idx + 1).toString()]?.total_price ?? 0)
    : Array(12).fill(0);

  const salesProfit = salesStats?.sales
    ? months.map((_, idx) => salesStats.sales[(idx + 1).toString()]?.profit ?? 0)
    : Array(12).fill(0);

  // KPIs
  const totalSales = salesStats?.total || 0;
  const totalProfit = salesStats?.total_profit || 0;
  const totalQuantity = salesStats?.orders || 0;

  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">Dashboard</h1>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
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
        <div>
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
            {categories.map((cat: any) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>
      {/* Loading/Error */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Sales</h2>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalSales)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                For {selectedYear}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Profit</h2>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalProfit)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Estimated (30% of sales)
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Quantity</h2>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {totalQuantity}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Orders in {selectedYear}
              </p>
            </div>
          </div>
          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
              <Bar
                data={{
                  labels: months,
                  datasets: [
                    {
                      label: 'Sales Quantity',
                      data: salesQuantity,
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
                    title: { display: true, text: `Monthly Sales Quantity (${selectedYear})` },
                  },
                  scales: {
                    y: { beginAtZero: true }
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
                      label: 'Sales Profit',
                      data: salesProfit,
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
                    y: {
                      beginAtZero: true,
                      ticks: { callback: (v: number) => formatCurrency(v) }
                    },
                  },
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
