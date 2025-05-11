/**
 * API Service Module
 * 
 * Centralizes all API calls for the SmartMart application.
 * Provides typed functions for interacting with the backend services.
 */

/**
 * Product Interface
 * 
 * Defines the shape of product data returned from the API
 */
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  brand: string;
  status: 'active' | 'out_of_stock' | 'discontinued';
}

/**
 * Category Interface
 * 
 * Defines the shape of category data returned from the API
 */
export interface Category {
  id: number;
  name: string;
}

/**
 * Sale Interface
 * 
 * Defines the shape of sales data returned from the API
 */
export interface Sale {
  id: number;
  product_id: number;
  quantity: number;
  total_price: number;
  date: string;
}

/**
 * Interface for Sales Statistics
 */
interface SalesStats {
  total_price: number;
  quantity: number;
}

/**
 * Interface for API Response
 */
interface ApiResponse<T> {
  data: T;
  message?: string;
  warnings?: string[];
}

// Add proper timeout and error handling to API calls

// Change this to an absolute URL to fix connection issues
const API_BASE_URL = 'http://localhost:8000';  // Make sure this matches your backend URL
const API_TIMEOUT = 8000; // Increased timeout to 8 seconds

// Helper function to check if the backend is available
async function checkBackendStatus(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, { 
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json'
      }
      // Removed invalid timeout property
    });
    return response.ok;
  } catch (error) {
    console.error('[API] Backend health check failed:', error);
    return false;
  }
}

// Enhanced fetch with connection validation and retry logic
async function fetchWithTimeout(url: string, options: any = {}) {
  const controller = new AbortController();
  const { signal } = controller;

  const timeout = setTimeout(() => {
    controller.abort();
  }, API_TIMEOUT);

  try {
    console.log(`[API] Requesting: ${url}`);
    const response = await fetch(url, { 
      ...options, 
      signal,
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        ...(options && options.headers ? options.headers : {})
      }
    });
    clearTimeout(timeout);

    if (!response.ok) {
      console.error(`[API] Error response:`, response.status, response.statusText);
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[API] Response from ${url}:`, data);
    return data;
  } catch (error: any) {
    clearTimeout(timeout);
    console.error(`[API] Fetch error for ${url}:`, error);

    if (error.name === 'AbortError') {
      throw new Error('Request timeout - Backend server may not be running or database connection issue');
    }
    throw error;
  }
}

/**
 * Fetch products from the API with optional category filter
 */
export const fetchProducts = async (categoryId?: string): Promise<Product[]> => {
  try {
    // Make sure we're sending numeric category ID correctly
    const categoryParam = categoryId && categoryId !== '' 
      ? `?category_id=${encodeURIComponent(categoryId)}` 
      : '';
    
    const url = `${API_BASE_URL}/products${categoryParam}`;
    console.log('[API] Fetching products with filter:', { categoryId, url });
    
    // Use direct fetch without health check to avoid double requests
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Products API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('[API] Products received:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('[API] Failed to fetch products:', error);
    return []; 
  }
};

/**
 * Fetch all categories from the API
 * 
 * @returns {Promise<Category[]>} Array of category objects from PostgreSQL
 */
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    console.log('[API] Fetching categories');
    const response = await fetch(`${API_BASE_URL}/categories`);
    
    if (!response.ok) {
      console.error(`[API] Categories API error: ${response.status} ${response.statusText}`);
      return [];
    }
    
    const data = await response.json();
    console.log('[API] Categories received:', data);
    
    // Check if the API returns data with a wrapper object
    // For FastAPI it might be just the array, or it might be { data: [...] }
    const categories = Array.isArray(data) ? data : (data.data || []);
    
    // Log categories to help with debugging
    console.log('[API] Processed categories:', categories);
    return categories;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    // Return sample categories matching your PostgreSQL data as fallback
    return [
      { id: 1, name: 'TVs' },
      { id: 2, name: 'Refrigerators' },
      { id: 3, name: 'Laptops' },
      { id: 4, name: 'Microwaves' },
      { id: 5, name: 'Smartphones' }
    ];
  }
};

/**
 * Fetches sales statistics with year and category filters
 */
export const fetchSalesStats = async (year: number, category_id: string = '') => {
  try {
    const url = `${API_BASE_URL}/sales/stats?year=${year}${category_id ? `&category_id=${category_id}` : ''}`;
    console.log('Fetching sales stats:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Sales stats response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching sales stats:', error);
    throw error;
  }
};

/**
 * Fetch all sales data from the API
 * 
 * @returns {Promise<Sale[]>} Array of sale objects
 * @throws Will throw an error if the API request fails
 */
export const fetchSales = async (): Promise<Sale[]> => {
  try {
    const response = await fetch('/api/sales');
    if (!response.ok) {
      throw new Error('Failed to fetch sales data');
    }
    const result = await response.json();
    if (Array.isArray(result)) return result;
    return result.data || [];
  } catch (error) {
    console.error('Error fetching sales data:', error);
    throw error;
  }
};

/**
 * Create a new product via the API
 * 
 * @param {Omit<Product, 'id'>} productData - Product data without ID (generated by backend)
 * @returns {Promise<Product>} The created product with assigned ID
 * @throws Will throw an error if the API request fails
 */
export const createProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
  try {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create product');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

/**
 * Update an existing product via the API
 * 
 * @param {number} id - ID of the product to update
 * @param {Partial<Product>} productData - Partial product data to update
 * @returns {Promise<Product>} The updated product
 * @throws Will throw an error if the API request fails
 */
export const updateProduct = async (id: number, productData: Partial<Product>): Promise<Product> => {
  try {
    const response = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update product');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

/**
 * Delete a product via the API
 * 
 * @param {number} id - ID of the product to delete
 * @returns {Promise<void>}
 * @throws Will throw an error if the API request fails
 */
export const deleteProduct = async (id: number): Promise<void> => {
  try {
    const response = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete product');
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

/**
 * Create a new category via the API
 * 
 * @param {Omit<Category, 'id'>} categoryData - Category data without ID
 * @returns {Promise<Category>} The created category with assigned ID
 * @throws Will throw an error if the API request fails
 */
export const createCategory = async (categoryData: Omit<Category, 'id'>): Promise<Category> => {
  try {
    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create category');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

/**
 * Uploads a CSV file for data import
 * @param file - The CSV file to upload
 * @param type - The type of data being uploaded (products/categories/sales)
 * @returns Promise containing upload result
 * @throws Error if the upload fails
 */
export const uploadCsv = async (
  file: File, 
  type: string
): Promise<ApiResponse<any>> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  const response = await fetch('/api/import/csv', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to upload CSV');
  }

  return await response.json();
};

/**
 * Fetch available sales years from the API
 */
export const fetchSalesYears = async (): Promise<number[]> => {
  try {
    // REMOVE HARDCODED CURRENT YEAR - Use actual API call
    const response = await fetch(`${API_BASE_URL}/sales/years`);
    if (!response.ok) {
      console.error(`[API] Sales years API error: ${response.status} ${response.statusText}`);
      return [new Date().getFullYear()];
    }
    
    const data = await response.json();
    console.log('[API] Sales years response:', data);
    
    return Array.isArray(data) && data.length > 0 ? data : [new Date().getFullYear()];
  } catch (error) {
    console.error('[API] Failed to fetch sales years:', error);
    return [new Date().getFullYear()];
  }
};
