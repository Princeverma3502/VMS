import React from 'react';

/**
 * ErrorBoundary catches React component errors and displays a user-friendly message
 * instead of a blank page. This helps diagnose issues in production.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🔴 ErrorBoundary caught an error:', error);
    console.error('Error Info:', errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md border-l-4 border-red-500">
            <div className="text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
              <p className="text-gray-600 mb-6">
                The application encountered an error. Please try refreshing the page.
              </p>

              {/* Error details (only in dev) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 p-4 bg-red-50 rounded-lg text-left">
                  <p className="text-xs font-mono text-red-600 break-words">
                    <strong>Error:</strong> {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo?.componentStack && (
                    <p className="text-xs font-mono text-red-600 mt-2 break-words max-h-32 overflow-auto">
                      <strong>Stack:</strong>
                      <pre className="mt-1">{this.state.errorInfo.componentStack}</pre>
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => window.location.href = '/login'}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
                >
                  Go to Login
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-6 py-2 rounded-lg font-medium transition"
                >
                  Refresh
                </button>
              </div>

              {/* Debugging info */}
              <p className="text-xs text-gray-400 mt-6">
                If this persists, please contact support with the error details.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
