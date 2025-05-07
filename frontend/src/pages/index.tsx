import React from 'react';
import { Dashboard } from '../components/Dashboard';
import { ProductForm } from '../components/ProductForm';
import { CsvUpload } from '../components/CsvUpload';
import { SalesEditor } from '../components/SalesEditor';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { CsvExport } from '../components/CsvExport';

export default function Home() {
  const [currentView, setCurrentView] = React.useState('dashboard');
  const [darkMode, setDarkMode] = React.useState(false);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              <button onClick={() => setCurrentView('dashboard')} className="px-3 py-2">Dashboard</button>
              <button onClick={() => setCurrentView('products')} className="px-3 py-2">Products</button>
              <button onClick={() => setCurrentView('upload')} className="px-3 py-2">Import CSV</button>
              <button onClick={() => setCurrentView('sales')} className="px-3 py-2">Edit Sales</button>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full"
            >
              {darkMode ? '🌞' : '🌙'}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <ErrorBoundary>
          {currentView === 'dashboard' && (
            <>
              <Dashboard />
              <div className="mt-8">
                <CsvExport />
              </div>
            </>
          )}
          {currentView === 'products' && <ProductForm />}
          {currentView === 'upload' && <CsvUpload />}
          {currentView === 'sales' && <SalesEditor />}
        </ErrorBoundary>
      </main>
    </div>
  );
}
