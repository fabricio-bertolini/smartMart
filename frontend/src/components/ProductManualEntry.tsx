import React from 'react';
import { fetchCategories } from '../services/apiService';
import { useProductCreate } from '../hooks/useProductCreate';

/**
 * Interface for Category data
 */
interface Category {
  id: number;
  name: string;
}

/**
 * Product Manual Entry Component
 * 
 * Provides a form interface for manually adding new products to the system.
 * Includes validation, category selection, and error handling.
 * 
 * Features:
 * - Form validation
 * - Dynamic category selection
 * - Error handling and display
 * - Success feedback
 * - Dark mode support
 * - Accessible form controls
 * - Field-level validation
 */
export const ProductManualEntry: React.FC = () => {
  // State management
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [form, setForm] = React.useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    brand: ''
  });

  // Product creation hook
  const { submit, loading, message, setMessage, error } = useProductCreate();

  /**
   * Effect to load categories on component mount
   */
  React.useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  /**
   * Generic change handler for form inputs
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /**
   * Form submission handler
   * Validates and submits product data, resets form on success
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    await submit(
      {
        ...form,
        price: Number(form.price),
        category_id: Number(form.category_id)
      },
      () => setForm({ name: '', description: '', price: '', category_id: '', brand: '' })
    );
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded shadow bg-white dark:bg-gray-800 dark:border-gray-700">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Add Product Manually</h2>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Product name input */}
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Product Name"
          className="w-full border p-2 rounded bg-white dark:bg-gray-800 
            text-gray-900 dark:text-gray-100 dark:border-gray-600 
            dark:placeholder-gray-400"
          required
        />

        {/* Product description input */}
        <input
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full border p-2 rounded bg-white dark:bg-gray-800 
            text-gray-900 dark:text-gray-100 dark:border-gray-600 
            dark:placeholder-gray-400"
        />

        {/* Price input */}
        <input
          name="price"
          value={form.price}
          onChange={handleChange}
          placeholder="Price"
          type="number"
          step="0.01"
          min="0"
          className="w-full border p-2 rounded bg-white dark:bg-gray-800 
            text-gray-900 dark:text-gray-100 dark:border-gray-600 
            dark:placeholder-gray-400"
          required
        />

        {/* Brand input */}
        <input
          name="brand"
          value={form.brand}
          onChange={handleChange}
          placeholder="Brand"
          className="w-full border p-2 rounded bg-white dark:bg-gray-800 
            text-gray-900 dark:text-gray-100 dark:border-gray-600 
            dark:placeholder-gray-400"
          required
        />

        {/* Category selector */}
        <select
          name="category_id"
          value={form.category_id}
          onChange={handleChange}
          className="w-full border p-2 rounded bg-white dark:bg-gray-800 
            text-gray-900 dark:text-gray-100 dark:border-gray-600"
          required
        >
          <option value="" className="dark:bg-gray-800">Select Category</option>
          {(Array.isArray(categories) ? categories : []).map(cat => (
            <option key={cat.id} value={cat.id} className="dark:bg-gray-800">
              {cat.name}
            </option>
          ))}
        </select>

        {/* Submit button */}
        <button
          type="submit"
          className="w-full bg-blue-600 dark:bg-blue-700 text-white py-2 rounded 
            hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Product'}
        </button>

        {/* Status messages */}
        {message && (
          <div className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
            {message}
          </div>
        )}
        {error && (
          <div className="mt-2 text-center text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
      </form>
    </div>
  );
};
