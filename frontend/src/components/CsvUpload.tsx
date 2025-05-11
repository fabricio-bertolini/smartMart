import React from 'react';

export const CsvUpload = () => {
  const [file, setFile] = React.useState<File | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [importType, setImportType] = React.useState<'products' | 'categories' | 'sales'>('products');

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', importType);

    try {
      const response = await fetch('/api/import/csv', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to upload ${importType} data`);
      }

      const data = await response.json();
      if (data.warnings) {
        alert(`Import completed with warnings:\n${data.warnings.join('\n')}`);
      } else {
        alert(`Successfully imported ${data.message}`);
      }
      setFile(null);

    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 mb-4">
        <select
          value={importType}
          onChange={(e) => setImportType(e.target.value as 'products' | 'categories' | 'sales')}
          className="px-3 py-2 border rounded-md"
        >
          <option value="products">Products</option>
          <option value="categories">Categories</option>
          <option value="sales">Sales</option>
        </select>
      </div>

      <input
        type="file"
        accept=".csv"
        onChange={(e) => {
          setFile(e.target.files?.[0] || null);
          setError(null);
        }}
        className="block w-full text-sm text-gray-500 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      
      {error && (
        <div className="text-red-500 text-sm mt-2">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <button 
          onClick={handleUpload}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          disabled={!file || loading}
        >
          {loading ? 'Uploading...' : 'Upload CSV'} 
        </button>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <h3 className="font-semibold mb-2">Expected CSV Format:</h3>
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
