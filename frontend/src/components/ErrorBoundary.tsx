import React from 'react';

interface Props {
  children: React.ReactNode;
  maxRetries?: number;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  fallbackUI?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

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

  static getDerivedStateFromError(error: Error): Pick<State, 'hasError' | 'error'> {
    if (!(error instanceof Error)) {
      error = new Error(String(error));
    }
    return { hasError: true, error };
  }

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

  private logError(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });
  }

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
      
      if (fallbackUI) {
        return fallbackUI;
      }

      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded shadow-sm" role="alert">
          <h2 className="text-red-600 font-bold mb-2">Something went wrong</h2>
          <p className="text-red-500 mb-4">{this.state.error?.message}</p>
          {this.state.errorInfo && (
            <pre className="text-sm text-red-400 bg-red-50 p-2 rounded mb-4">
              {this.state.errorInfo.componentStack}
            </pre>
          )}
          {this.state.retryCount < maxRetries && (
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
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
