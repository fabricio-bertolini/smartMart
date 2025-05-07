import React from 'react';

export const CsvExport = () => {
  const downloadProducts = async () => {
    const response = await fetch('/api/products/export');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    a.click();
  };

  const downloadSales = async () => {
    const response = await fetch('/api/sales/export');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sales.csv';
    a.click();
  };

  return (
    <div className="flex gap-4">
      <button 
        onClick={downloadProducts}
        className="p-2 bg-green-500 text-white rounded"
      >
        Export Products
      </button>
      <button 
        onClick={downloadSales}
        className="p-2 bg-green-500 text-white rounded"
      >
        Export Sales
      </button>
    </div>
  );
};
