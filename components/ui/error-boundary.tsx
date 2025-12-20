/**
 * Error Boundary Component
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('React Error Boundary caught error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  onReset?: () => void;
}

export function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-gray-800 bg-[#0A0A0A] p-8 text-center">
      <div className="mb-4 rounded-full bg-red-500/10 p-3">
        <AlertTriangle className="h-8 w-8 text-red-400" />
      </div>
      
      <h2 className="mb-2 text-xl font-semibold text-white">
        Something went wrong
      </h2>
      
      <p className="mb-6 max-w-md text-gray-400">
        We're sorry, but something unexpected happened. Please try refreshing 
        the page or contact support if the problem persists.
      </p>

      {process.env.NODE_ENV === 'development' && error && (
        <pre className="mb-6 max-w-full overflow-auto rounded-lg bg-gray-900 p-4 text-left text-sm text-red-300">
          {error.message}
        </pre>
      )}

      <div className="flex gap-4">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
        
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}

export function PageErrorFallback({ 
  error, 
  reset 
}: { 
  error: Error & { digest?: string }; 
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black p-8">
      <div className="mb-6 rounded-full bg-red-500/10 p-4">
        <AlertTriangle className="h-12 w-12 text-red-400" />
      </div>
      
      <h1 className="mb-2 text-2xl font-bold text-white">
        Page Error
      </h1>
      
      <p className="mb-8 max-w-md text-center text-gray-400">
        This page encountered an error. Our team has been notified 
        and is working on a fix.
      </p>

      {error.digest && (
        <p className="mb-4 text-sm text-gray-500">
          Error ID: {error.digest}
        </p>
      )}

      <button
        onClick={reset}
        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
      >
        <RefreshCw className="h-4 w-4" />
        Try Again
      </button>
    </div>
  );
}
