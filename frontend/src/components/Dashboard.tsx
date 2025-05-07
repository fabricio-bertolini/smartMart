import React from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { Card, Select } from '@/components/ui';

export const Dashboard = () => {
  const [salesData, setSalesData] = React.useState([]);
  const [selectedCategory, setSelectedCategory] = React.useState(null);
  const [categories, setCategories] = React.useState([]);

  React.useEffect(() => {
    Promise.all([
      fetch('/api/sales/stats').then(res => res.json()),
      fetch('/api/categories').then(res => res.json())
    ]).then(([sales, cats]) => {
      setSalesData(sales);
      setCategories(cats);
    });
  }, []);

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
          <Bar data={{
            labels: Object.keys(salesData),
            datasets: [{
              label: 'Sales Quantity',
              data: Object.values(salesData).map(d => d.quantity)
            }]
          }} />
        </Card>
        <Card>
          <Line data={{
            labels: Object.keys(salesData),
            datasets: [{
              label: 'Sales Profit',
              data: Object.values(salesData).map(d => d.profit)
            }]
          }} />
        </Card>
      </div>
    </div>
  );
};
