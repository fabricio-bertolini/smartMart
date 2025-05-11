import React from 'react';
import { Button } from '@/components/ui';

/**
 * Props interface for CategoryManager component
 * @param onCreated - Optional callback function triggered after successful category creation
 */
interface Props {
  onCreated?: () => void;
}

/**
 * CategoryManager Component
 * 
 * Provides an interface for creating new product categories.
 * Features a form with validation, error handling, and loading states.
 * 
 * Features:
 * - Input validation
 * - Loading state handling
 * - Error display
 * - Enter key submission
 * - Success callback
 * - Dark mode support
 * - Accessible form controls
 * 
 * Usage:
 * ```tsx
 * <CategoryManager onCreated={() => {
 *   // Handle successful category creation
 *   refreshCategories();
 * }} />
 * ```
 */
export const CategoryManager: React.FC<Props> = ({ onCreated }) => {
  // State management
  const [newCategory, setNewCategory] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  /**
   * Handles category creation submission
   * Validates input and makes API request
   */
  const handleSubmit = async () => {
    // Validate input
    if (!newCategory.trim()) {
      setError('Category name is required');
      return;
    }

    // Reset states and start submission
    setLoading(true);
    setError(null);

    try {
      // Make API request
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategory })
      });

      if (!response.ok) throw new Error('Failed to create category');

      // Reset form and trigger success callback
      setNewCategory('');
      if (onCreated) onCreated();
    } catch (error) {
      setError('Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2 items-center">
      {/* Category name input */}
      <input
        placeholder="New Category Name"
        value={newCategory}
        onChange={e => setNewCategory(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        className={`input bg-white dark:bg-gray-800 
          text-gray-900 dark:text-gray-100 
          dark:border-gray-600 dark:placeholder-gray-400 
          ${error ? ' border-red-500 dark:border-red-500' : ''}`}
        disabled={loading}
        aria-label="Category name"
        aria-invalid={error ? 'true' : 'false'}
      />

      {/* Submit button */}
      <Button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? 'Adding...' : 'Add Category'}
      </Button>

      {/* Error message */}
      {error && (
        <span 
          className="text-red-500 dark:text-red-400 ml-2" 
          role="alert"
        >
          {error}
        </span>
      )}
    </div>
  );
};
