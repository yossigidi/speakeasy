import React from 'react';

export default class PageErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { console.error('Page error:', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <h2 style={{ fontSize: 20, marginBottom: 12 }}>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false })} style={{ padding: '8px 20px', borderRadius: 8, background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer' }}>
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
