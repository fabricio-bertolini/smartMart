export const API_BASE_URL = 'http://localhost:8000';

export const endpoints = {
    products: `${API_BASE_URL}/products`,
    categories: `${API_BASE_URL}/categories`,
    sales: `${API_BASE_URL}/sales`,
};

export const handleApiError = (error: any) => {
    console.error('API Error:', error);
    throw error;
};
