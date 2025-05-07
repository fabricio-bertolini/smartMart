import React from 'react';
import { Line, Pie } from 'react-chartjs-2';

export const Analytics = () => {
  const [analyticsData, setAnalyticsData] = React.useState({
    monthlySales: [],
    categoryDistribution: []
  });

  React.useEffect(() => {
    Promise.all([
      fetch('http://localhost:8000/sales/monthly'),
      fetch('http://localhost:8000/sales/by-category')
    ]).then(([monthlyRes, categoryRes]) => 
      Promise.all([monthlyRes.json(), categoryRes.json()])
    ).then(([monthlyData, categoryData]) => {
      setAnalyticsData({
        monthlySales: monthlyData,
        categoryDistribution: categoryData
      });
    });
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-4 bg-white rounded shadow">
        <h3 className="text-lg font-semibold mb-4">Monthly Sales Trend</h3>
        <Line data={analyticsData.monthlySales} />
      </div>
      <div className="p-4 bg-white rounded shadow">
        <h3 className="text-lg font-semibold mb-4">Sales by Category</h3>
        <Pie data={analyticsData.categoryDistribution} />
      </div>
    </div>
  );
};
