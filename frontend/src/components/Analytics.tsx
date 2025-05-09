import React from 'react';
import { Line, Pie } from 'react-chartjs-2';

export const Analytics = () => {
  const [analyticsData, setAnalyticsData] = React.useState({
    monthlySales: {
      labels: [],
      datasets: []
    },
    categoryDistribution: {
      labels: [],
      datasets: []
    }
  });
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    Promise.all([
      fetch('/sales/monthly?year=' + new Date().getFullYear()),
      fetch('/sales/by-category')
    ])
      .then(([monthlyRes, categoryRes]) => {
        if (!monthlyRes.ok) throw new Error('Failed to fetch monthly data');
        if (!categoryRes.ok) throw new Error('Failed to fetch category data');
        return Promise.all([monthlyRes.json(), categoryRes.json()]);
      })
      .then(([monthlyData, categoryData]) => {
        setAnalyticsData({
          monthlySales: monthlyData,
          categoryDistribution: categoryData
        });
      })
      .catch(err => {
        setError(err.message);
        console.error('Error fetching analytics:', err);
      });
  }, []);

  if (error) {
    return <div className="text-red-500">Error loading analytics: {error}</div>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-4">Monthly Sales Trend</h3>
          <Line data={analyticsData.monthlySales} options={{ responsive: true }} />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Sales by Category</h3>
          <Pie data={analyticsData.categoryDistribution} options={{ responsive: true }} />
        </div>
      </div>
    </div>
  );
};
