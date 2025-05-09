import React from 'react';
import { Card } from '@/components/ui';

interface Sale {
  id: number;
  product_id: number;
  quantity: number;
  total_price: number;
  date: string;
}

export const SalesEditor = () => {
  const [monthlySales, setMonthlySales] = React.useState({});
  const [year, setYear] = React.useState(new Date().getFullYear());
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchSales = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sales/monthly?year=${year}`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to fetch sales data: ${res.status} ${text}`);
      }
      const data = await res.json();
      setMonthlySales(data || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setMonthlySales({});
    } finally {
      setLoading(false);
    }
  };

  const updateSale = React.useCallback(async (month: string, field: string, value: number) => {
    try {
      setMonthlySales(prev => ({
        ...prev,
        [month]: { ...prev[month], [field]: value }
      }));

      const updated = { ...monthlySales[month], [field]: value };
      const res = await fetch(`/api/sales/${month}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(updated)
      });

      if (!res.ok) {
        throw new Error(`Failed to update sales data: ${res.statusText}`);
      }

      // Only refetch if the update was successful
      const updatedData = await res.json();
      setMonthlySales(prev => ({
        ...prev,
        [month]: updatedData
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update sales');
      // Revert the optimistic update on error
      await fetchSales();
    }
  }, [monthlySales]);

  React.useEffect(() => {
    fetchSales();
  }, [year]);

  if (loading) {
    return <Card className="p-4">Loading sales data...</Card>;
  }

  if (error) {
    return (
      <Card className="p-4">
        <div className="text-red-500">{error}</div>
        <button 
          onClick={fetchSales}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Monthly Sales Editor</h2>
        <select 
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border p-1"
        >
          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)
            .map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
        </select>
      </div>

      <table className="w-full">
        <thead>
          <tr>
            <th>Month</th>
            <th>Quantity</th>
            <th>Total Price</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(monthlySales).map(([month, data]: [string, any]) => (
            <tr key={month}>
              <td>{month}</td>
              <td>
                <input
                  type="number"
                  value={data.quantity}
                  onChange={(e) => updateSale(month, 'quantity', Number(e.target.value))}
                  className="border p-1 w-24"
                />
              </td>
              <td>
                <input
                  type="number"
                  value={data.total_price}
                  onChange={(e) => updateSale(month, 'total_price', Number(e.target.value))}
                  className="border p-1 w-24"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
};