import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, Button } from '@/components/ui';
import { fetchCategories } from '../services/apiService';
import { useProductCreate } from '../hooks/useProductCreate';

interface Category { id: number; name: string; }
interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category_id: number;
  brand: string;
}

/**
 * ProductForm component
 * Renders a form for registering a new product.
 * Handles validation, loading state, and user feedback.
 */
export const ProductForm = () => {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const { submit, loading, error, message, setMessage } = useProductCreate();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProductFormData>();

  React.useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  /**
   * Handles form submission to create a new product.
   * Shows success or error feedback.
   */
  const onSubmit = async (data: ProductFormData) => {
    // Format price to two decimal places before sending
    const formattedData = { ...data, price: Number(Number(data.price).toFixed(2)) };
    await submit(formattedData, () => {
      setMessage('Product created successfully!');
      reset();
    });
  };

  return (
    <Card>
      {/* Product registration form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Display error message if any */}
        {error && <div className="bg-red-100 text-red-700 px-3 py-2 rounded">{error}</div>}
        {/* Display success message if any */}
        {message && <div className="bg-green-100 text-green-700 px-3 py-2 rounded">{message}</div>}
        {/* Input for product name */}
        <input
          {...register('name', { required: 'Name is required' })}
          placeholder="Product Name"
          className={`input${errors.name ? ' border-red-500' : ''}`}
          disabled={loading}
        />
        {errors.name && <span className="text-red-500">{errors.name.message}</span>}
        {/* Input for product description */}
        <input
          {...register('description')}
          placeholder="Description"
          className="input"
          disabled={loading}
        />
        {/* Input for product price */}
        <input
          {...register('price', {
            required: 'Price is required',
            min: { value: 0, message: 'Price cannot be negative' }
          })}
          type="number"
          step="0.01"
          placeholder="Price"
          className={`input${errors.price ? ' border-red-500' : ''}`}
          disabled={loading}
        />
        {errors.price && <span className="text-red-500">{errors.price.message}</span>}
        {/* Input for product brand */}
        <input
          {...register('brand', { required: 'Brand is required' })}
          placeholder="Brand"
          className={`input${errors.brand ? ' border-red-500' : ''}`}
          disabled={loading}
        />
        {/* Dropdown for selecting category */}
        <select
          {...register('category_id', {
            required: 'Category is required',
            valueAsNumber: true
          })}
          defaultValue=""
          className={`input${errors.category_id ? ' border-red-500' : ''}`}
          disabled={loading}
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
        {errors.category_id && (
          <span className="text-red-500">{errors.category_id.message}</span>
        )}
        {/* Submit button */}
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Add Product'}
        </Button>
      </form>
    </Card>
  );
};
