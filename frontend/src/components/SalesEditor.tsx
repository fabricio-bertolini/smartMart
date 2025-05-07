import React from 'react';
import { Card } from '@/components/ui/card';

export const SalesEditor = () => {
  const [monthlySales, setMonthlySales] = React.useState({});
  const [year, setYear] = React.useState(new Date().getFullYear());

  const fetchSales = async () => {
    const res = await fetch(`/api/sales/monthly?year=${year}`);
    const data = await res.json();
    setMonthlySales(data);
  };

  const updateSale = async (month: string, field: string, value: number) => {
    const updated = { ...monthlySales[month], [field]: value };
    await fetch(`/api/sales/${month}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    fetchSales();
  };

  React.useEffect(() => {
    fetchSales();
  }, [year]);

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
            <th>Profit</th>
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
                  value={data.profit}
                  onChange={(e) => updateSale(month, 'profit', Number(e.target.value))}
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
