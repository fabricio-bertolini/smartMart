import React from 'react';

export const CsvUpload = () => {
  const [file, setFile] = React.useState<File | null>(null);

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    await fetch('http://localhost:8000/products/upload-csv', {
      method: 'POST',
      body: formData,
    });
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
        disabled={!file}
      >
        Upload CSV
      </button>
    </div>
  );
};
