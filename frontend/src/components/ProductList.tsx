import React from 'react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  brand: string;
  status: 'active' | 'out_of_stock' | 'discontinued';
}

export const ProductList = () => {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = React.useState<number | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const productsPerPage = 9;

  React.useEffect(() => {
    Promise.all([
      fetch('/api/products').then(res => res.json()),
      fetch('/api/categories').then(res => res.json())
    ]).then(([productsData, categoriesData]) => {
      setProducts(productsData.data || []);      // <-- Fix: use .data
      setCategories(categoriesData.data || []);   // <-- Fix: use .data
    });
  }, []);

  const filteredProducts = products
    .filter(p => selectedCategory ? p.category_id === selectedCategory : true)
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border rounded flex-1"
        />
        <select 
          onChange={(e) => setSelectedCategory(Number(e.target.value))}
          className="p-2 border rounded"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedProducts.map(product => (
          <div key={product.id} className="p-4 border rounded shadow">
            <h3 className="font-bold">{product.name}</h3>
            <p className="text-gray-600">{product.description}</p>
            <p className="text-blue-600">${product.price}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: Math.ceil(filteredProducts.length / productsPerPage) }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 border rounded ${
              currentPage === i + 1 ? 'bg-blue-500 text-white' : ''
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};
