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
  const [sales, setSales] = React.useState<Sale[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchSales = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/sales/');
      if (!res.ok) throw new Error('Failed to fetch sales');
      const data = await res.json();
      setSales(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSales();
  }, []);

  const handleEdit = async (saleId: number, field: keyof Sale, value: string | number) => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return;
    const updated = { ...sale, [field]: value };
    // Convert date to ISO if editing date
    if (field === 'date') {
      updated.date = String(value);
    }
    try {
      const res = await fetch(`/api/sales/${saleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error('Failed to update sale');
      const updatedSale = await res.json();
      setSales(prev =>
        prev.map(s => (s.id === saleId ? { ...s, ...updatedSale } : s))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update sale');
    }
  };

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
      <h2 className="text-xl font-bold mb-4">Sales Editor</h2>
      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead>
            <tr>
              <th>ID</th>
              <th>Product ID</th>
              <th>Quantity</th>
              <th>Total Price</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {sales.map(sale => (
              <tr key={sale.id}>
                <td>{sale.id}</td>
                <td>
                  <input
                    type="number"
                    value={sale.product_id}
                    onChange={e =>
                      handleEdit(sale.id, 'product_id', Number(e.target.value))
                    }
                    className="border p-1 w-24"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={sale.quantity}
                    onChange={e =>
                      handleEdit(sale.id, 'quantity', Number(e.target.value))
                    }
                    className="border p-1 w-24"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={sale.total_price}
                    step="0.01"
                    onChange={e =>
                      handleEdit(sale.id, 'total_price', Number(e.target.value))
                    }
                    className="border p-1 w-24"
                  />
                </td>
                <td>
                  <input
                    type="date"
                    value={sale.date.slice(0, 10)}
                    onChange={e =>
                      handleEdit(sale.id, 'date', e.target.value)
                    }
                    className="border p-1 w-36"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};