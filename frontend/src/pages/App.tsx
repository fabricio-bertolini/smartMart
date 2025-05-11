import React from 'react';
import { Dashboard } from '../components/Dashboard';
import { ProductForm } from '../components/ProductForm';
import { CsvUpload } from '../components/CsvUpload';
import { SalesEditor } from '../components/SalesEditor';
import { DarkModeToggle } from '../components/DarkModeToggle';
import { DarkModeProvider } from '../context/DarkModeContext';

export const App = () => {
  const [currentView, setCurrentView] = React.useState('dashboard');

  return (
    <DarkModeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <nav className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button onClick={() => setCurrentView('dashboard')} className="px-3 py-2 text-gray-800 dark:text-gray-100">Dashboard</button>
                <button onClick={() => setCurrentView('products')} className="px-3 py-2 text-gray-800 dark:text-gray-100">Products</button>
                <button onClick={() => setCurrentView('upload')} className="px-3 py-2 text-gray-800 dark:text-gray-100">Import CSV</button>
                <button onClick={() => setCurrentView('sales')} className="px-3 py-2 text-gray-800 dark:text-gray-100">Edit Sales</button>
              </div>
            </div>
          </div>
        </nav>
        
        <main className="max-w-7xl mx-auto py-6 px-4">
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'products' && <ProductForm />}
          {currentView === 'upload' && <CsvUpload />}
          {currentView === 'sales' && <SalesEditor />}
        </main>

        <DarkModeToggle />
      </div>
    </DarkModeProvider>
  );
};
