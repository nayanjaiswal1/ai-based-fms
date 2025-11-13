import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  level?: 'app' | 'page' | 'component';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Store error info in state
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // TODO: Send to error reporting service (e.g., Sentry)
    // errorReportingService.logError(error, errorInfo);
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo } = this.state;
      const { showDetails = process.env.NODE_ENV === 'development', level = 'component' } = this.props;

      // Different UI based on error level
      if (level === 'app') {
        return (
          <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="w-full max-w-md space-y-6 rounded-lg border border-destructive/20 bg-card p-8 shadow-lg">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 rounded-full bg-destructive/10 p-3">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                  Application Error
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Something went wrong. The application encountered an unexpected error.
                </p>
              </div>

              {showDetails && error && (
                <div className="rounded-md bg-destructive/5 p-4">
                  <p className="text-xs font-mono text-destructive">
                    {error.toString()}
                  </p>
                  {errorInfo && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs font-semibold text-muted-foreground">
                        Stack trace
                      </summary>
                      <pre className="mt-2 max-h-40 overflow-auto text-xs text-muted-foreground">
                        {errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Button onClick={this.handleReset} className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="w-full"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </div>
        );
      }

      if (level === 'page') {
        return (
          <div className="flex min-h-[400px] items-center justify-center p-8">
            <div className="w-full max-w-lg space-y-4 rounded-lg border border-destructive/20 bg-card p-6 shadow">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-destructive/10 p-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    Page Error
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    This page encountered an error and cannot be displayed.
                  </p>
                </div>
              </div>

              {showDetails && error && (
                <div className="rounded-md bg-destructive/5 p-3">
                  <p className="text-xs font-mono text-destructive">
                    {error.toString()}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={this.handleReset} size="sm">
                  <RefreshCw className="mr-2 h-3 w-3" />
                  Retry
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  size="sm"
                >
                  <Home className="mr-2 h-3 w-3" />
                  Dashboard
                </Button>
              </div>
            </div>
          </div>
        );
      }

      // Component-level error (default)
      return (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div className="flex-1">
              <h4 className="font-medium text-destructive">Component Error</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                This component failed to render.
              </p>
              {showDetails && error && (
                <p className="mt-2 text-xs font-mono text-destructive">
                  {error.message}
                </p>
              )}
              <Button
                onClick={this.handleReset}
                variant="outline"
                size="sm"
                className="mt-3"
              >
                <RefreshCw className="mr-2 h-3 w-3" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
