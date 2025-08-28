'use client';

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { Card, CardContent, Typography, Alert, AlertTitle, Box, Button } from '@mui/material';
import * as Sentry from '@sentry/nextjs';
import { Refresh, BugReport } from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  showRetry?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * DashboardErrorBoundary - Isolates dashboard component failures
 *
 * Features:
 * - Catches JavaScript errors in dashboard components
 * - Reports errors to Sentry with context
 * - Provides fallback UI for graceful degradation
 * - Allows users to retry failed operations
 */
export class DashboardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Add comprehensive error context for Sentry
    Sentry.addBreadcrumb({
      message: 'Dashboard component error boundary triggered',
      level: 'error',
      data: {
        componentStack: errorInfo.componentStack,
        errorBoundary: 'DashboardErrorBoundary',
        fallbackTitle: this.props.fallbackTitle,
      },
    });

    // Capture the error with full context
    Sentry.withScope((scope) => {
      scope.setTag('errorBoundary', 'dashboard');
      scope.setContext('errorInfo', {
        componentStack: errorInfo.componentStack,
        errorMessage: error.message,
        errorStack: error.stack,
      });
      scope.setLevel('error');

      Sentry.captureException(error);
    });

    // Update state with error details for development
    this.setState({
      error,
      errorInfo,
    });
  }

  handleRetry = () => {
    // Clear error state to retry rendering
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });

    // Add breadcrumb for retry action
    Sentry.addBreadcrumb({
      message: 'User retried after dashboard error',
      level: 'info',
    });
  };

  render() {
    if (this.state.hasError) {
      const {
        fallbackTitle = 'Erro no Dashboard',
        fallbackMessage = 'Ocorreu um erro ao carregar este componente. Tente recarregar a página.',
        showRetry = true,
      } = this.props;

      return (
        <Card>
          <CardContent>
            <Alert severity="error" sx={{ mb: 2 }}>
              <AlertTitle>{fallbackTitle}</AlertTitle>
              {fallbackMessage}
            </Alert>

            {showRetry && (
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={this.handleRetry}
                  size="small"
                >
                  Tentar Novamente
                </Button>

                <Button
                  variant="text"
                  startIcon={<BugReport />}
                  onClick={() => window.location.reload()}
                  size="small"
                  color="secondary"
                >
                  Recarregar Página
                </Button>
              </Box>
            )}

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(255, 0, 0, 0.1)', borderRadius: 1 }}>
                <Typography
                  variant="body2"
                  component="pre"
                  sx={{ fontSize: '0.75rem', whiteSpace: 'pre-wrap' }}
                >
                  <strong>Error:</strong> {this.state.error.message}
                  {'\n\n'}
                  <strong>Stack:</strong> {this.state.error.stack}
                  {this.state.errorInfo && (
                    <>
                      {'\n\n'}
                      <strong>Component Stack:</strong> {this.state.errorInfo.componentStack}
                    </>
                  )}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// HOC for easier usage
export function withDashboardErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<Props>,
) {
  const WrappedComponent: React.FC<P> = (props) => (
    <DashboardErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </DashboardErrorBoundary>
  );

  WrappedComponent.displayName = `withDashboardErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

export default DashboardErrorBoundary;
