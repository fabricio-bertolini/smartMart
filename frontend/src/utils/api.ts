/**
 * API Response Type Definition
 * 
 * Generic type for handling API responses with consistent structure.
 * @template T - The type of data expected in the response
 * @property data - The successful response data (optional)
 * @property error - Error message if request failed (optional)
 * @property loading - Indicates if request is in progress
 */
type ApiResponse<T> = {
  data?: T;
  error?: string;
  loading: boolean;
};

/**
 * Enhanced Fetch Function with Error Handling
 * 
 * Wrapper around the native fetch API that provides:
 * - Consistent error handling
 * - Automatic JSON parsing
 * - Default headers for JSON requests
 * - Typed responses
 * 
 * @template T - The type of data expected in the response
 * @param url - The URL to fetch from
 * @param options - Standard fetch options (optional)
 * @returns Promise with structured response containing data, error status, and loading state
 * @example
 * // Get products with type safety
 * const { data, error, loading } = await fetchWithError<Product[]>('/api/products');
 */
export const fetchWithError = async <T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> => {
  try {
    // Make the API request with JSON headers
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    // Handle non-2xx responses as errors
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse and return the successful response
    const data = await response.json();
    return { data, loading: false };
  } catch (error) {
    // Log and structure errors in a consistent format
    console.error('API Error:', error);
    return {
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      loading: false
    };
  }
};
