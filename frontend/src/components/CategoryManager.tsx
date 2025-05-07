import React from 'react';
import { useForm } from 'react-hook-form';

export const CategoryManager = () => {
  const { register, handleSubmit, reset } = useForm();
  const [categories, setCategories] = React.useState<{ id: number; name: string; products?: { length: number }[] }[]>([]);

  const onSubmit = async (data) => {
    await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    reset();
    fetchCategories();
  };

  const fetchCategories = () => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(setCategories);
  };

  React.useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <input {...register('name')} placeholder="Category Name" className="w-full p-2 border rounded" />
        <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
          Add Category
        </button>
      </form>
      
      <div className="grid grid-cols-1 gap-2">
        {categories.map(cat => (
          <div key={cat.id} className="p-2 border rounded flex justify-between items-center">
            <span>{cat.name}</span>
            <span className="text-gray-500">({cat.products?.length || 0} products)</span>
          </div>
        ))}
      </div>
    </div>
  );
};
