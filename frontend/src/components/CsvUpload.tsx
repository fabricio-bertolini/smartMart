import React from 'react';

export const CsvUpload = () => {
  const [file, setFile] = React.useState<File | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/products/upload-csv', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
      setFile(null);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="block w-full text-sm text-gray-500 file:py-2 file:px-4"
      />
      <button 
        onClick={handleUpload}
        className="px-4 py-2 bg-blue-500 text-white rounded"
        disabled={!file || loading}
      >
        {loading ? 'Uploading...' : 'Upload CSV'}
      </button>
    </div>
  );
};
