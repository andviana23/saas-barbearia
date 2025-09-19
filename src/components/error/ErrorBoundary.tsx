'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Button, Typography, Alert, Stack, Paper } from '@mui/material';
import { Refresh, Home, BugReport } from '@mui/icons-material';
import * as Sentry from '@sentry/nextjs';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  level?: 'page' | 'component' | 'critical';
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = this.generateErrorId();

    this.setState({
      errorInfo,
      errorId,
    });

    // Log para console em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }

    // Enviar para Sentry com contexto adicional
    Sentry.withScope((scope) => {
      scope.setTag('errorBoundary', true);
      scope.setTag('level', this.props.level || 'component');
      scope.setContext('errorInfo', {
        componentStack: errorInfo.componentStack,
        errorBoundary: this.constructor.name,
        retryCount: this.retryCount,
        errorId,
      });

      // Adicionar breadcrumb
      Sentry.addBreadcrumb({
        message: 'Error Boundary triggered',
        level: 'error',
        data: {
          errorId,
          level: this.props.level,
        },
      });

      Sentry.captureException(error);
    });

    // Callback personalizado
    this.props.onError?.(error, errorInfo);
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
      });
    } else {
      // Após máximo de tentativas, recarregar página
      window.location.reload();
    }
  };

  private handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  private handleReportBug = () => {
    const { error, errorId } = this.state;
    const subject = `Bug Report - ${errorId}`;
    const body = `
Error ID: ${errorId}
Error: ${error?.message}
Stack: ${error?.stack}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
Timestamp: ${new Date().toISOString()}
    `.trim();

    const mailtoUrl = `mailto:suporte@saas-barbearia.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
  };

  render() {
    if (this.state.hasError) {
      // Fallback customizado
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorId } = this.state;
      const { level = 'component', showDetails = false } = this.props;

      return (
        <Box
          data-testid="error-boundary-fallback"
          sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: level === 'page' ? '50vh' : '200px',
            textAlign: 'center',
          }}
        >
          <Paper
            elevation={2}
            sx={{
              p: 4,
              maxWidth: 600,
              width: '100%',
            }}
          >
            <Stack spacing={3} alignItems="center">
              <BugReport color="error" sx={{ fontSize: 48 }} />

              <Typography variant="h5" color="error" gutterBottom>
                Ops! Algo deu errado
              </Typography>

              <Typography variant="body1" color="text.secondary">
                {level === 'critical'
                  ? 'Um erro crítico ocorreu. Nossa equipe foi notificada automaticamente.'
                  : 'Encontramos um problema inesperado. Você pode tentar novamente ou voltar à página inicial.'}
              </Typography>

              {errorId && (
                <Alert severity="info" sx={{ width: '100%' }}>
                  <Typography variant="caption">
                    ID do Erro: <code>{errorId}</code>
                  </Typography>
                </Alert>
              )}

              {showDetails && error && (
                <Alert severity="error" sx={{ width: '100%', textAlign: 'left' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Detalhes técnicos:
                  </Typography>
                  <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                    {error.message}
                  </Typography>
                </Alert>
              )}

              <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center">
                {this.retryCount < this.maxRetries ? (
                  <Button
                    variant="contained"
                    startIcon={<Refresh />}
                    onClick={this.handleRetry}
                    data-testid="retry-button"
                  >
                    Tentar Novamente ({this.maxRetries - this.retryCount} restantes)
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    startIcon={<Refresh />}
                    onClick={() => window.location.reload()}
                    data-testid="reload-button"
                  >
                    Recarregar Página
                  </Button>
                )}

                <Button
                  variant="outlined"
                  startIcon={<Home />}
                  onClick={this.handleGoHome}
                  data-testid="go-home-button"
                >
                  Ir para Início
                </Button>

                <Button
                  variant="text"
                  startIcon={<BugReport />}
                  onClick={this.handleReportBug}
                  size="small"
                  data-testid="report-bug-button"
                >
                  Reportar Bug
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Hook para usar Error Boundary programaticamente
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    // Simular erro para trigger do Error Boundary
    throw error;
  };
}

// HOC para envolver componentes automaticamente
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>,
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// Error Boundary específico para páginas críticas
export function CriticalErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      level="critical"
      showDetails={process.env.NODE_ENV === 'development'}
      onError={(error, errorInfo) => {
        // Log adicional para erros críticos
        console.error('🔥 CRITICAL ERROR:', error);

        // Notificar serviços externos se necessário
        if (process.env.NODE_ENV === 'production') {
          // Aqui poderia enviar para serviços de monitoramento
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

// Error Boundary para componentes de formulário
export function FormErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      level="component"
      fallback={
        <Alert severity="error" sx={{ m: 2 }}>
          <Typography variant="subtitle2">Erro no formulário</Typography>
          <Typography variant="body2">
            Não foi possível carregar este formulário. Tente recarregar a página.
          </Typography>
        </Alert>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
