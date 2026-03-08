import React from 'react';

export default class PageErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { console.error('Page error:', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>😅</div>
          <h2 style={{ fontSize: 20, marginBottom: 8, fontWeight: 700 }}>Something went wrong</h2>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>משהו השתבש, נסו שוב</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              onClick={() => this.setState({ hasError: false })}
              style={{ padding: '10px 24px', borderRadius: 12, background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              Try Again
            </button>
            <button
              onClick={() => window.history.back()}
              style={{ padding: '10px 24px', borderRadius: 12, background: '#e5e7eb', color: '#374151', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              ← Back
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
