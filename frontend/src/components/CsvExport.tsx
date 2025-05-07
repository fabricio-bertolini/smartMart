import React from 'react';
import { Button } from '@/components/ui';

export const CsvExport = () => {
  const downloadCsv = async (type: 'products' | 'sales') => {
    const response = await fetch(`http://localhost:8000/${type}/export-csv`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-4">
      <Button onClick={() => downloadCsv('products')}>
        Export Products
      </Button>
      <Button onClick={() => downloadCsv('sales')}>
        Export Sales
      </Button>
    </div>
  );
};
