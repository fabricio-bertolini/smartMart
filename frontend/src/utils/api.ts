type ApiResponse<T> = {
  data?: T;
  error?: string;
  loading: boolean;
};

export const fetchWithError = async <T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { data, loading: false };
  } catch (error) {
    console.error('API Error:', error);
    return {
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      loading: false
    };
  }
};
