import React from 'react';
import { Dashboard } from '../components/Dashboard';
import { ProductList } from '../components/ProductList'; 
import { CsvUpload } from '../components/CsvUpload';
import { SalesEditor } from '../components/SalesEditor';
import { ProductManualEntry } from '../components/ProductManualEntry';

export default function Home() {
  const [currentView, setCurrentView] = React.useState('dashboard');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              <button 
                onClick={() => setCurrentView('dashboard')} 
                className={`px-3 py-2 ${currentView === 'dashboard' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-300 dark:border-blue-300' : 'text-gray-500 dark:text-gray-300'}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setCurrentView('products')} 
                className={`px-3 py-2 ${currentView === 'products' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-300 dark:border-blue-300' : 'text-gray-500 dark:text-gray-300'}`}
              >
                Products
              </button>
              <button 
                onClick={() => setCurrentView('upload')} 
                className={`px-3 py-2 ${currentView === 'upload' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-300 dark:border-blue-300' : 'text-gray-500 dark:text-gray-300'}`}
              >
                Import CSV
              </button>
              <button 
                onClick={() => setCurrentView('sales')} 
                className={`px-3 py-2 ${currentView === 'sales' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-300 dark:border-blue-300' : 'text-gray-500 dark:text-gray-300'}`}
              >
                Sales
              </button>
              <button 
                onClick={() => setCurrentView('manual')} 
                className={`px-3 py-2 ${currentView === 'manual' ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-300 dark:border-blue-300' : 'text-gray-500 dark:text-gray-300'}`}
              >
                Add Product
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'products' && <ProductList />}
        {currentView === 'upload' && <CsvUpload />}
        {currentView === 'sales' && <SalesEditor />}
        {currentView === 'manual' && <ProductManualEntry />}
      </main>
    </div>
  );
}
