/**
 * SOP Error Boundary Component
 * Catches and handles React errors within the SOP module
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { 
  AlertTriangle, 
  RefreshCw, 
  Bug, 
  Home,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackComponent?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isDetailsVisible: boolean;
}

export class SopErrorBoundary extends Component<Props, State> {
  private errorId: string;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isDetailsVisible: false
    };
    this.errorId = `sop-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      isDetailsVisible: false
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
      isDetailsVisible: false
    });

    // Log to console for development
    console.group('🚨 SOP Error Boundary Caught Error');
    console.error('Error ID:', this.errorId);
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you might want to report to an error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo });
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isDetailsVisible: false
    });
  };

  handleGoHome = () => {
    // Navigate to home/dashboard
    window.location.href = '/dashboard';
  };

  toggleDetails = () => {
    this.setState(prev => ({ 
      isDetailsVisible: !prev.isDetailsVisible 
    }));
  };

  formatStackTrace = (stack?: string): string => {
    if (!stack) return 'No stack trace available';
    
    return stack
      .split('\n')
      .filter(line => line.trim())
      .slice(0, 10) // Limit to first 10 lines
      .join('\n');
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback component
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }

      const { error, errorInfo, isDetailsVisible } = this.state;
      const errorName = error?.name || 'Unknown Error';
      const errorMessage = error?.message || 'An unexpected error occurred';

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <Card className="w-full max-w-2xl border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-red-700">
                <AlertTriangle className="h-6 w-6" />
                SOP Module Error
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Error Summary */}
              <Alert className="border-red-200 bg-red-50">
                <Bug className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <div className="font-medium mb-2">{errorName}</div>
                  <div className="text-sm">{errorMessage}</div>
                </AlertDescription>
              </Alert>

              {/* Error ID for Support */}
              <div className="text-sm text-gray-600">
                <strong>Error ID:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">{this.errorId}</code>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={this.handleRetry}
                  className="inline-flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="inline-flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Go to Dashboard
                </Button>

                {(this.props.showDetails || process.env.NODE_ENV === 'development') && (
                  <Button 
                    variant="ghost"
                    onClick={this.toggleDetails}
                    className="inline-flex items-center gap-2 text-sm"
                  >
                    {isDetailsVisible ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    {isDetailsVisible ? 'Hide' : 'Show'} Details
                  </Button>
                )}
              </div>

              {/* Error Details (Collapsible) */}
              {isDetailsVisible && (
                <div className="space-y-4 border-t pt-4">
                  <div>
                    <h4 className="font-medium mb-2 text-gray-900">Error Stack Trace</h4>
                    <pre className="text-xs bg-gray-100 p-3 rounded-md overflow-auto max-h-40 font-mono">
                      {this.formatStackTrace(error?.stack)}
                    </pre>
                  </div>

                  {errorInfo?.componentStack && (
                    <div>
                      <h4 className="font-medium mb-2 text-gray-900">Component Stack</h4>
                      <pre className="text-xs bg-gray-100 p-3 rounded-md overflow-auto max-h-40 font-mono">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}

                  {/* Debug Information */}
                  <div className="text-xs text-gray-600 space-y-1">
                    <div><strong>Environment:</strong> {process.env.NODE_ENV}</div>
                    <div><strong>Timestamp:</strong> {new Date().toISOString()}</div>
                    <div><strong>User Agent:</strong> {navigator.userAgent.substring(0, 100)}...</div>
                  </div>
                </div>
              )}

              {/* Help Text */}
              <div className="text-sm text-gray-600 border-t pt-4">
                <p className="mb-2">
                  If this error persists, please contact support with the Error ID above.
                </p>
                <p>
                  You can try refreshing the page or navigating back to the dashboard.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easy wrapping
export function withSopErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: Omit<Props, 'children'>
) {
  return function WithErrorBoundaryComponent(props: P) {
    return (
      <SopErrorBoundary {...options}>
        <WrappedComponent {...props} />
      </SopErrorBoundary>
    );
  };
}

// Hook for manual error reporting
export function useSopErrorHandler() {
  const reportError = React.useCallback((error: Error, context?: string) => {
    const errorId = `sop-manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.group('🚨 SOP Manual Error Report');
    console.error('Error ID:', errorId);
    console.error('Context:', context || 'Manual error report');
    console.error('Error:', error);
    console.groupEnd();

    // In production, report to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { tags: { context, errorId } });
    }

    return errorId;
  }, []);

  return { reportError };
}