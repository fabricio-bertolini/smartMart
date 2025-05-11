import React from 'react';

interface Category {
  id: number;
  name: string;
}

export const ProductManualEntry = () => {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [form, setForm] = React.useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    brand: ''
  });
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data.data || []));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          category_id: Number(form.category_id)
        })
      });
      if (!response.ok) throw new Error('Failed to add product');
      setMessage('Product added successfully!');
      setForm({ name: '', description: '', price: '', category_id: '', brand: '' });
    } catch (err) {
      setMessage('Error adding product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded shadow bg-white">
      <h2 className="text-xl font-bold mb-4">Add Product Manually</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Product Name"
          className="w-full border p-2 rounded"
          required
        />
        <input
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full border p-2 rounded"
        />
        <input
          name="price"
          value={form.price}
          onChange={handleChange}
          placeholder="Price"
          type="number"
          step="0.01"
          min="0"
          className="w-full border p-2 rounded"
          required
        />
        <input
          name="brand"
          value={form.brand}
          onChange={handleChange}
          placeholder="Brand"
          className="w-full border p-2 rounded"
          required
        />
        <select
          name="category_id"
          value={form.category_id}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Product'}
        </button>
        {message && <div className="mt-2 text-center text-sm">{message}</div>}
      </form>
    </div>
  );
};
