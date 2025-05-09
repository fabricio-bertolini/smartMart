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

// Add these above your component
interface SaleData {
  quantity: number;
  total_price: number;
}

interface Category {
  id: number;
  name: string;
}

export const Dashboard = () => {
  const [salesData, setSalesData] = React.useState<Record<string, any>>({});
  const [selectedCategory, setSelectedCategory] = React.useState('');
  const [categories, setCategories] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      fetch('/api/sales/stats'),
      fetch('/api/categories')
    ])
      .then(([salesRes, categoriesRes]) => 
        Promise.all([
          salesRes.ok ? salesRes.json() : Promise.reject('Failed to fetch sales data'),
          categoriesRes.ok ? categoriesRes.json() : Promise.reject('Failed to fetch categories')
        ])
      )
      .then(([sales, cats]) => {
        setSalesData(sales || {});
        setCategories(cats || []);
      })
      .catch(error => {
        console.error('Dashboard data fetch error:', error);
        setError(typeof error === 'string' ? error : 'Failed to fetch dashboard data');
      })
      .finally(() => setLoading(false));
  }, []);

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
    <div className="space-y-4">
      <div className="flex gap-4">
        <Select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <Bar 
            options={chartOptions}
            data={{
              labels: Object.keys(salesData),
              datasets: [{
                label: 'Sales Quantity',
                data: Object.values(salesData).map(d => d.quantity),
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
              }]
            }} 
          />
        </Card>
        <Card>
          <Line 
            options={chartOptions}
            data={{
              labels: Object.keys(salesData),
              datasets: [{
                label: 'Sales Revenue',
                data: Object.values(salesData).map(d => d.total_price),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
              }]
            }} 
          />
        </Card>
      </div>
    </div>
  );
};
