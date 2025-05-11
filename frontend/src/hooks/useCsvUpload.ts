import { useState } from 'react';
import { uploadCsv } from '../services/apiService';

/**
 * Custom Hook: useCsvUpload
 * 
 * Manages the state and logic for uploading CSV files in the application.
 * Handles loading states, success messages, and error handling.
 * 
 * Features:
 * - Managed upload state for UI feedback
 * - Error handling with descriptive messages
 * - Success state management
 * - Supports multiple data types (products, categories, sales)
 * 
 * @returns Object containing:
 *   - handleUpload: Function to handle file upload with type
 *   - loading: Boolean indicating if upload is in progress
 *   - error: Error message if upload failed
 *   - success: Success message if upload completed
 *   - setError: Function to manually set error state
 *   - setSuccess: Function to manually set success state
 * 
 * @example
 * const { handleUpload, loading, error, success } = useCsvUpload();
 * 
 * const onSubmit = async () => {
 *   if (!csvFile) return;
 *   await handleUpload(csvFile, 'products');
 * };
 */
export const useCsvUpload = () => {
  // State management for upload process
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /**
   * Handle CSV file upload
   * 
   * @param file - The CSV file to upload
   * @param type - The type of data in the CSV (products, categories, sales)
   * @returns Promise that resolves when the upload is complete
   */
  const handleUpload = async (file: File, type: string) => {
    // Reset states
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Validate file type
      if (!file.name.endsWith('.csv')) {
        throw new Error('Please select a CSV file.');
      }

      // Upload the file
      const response = await uploadCsv(file, type);
      
      // Build success message
      let successMessage = 'Data uploaded successfully.';
      
      // Add details if available in response
      if (response.message) {
        successMessage = response.message;
      }
      
      // Add warnings if any
      if (response.warnings && response.warnings.length) {
        successMessage += '\n\nWarnings:\n';
        successMessage += response.warnings.join('\n');
      }
      
      setSuccess(successMessage);
    } catch (err: any) {
      // Set error message from error response or use default message
      setError(err.message || 'Failed to upload file.');
      console.error('CSV upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Return upload handling function and upload states
   */
  return {
    handleUpload,
    loading,
    error,
    success,
    setError,
    setSuccess
  };
};
