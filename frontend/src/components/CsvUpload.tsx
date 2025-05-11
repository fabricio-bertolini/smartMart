import React from 'react';
import { Button } from '@/components/ui';
import { useCsvUpload } from '../hooks/useCsvUpload';

/**
 * CsvUpload Component
 * 
 * Handles CSV file uploads for products, categories, and sales data.
 * Provides feedback on upload status and validates file format.
 * 
 * Features:
 * - Multiple data type support (products, categories, sales)
 * - File type validation
 * - Upload progress feedback
 * - Error handling and display
 * - Success confirmation
 * - Dark mode support
 * - Accessible inputs and controls
 */
export const CsvUpload: React.FC = () => {
  // State management
  const [file, setFile] = React.useState<File | null>(null);
  const [importType, setImportType] = React.useState<'products' | 'categories' | 'sales'>('products');
  const { handleUpload, loading, error, success, setSuccess, setError } = useCsvUpload();

  /**
   * Handles the upload process
   * Validates file presence and triggers upload
   */
  const onUpload = async () => {
    if (!file) return;
    await handleUpload(file, importType);
    setFile(null);
  };

  return (
    <div className="space-y-4">
      {/* Import type selector */}
      <div className="flex gap-4 mb-4">
        <select
          value={importType}
          onChange={(e) => setImportType(e.target.value as 'products' | 'categories' | 'sales')}
          className="px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
        >
          <option value="products" className="dark:bg-gray-800">Products</option>
          <option value="categories" className="dark:bg-gray-800">Categories</option>
          <option value="sales" className="dark:bg-gray-800">Sales</option>
        </select>
      </div>

      {/* File input */}
      <input
        type="file"
        accept=".csv"
        onChange={(e) => {
          setFile(e.target.files?.[0] || null);
          setError(null);
        }}
        className="block w-full text-sm text-gray-500 dark:text-gray-400 
          file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold 
          file:bg-blue-50 file:text-blue-700 
          dark:file:bg-blue-900 dark:file:text-blue-300 
          hover:file:bg-blue-100 dark:hover:file:bg-blue-800"
      />
      
      {/* Error display */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-3 py-2 rounded">
          {error}
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-3 py-2 rounded whitespace-pre-line">
          {success}
        </div>
      )}

      {/* Upload button */}
      <div className="flex gap-4">
        <Button
          onClick={onUpload}
          disabled={!file || loading}
        >
          {loading ? 'Uploading...' : 'Upload CSV'}
        </Button>
      </div>

      {/* Format guidelines */}
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
        <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-100">Expected CSV Format:</h3>
        {importType === 'products' && (
          <p>Products: name, description, price, category_id, brand</p>
        )}
        {importType === 'categories' && (
          <p>Categories: name</p>
        )}
        {importType === 'sales' && (
          <p>Sales: product_id, quantity, total_price, date</p>
        )}
      </div>
    </div>
  );
};
