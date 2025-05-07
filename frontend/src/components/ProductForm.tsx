import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, Input, Select, Button } from '@/components/ui';

export const ProductForm = () => {
  const { register, handleSubmit } = useForm();
  const [categories, setCategories] = React.useState([]);

  React.useEffect(() => {
    fetch('/api/categories').then(res => res.json()).then(setCategories);
  }, []);

  const onSubmit = async (data) => {
    await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  };

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input {...register('name')} placeholder="Product Name" />
        <Input {...register('price')} type="number" placeholder="Price" />
        <Input {...register('cost')} type="number" placeholder="Cost" />
        <Select {...register('category_id')}>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </Select>
        <Button type="submit">Add Product</Button>
      </form>
    </Card>
  );
};
