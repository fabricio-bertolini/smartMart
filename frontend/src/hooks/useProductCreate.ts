import { useState } from 'react';
import { createProduct } from '../services/apiService';

export function useProductCreate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (product: any, onSuccess?: () => void) => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await createProduct(product);
      setMessage('Product created successfully!');
      if (onSuccess) onSuccess();
    } catch (e) {
      setError('Error creating product');
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, error, message, setMessage };
}
