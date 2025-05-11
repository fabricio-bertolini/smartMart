import React from 'react';
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
import { Bar, Line } from 'react-chartjs-2';
import { Card, Select } from '@/components/ui';

// Register ChartJS components
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

// Add interfaces for props and data
interface SaleData {
  quantity: number;
  total_price: number;
  date?: string;
}

interface Category {
  id: number;
  name: string;
}

interface StatsCardProps {
  title: string;
  value: string | number;
  trend: string;
  trendUp: boolean | null;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }[];
}

interface ApiResponse<T> {
  data: T;
  error?: string;
}

interface SalesData {
  [key: string]: {
    quantity: number;
    total_price: number;
  };
}

interface Product {
  id: number;
  name: string;
  price: number;
  category_id: number;
}

export const Dashboard = () => {
  const [salesData, setSalesData] = React.useState<ChartData>({
    labels: [],
    datasets: [{
      label: 'Sales',
      data: [],
      backgroundColor: 'rgba(99, 102, 241, 0.5)',
      borderColor: 'rgb(99, 102, 241)',
      borderWidth: 1
    }]
  });
  const [profitData, setProfitData] = React.useState<ChartData>({
    labels: [],
    datasets: [{
      label: 'Profit (Δ Sales)',
      data: [],
      backgroundColor: 'rgba(16, 185, 129, 0.3)',
      borderColor: 'rgb(16, 185, 129)',
      borderWidth: 2
    }]
  });
  const [selectedCategory, setSelectedCategory] = React.useState('');
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [salesStats, setSalesStats] = React.useState({
    total: 0,
    orders: 0
  });
  const [products, setProducts] = React.useState<Product[]>([]);
  const [allProducts, setAllProducts] = React.useState<Product[]>([]);
  const [allYears, setAllYears] = React.useState<number[]>([]);
  const [selectedYear, setSelectedYear] = React.useState<number | null>(null);

  // --- Get all years for the selected category (or all) ---
  React.useEffect(() => {
    setLoading(true);
    setError(null);

    let salesUrl = '/api/sales/stats';
    if (selectedCategory) {
      salesUrl += `?category_id=${selectedCategory}`;
    }
    fetch(salesUrl)
      .then(res => res.json() as Promise<ApiResponse<SalesData>>)
      .then(salesRes => {
        const sales = salesRes.data || {};
        const yearsSet = new Set<number>();
        Object.keys(sales).forEach(monthYear => {
          const parts = monthYear.split(' ');
          if (parts.length === 2) {
            const year = parseInt(parts[1]);
            if (!isNaN(year)) yearsSet.add(year);
          }
        });
        const years = Array.from(yearsSet).sort((a, b) => b - a);
        setAllYears(years);
        // If selectedYear is not in the available years, set to most recent
        if (!years.includes(selectedYear ?? -1) && years.length > 0) {
          setSelectedYear(years[0]);
        }
        setLoading(false);
      })
      .catch(error => {
        setError(error instanceof Error ? error.message : 'Failed to fetch years');
        setLoading(false);
      });
  }, [selectedCategory]);

  // --- Fetch products and sales for the selected year/category ---
  React.useEffect(() => {
    if (!selectedYear) return;
    setLoading(true);
    setError(null);

    Promise.all([
      fetch('/api/categories').then(res => res.json() as Promise<ApiResponse<Category[]>>),
      fetch('/api/products').then(res => res.json() as Promise<ApiResponse<Product[]>>)
    ])
      .then(([categoriesRes, productsRes]) => {
        if (categoriesRes.error) throw new Error(categoriesRes.error);
        if (productsRes.error) throw new Error(productsRes.error);

        const cats = categoriesRes.data || [];
        const prods = productsRes.data || [];
        setCategories(cats);
        setAllProducts(prods);

        // Fetch sales for the selected category and year (both filters applied)
        let salesUrl = `/api/sales/stats?year=${selectedYear}`;
        if (selectedCategory) {
          salesUrl += `&category_id=${selectedCategory}`;
        }
        fetch(salesUrl)
          .then(res => res.json() as Promise<ApiResponse<SalesData>>)
          .then(salesRes => {
            const sales = salesRes.data || {};

            // --- Filter products for stats ---
            const filteredProducts = selectedCategory
              ? prods.filter(p => String(p.category_id) === selectedCategory)
              : prods;
            setProducts(filteredProducts);

            // --- Only show months for selected year ---
            const labels = Object.keys(sales)
              .filter(monthYear => {
                const parts = monthYear.split(' ');
                return parts.length === 2 && parseInt(parts[1]) === selectedYear;
              })
              .sort((a, b) => {
                const [ma] = a.split(' ');
                const [mb] = b.split(' ');
                const months = [
                  "January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"
                ];
                return months.indexOf(ma) - months.indexOf(mb);
              });

            // --- Calculate values and quantities for chart and stats ---
            const values = labels.map(month => sales[month]?.total_price || 0);
            const quantities = labels.map(month => sales[month]?.quantity || 0);
            const profit = values.map((val, i, arr) => i === 0 ? 0 : val - arr[i - 1]);

            setSalesData({
              labels,
              datasets: [{
                label: 'Sales',
                data: values,
                backgroundColor: 'rgba(99, 102, 241, 0.5)',
                borderColor: 'rgb(99, 102, 241)',
                borderWidth: 1
              }]
            });

            setProfitData({
              labels,
              datasets: [{
                label: 'Profit (Δ Sales)',
                data: profit,
                backgroundColor: 'rgba(16, 185, 129, 0.3)',
                borderColor: 'rgb(16, 185, 129)',
                borderWidth: 2
              }]
            });

            // --- Calculate total sales and orders for stats (filtered by year and category) ---
            const total = values.reduce((acc, curr) => acc + curr, 0);
            const orders = quantities.reduce((acc, curr) => acc + curr, 0);
            setSalesStats({ total, orders });
          })
          .catch(error => {
            setError(error instanceof Error ? error.message : 'Failed to fetch sales data');
          })
          .finally(() => setLoading(false));
      })
      .catch(error => {
        setError(error instanceof Error ? error.message : 'Failed to fetch dashboard data');
        setLoading(false);
      });
  }, [selectedCategory, selectedYear]);

  if (loading) {
    return <div>Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  const chartOptions = {
    responsive: true,
    scales: {
      x: {
        type: 'category' as const,
        display: true
      },
      y: {
        display: true,
        beginAtZero: true
      }
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-2">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
        <div className="flex gap-2">
          <select
            value={selectedYear ?? ''}
            onChange={e => setSelectedYear(Number(e.target.value))}
            className="form-select rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            {allYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="form-select rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Sales"
          value={`$${Number(salesStats.total || 0).toFixed(2)}`}
          trend="+12.5%"
          trendUp={true}
        />
        <StatsCard
          title="Orders"
          value={salesStats.orders || 0}
          trend="+5.0%"
          trendUp={true}
        />
        <StatsCard
          title="Average Order Value"
          value={`$${(salesStats.orders ? (salesStats.total / salesStats.orders).toFixed(2) : '0.00')}`}
          trend="-2.3%"
          trendUp={false}
        />
        <StatsCard
          title="Total products in category"
          value={products.length}
          trend="0%"
          trendUp={null}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-white rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Sales Overview</h3>
          <div className="h-[400px]">
            <Bar data={salesData} options={chartOptions} />
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Profit Overview</h3>
          <div className="h-[400px]">
            <Line data={profitData} options={chartOptions} />
          </div>
        </Card>
      </div>
    </div>
  );
};

const StatsCard: React.FC<StatsCardProps> = ({ title, value, trend, trendUp }) => (
  <Card className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
    <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
    <div className="flex items-baseline justify-between">
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
      {trend && (
        <span className={`px-2 py-0.5 rounded-full text-sm ${
          trendUp === null 
            ? 'bg-gray-100 text-gray-800'
            : trendUp
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {trend}
        </span>
      )}
    </div>
  </Card>
);
