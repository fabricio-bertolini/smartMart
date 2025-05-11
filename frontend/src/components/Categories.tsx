import React from 'react';
import { useCategories } from '../hooks/useCategories';
import { CategoryManager } from './CategoryManager';

/**
 * Interface for Category data
 */
interface Category {
  id: number;
  name: string;
}

/**
 * Categories Component
 * 
 * Provides a complete interface for viewing and managing product categories.
 * Displays a list of existing categories and provides functionality to add new ones.
 * 
 * Features:
 * - Category listing with clear hierarchy
 * - Category creation interface
 * - Success feedback
 * - Loading states
 * - Error handling
 * - Empty state handling
 * - Dark mode support
 * - Accessible list structure
 * 
 * Uses:
 * - useCategories hook for data fetching
 * - CategoryManager for creation interface
 * - Tailwind CSS for styling
 */
const Categories: React.FC = () => {
  // Use categories hook for data management
  const { categories, loading, error } = useCategories();
  
  /**
   * State for managing success message display
   * Shows temporary feedback after successful category creation
   */
  const [success, setSuccess] = React.useState<string | null>(null);

  /**
   * Handles successful category creation
   * Displays success message with auto-dismissal
   */
  const handleCategoryCreated = () => {
    setSuccess('Category created!');
    setTimeout(() => setSuccess(null), 2000);
  };

  return (
    <div className="p-6">
      {/* Page header */}
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        Categories
      </h2>

      <div className="mt-4">
        {/* Category creation interface */}
        <CategoryManager onCreated={handleCategoryCreated} />

        {/* Success message */}
        {success && (
          <div 
            className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 
              px-3 py-2 rounded mt-2"
            role="alert"
          >
            {success}
          </div>
        )}

        {/* Categories list with state handling */}
        <div className="mt-6">
          {loading ? (
            // Loading state
            <div className="flex justify-center py-8">
              <span 
                className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 
                  border-blue-500 dark:border-blue-400"
                role="status"
                aria-label="Loading categories"
              />
            </div>
          ) : error ? (
            // Error state
            <div 
              className="text-red-500 dark:text-red-400"
              role="alert"
            >
              Error loading categories.
            </div>
          ) : categories.length === 0 ? (
            // Empty state
            <div className="text-gray-500 dark:text-gray-400">
              No categories found.
            </div>
          ) : (
            // Categories list
            <ul 
              className="list-disc pl-6 space-y-1 text-gray-800 dark:text-gray-200"
              role="list"
              aria-label="Categories list"
            >
              {categories.map(cat => (
                <li key={cat.id}>{cat.name}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;
