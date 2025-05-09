import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, Button } from '@/components/ui';

interface Category {
  id: number;
  name: string;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category_id: number;
  brand: string;
}

export const ProductForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<ProductFormData>();
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    try {
      // Ensure price is always two decimals
      const formattedData = {
        ...data,
        price: Number(Number(data.price).toFixed(2))
      };
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData)
      });

      if (!response.ok) {
        throw new Error('Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input 
          {...register('name', { required: 'Name is required' })} 
          placeholder="Product Name" 
        />
        {errors.name && <span className="text-red-500">{errors.name.message}</span>}

        <input 
          {...register('description')} 
          placeholder="Description" 
        />

        <input 
          {...register('price', { 
            required: 'Price is required',
            min: { value: 0, message: 'Price cannot be negative' }
          })} 
          type="number" 
          step="0.01"
          placeholder="Price" 
        />
        {errors.price && <span className="text-red-500">{errors.price.message}</span>}

        <input 
          {...register('brand', { required: 'Brand is required' })} 
          placeholder="Brand" 
        />

        <select 
          {...register('category_id', { 
            required: 'Category is required',
            valueAsNumber: true
          })}
          defaultValue=""
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.category_id && (
          <span className="text-red-500">{errors.category_id.message}</span>
        )}

        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Add Product'}
        </Button>
      </form>
    </Card>
  );
};
