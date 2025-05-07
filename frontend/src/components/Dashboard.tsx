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

export const Dashboard = () => {
  const [salesData, setSalesData] = React.useState([]);
  const [selectedCategory, setSelectedCategory] = React.useState('');  // Changed from null to empty string
  const [categories, setCategories] = React.useState([]);

  React.useEffect(() => {
    Promise.all([
      fetch('http://localhost:8000/sales/stats')
        .then(res => res.ok ? res.json() : Promise.reject(res))
        .catch(() => ({})),
      fetch('http://localhost:8000/categories/')
        .then(res => res.ok ? res.json() : Promise.reject(res))
        .catch(() => [])
    ]).then(([sales, cats]) => {
      setSalesData(sales || {});
      setCategories(cats || []);
    }).catch(error => {
      console.error('Failed to fetch dashboard data:', error);
    });
  }, []);

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
                label: 'Sales Profit',
                data: Object.values(salesData).map(d => d.profit),
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
