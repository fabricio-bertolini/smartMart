import React from 'react';
import { Button, Input, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

export const CategoryManager: React.FC = () => {
  const [newCategory, setNewCategory] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async () => {
    if (!newCategory.trim()) {
      message.error('Category name is required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategory })
      });

      if (!response.ok) throw new Error('Failed to create category');
      
      message.success('Category created successfully');
      setNewCategory('');
    } catch (error) {
      message.error('Failed to create category');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <Input
        placeholder="New Category Name"
        value={newCategory}
        onChange={e => setNewCategory(e.target.value)}
        onPressEnter={handleSubmit}
      />
      <Button
        type="primary"
        icon={<PlusOutlined />}
        loading={loading}
        onClick={handleSubmit}
      >
        Add Category
      </Button>
    </div>
  );
};
