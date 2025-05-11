import React from 'react';

/**
 * Props interface for ErrorBoundary component
 * @param children - Child components to be wrapped
 * @param maxRetries - Maximum number of retry attempts allowed
 * @param onError - Optional callback for error handling
 * @param fallbackUI - Optional custom error UI component
 */
interface Props {
  children: React.ReactNode;
  maxRetries?: number;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  fallbackUI?: React.ReactNode;
}

/**
 * State interface for ErrorBoundary component
 */
interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

/**
 * ErrorBoundary Component
 * 
 * A class component that catches JavaScript errors in child components
 * and displays a fallback UI. Provides retry functionality and error logging.
 * 
 * Features:
 * - Error catching and display
 * - Configurable retry mechanism
 * - Custom error logging
 * - Optional custom fallback UI
 * - Dark mode support
 * - Error details display
 */
export class ErrorBoundary extends React.Component<Props, State> {
  static defaultProps = {
    maxRetries: 3
  };

  state: State;

  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0 
    };
  }

  /**
   * Static method called during rendering to get derived state from error
   * @param error - The error that was caught
   */
  static getDerivedStateFromError(error: Error): Pick<State, 'hasError' | 'error'> {
    if (!(error instanceof Error)) {
      error = new Error(String(error));
    }
    return { hasError: true, error };
  }

  /**
   * Lifecycle method called after an error is caught
   * Handles error logging and custom error callbacks
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { onError } = this.props;
    
    try {
      this.logError(error, errorInfo);
      
      if (onError) {
        onError(error, errorInfo);
      }
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }

    this.setState({ errorInfo });
  }

  /**
   * Helper method to log errors with formatted details
   * @param error - The error object
   * @param errorInfo - React error info object
   */
  private logError(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Handles retry attempts when the user clicks the retry button
   * Resets error state if under max retries, otherwise shows max attempts message
   */
  handleRetry = () => {
    const { maxRetries = 3 } = this.props;

    if (this.state.retryCount >= maxRetries) {
      this.setState({ 
        error: new Error(`Maximum retry attempts (${maxRetries}) reached`),
        retryCount: 0 
      });
      return;
    }

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  render() {
    if (this.state.hasError) {
      const { maxRetries = 3, fallbackUI } = this.props;
      
      // Use custom fallback UI if provided
      if (fallbackUI) {
        return fallbackUI;
      }

      // Default error UI with dark mode support
      return (
        <div 
          className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded shadow-sm" 
          role="alert"
        >
          <h2 className="text-red-600 dark:text-red-400 font-bold mb-2">
            Something went wrong
          </h2>
          <p className="text-red-500 dark:text-red-300 mb-4">
            {this.state.error?.message}
          </p>
          {this.state.errorInfo && (
            <pre className="text-sm text-red-400 dark:text-red-300 bg-red-50 dark:bg-red-900/40 p-2 rounded mb-4 overflow-auto">
              {this.state.errorInfo.componentStack}
            </pre>
          )}
          {this.state.retryCount < maxRetries && (
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded hover:bg-red-700 dark:hover:bg-red-800 transition-colors"
            >
              Try Again ({maxRetries - this.state.retryCount} attempts remaining)
            </button>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
