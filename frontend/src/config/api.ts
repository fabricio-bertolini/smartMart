/**
 * SmartMart API Configuration
 * 
 * This file defines the base API endpoints and helper functions for the SmartMart application.
 * It centralizes API configuration to make endpoint management consistent across the application.
 */

/**
 * Base URL for the SmartMart API
 * In production, this should be configured based on environment variables
 */
export const API_BASE_URL = 'http://localhost:8000';

/**
 * API Endpoint Definitions
 * 
 * Centralized endpoint configuration for different resources
 * Using a constant object helps maintain consistency and makes
 * endpoint changes easier to manage across the application
 */
export const endpoints = {
    // Products API endpoints
    products: `${API_BASE_URL}/products`,
    
    // Categories API endpoints
    categories: `${API_BASE_URL}/categories`,
    
    // Sales API endpoints
    sales: `${API_BASE_URL}/sales`,
};

/**
 * Standard API error handler
 * 
 * Provides consistent error handling across API calls
 * Logs errors to console and re-throws for component-level handling
 * 
 * @param error - Any error object from API calls
 * @throws The original error after logging
 */
export const handleApiError = (error: any) => {
    console.error('API Error:', error);
    throw error;
};
