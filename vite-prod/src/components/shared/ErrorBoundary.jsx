import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-brand-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
            <div className="text-5xl mb-4">😕</div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              {this.props.title || 'Something went wrong'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
              {this.props.description || 'An unexpected error occurred.'}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 px-6 bg-brand-500 text-white rounded-xl font-semibold hover:bg-brand-600 transition-colors"
              >
                Refresh
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="w-full py-3 px-6 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
