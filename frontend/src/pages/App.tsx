import React from 'react';
import { Dashboard } from '../components/Dashboard';
import { ProductForm } from '../components/ProductForm';
import { CsvUpload } from '../components/CsvUpload';
import { SalesEditor } from '../components/SalesEditor';

export const App = () => {
  const [currentView, setCurrentView] = React.useState('dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              <button onClick={() => setCurrentView('dashboard')} className="px-3 py-2">Dashboard</button>
              <button onClick={() => setCurrentView('products')} className="px-3 py-2">Products</button>
              <button onClick={() => setCurrentView('upload')} className="px-3 py-2">Import CSV</button>
              <button onClick={() => setCurrentView('sales')} className="px-3 py-2">Edit Sales</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'products' && <ProductForm />}
        {currentView === 'upload' && <CsvUpload />}
        {currentView === 'sales' && <SalesEditor />}
      </main>
    </div>
  );
};
