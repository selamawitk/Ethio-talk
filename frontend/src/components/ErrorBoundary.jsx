import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 bg-slate-950 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
            <p className="text-gray-400 mb-6">አንድ ስህተት ተከስቷል</p>
            <pre className="text-xs text-red-400 mb-4 max-w-md overflow-auto text-left bg-slate-900 p-3 rounded-lg">
              {this.state.error?.message}
              {'\n'}
              {this.state.error?.stack?.split('\n').slice(0, 3).join('\n')}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl text-white font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all"
            >
              Reload Page / ገፁን እንደገና ክፈቱ
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
