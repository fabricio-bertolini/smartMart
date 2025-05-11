import React from 'react';
import { Card } from '@/components/ui';
import { useSales } from '../hooks/useSales';

interface Sale {
  id: number;
  product_id: number;
  quantity: number;
  total_price: number;
  date: string;
}

export const SalesEditor = () => {
  const { sales, loading, error } = useSales();
  const [editRows, setEditRows] = React.useState<Record<number, Partial<Sale>>>({});
  const [savingId, setSavingId] = React.useState<number | null>(null);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [localSales, setLocalSales] = React.useState<Sale[]>([]);

  React.useEffect(() => {
    setLocalSales(sales);
  }, [sales]);

  // Handle input changes
  const handleChange = (id: number, field: keyof Sale, value: string | number) => {
    setEditRows(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  // Save changes to backend
  const handleSave = async (id: number) => {
    setSavingId(id);
    setSaveError(null);
    const updates = editRows[id];
    try {
      const res = await fetch(`/api/sales/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update sale');
      // Update local sales state with new values
      setLocalSales(prev =>
        prev.map(sale =>
          sale.id === id ? { ...sale, ...updates } : sale
        )
      );
      setEditRows(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    } catch (e: any) {
      setSaveError(e.message || 'Failed to update sale');
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <Card className="p-8 flex justify-center items-center min-h-[200px]">
        <span className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></span>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="bg-red-100 text-red-700 px-3 py-2 rounded mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Retry
        </button>
      </Card>
    );
  }

  return (
    <Card className="p-6 md:p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">Sales Editor</h2>
        <p className="text-gray-500 dark:text-gray-300 text-sm">Edit sales records inline. Changes are saved instantly.</p>
      </div>
      {saveError && <div className="text-red-500 dark:text-red-300 mb-3">{saveError}</div>}
      <div className="overflow-x-auto">
        {localSales.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-300 text-center py-12">No sales records found.</div>
        ) : (
          <table className="min-w-full border rounded-lg bg-white dark:bg-gray-900 shadow-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
              <tr>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 dark:text-gray-200 border-b">ID</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 dark:text-gray-200 border-b">Product ID</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 dark:text-gray-200 border-b">Quantity</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 dark:text-gray-200 border-b">Total Price</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 dark:text-gray-200 border-b">Date</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 dark:text-gray-200 border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {localSales.map((sale, idx) => {
                const edit = editRows[sale.id] || {};
                return (
                  <tr
                    key={sale.id}
                    className={
                      idx % 2 === 0
                        ? "bg-white dark:bg-gray-800"
                        : "bg-gray-50 dark:bg-gray-900"
                    }
                  >
                    <td className="py-2 px-4 border-b text-gray-800 dark:text-gray-100">{sale.id}</td>
                    <td className="py-2 px-4 border-b">
                      <input
                        type="number"
                        value={edit.product_id ?? sale.product_id}
                        className="border rounded px-2 py-1 w-24 focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                        onChange={e => handleChange(sale.id, 'product_id', Number(e.target.value))}
                      />
                    </td>
                    <td className="py-2 px-4 border-b">
                      <input
                        type="number"
                        value={edit.quantity ?? sale.quantity}
                        className="border rounded px-2 py-1 w-24 focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                        onChange={e => handleChange(sale.id, 'quantity', Number(e.target.value))}
                        min={1}
                      />
                    </td>
                    <td className="py-2 px-4 border-b">
                      <input
                        type="number"
                        value={edit.total_price ?? sale.total_price}
                        step="0.01"
                        className="border rounded px-2 py-1 w-28 focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                        onChange={e => handleChange(sale.id, 'total_price', Number(e.target.value))}
                        min={0}
                      />
                    </td>
                    <td className="py-2 px-4 border-b">
                      <input
                        type="date"
                        value={(edit.date ?? sale.date).slice(0, 10)}
                        className="border rounded px-2 py-1 w-36 focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                        onChange={e => handleChange(sale.id, 'date', e.target.value)}
                      />
                    </td>
                    <td className="py-2 px-4 border-b">
                      <button
                        className={`px-4 py-1 rounded font-medium transition
                          ${savingId === sale.id
                            ? 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-not-allowed'
                            : 'bg-blue-600 dark:bg-blue-700 text-white dark:text-gray-100 hover:bg-blue-700 dark:hover:bg-blue-800 focus:ring-2 focus:ring-blue-400'
                          }`}
                        onClick={() => handleSave(sale.id)}
                        disabled={savingId === sale.id}
                      >
                        {savingId === sale.id ? 'Saving...' : 'Save'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
};