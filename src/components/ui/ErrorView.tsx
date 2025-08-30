'use client';

import { Box, Typography, Button, Stack, Alert } from '@mui/material';
import { ErrorOutline, Refresh, Home } from '@mui/icons-material';
import { ReactNode } from 'react';

interface ErrorViewProps {
  title?: string;
  message?: string;
  error?: Error | string;
  onRetry?: () => void;
  onHome?: () => void;
  children?: ReactNode;
  variant?: 'page' | 'card' | 'inline';
  severity?: 'error' | 'warning';
}

export default function ErrorView({
  title = 'Ops! Algo deu errado',
  message = 'Ocorreu um erro inesperado. Tente novamente ou entre em contato com o suporte.',
  error,
  onRetry,
  onHome,
  children,
  variant = 'page',
  severity = 'error',
}: ErrorViewProps) {
  const getContainerProps = () => {
    const baseProps = {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      textAlign: 'center' as const,
      gap: 3,
    };

    switch (variant) {
      case 'card':
        return {
          ...baseProps,
          p: 4,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: 'background.paper',
        };
      case 'inline':
        return {
          ...baseProps,
          p: 2,
        };
      default: // page
        return {
          ...baseProps,
          minHeight: '60vh',
          justifyContent: 'center',
          p: 4,
        };
    }
  };

  const getErrorDetails = () => {
    if (!error) return null;

    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'object' ? error.stack : undefined;

    return (
      <Alert severity={severity} sx={{ width: '100%', maxWidth: 600, textAlign: 'left' }}>
        <Typography
          variant="body2"
          component="pre"
          sx={{
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
          }}
        >
          {errorMessage}
          {process.env.NODE_ENV === 'development' && errorStack && (
            <>
              {'\n\n'}
              {errorStack}
            </>
          )}
        </Typography>
      </Alert>
    );
  };

  return (
    <Box sx={getContainerProps()}>
      <ErrorOutline
        sx={{
          fontSize: variant === 'inline' ? 48 : 64,
          color: severity === 'error' ? 'error.main' : 'warning.main',
        }}
      />

      <Stack spacing={1} alignItems="center">
        <Typography variant={variant === 'inline' ? 'h6' : 'h4'} component="h1" gutterBottom>
          {title}
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
          {message}
        </Typography>
      </Stack>

      {(onRetry || onHome) && (
        <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center">
          {onRetry && (
            <Button variant="contained" startIcon={<Refresh />} onClick={onRetry}>
              Tentar novamente
            </Button>
          )}

          {onHome && (
            <Button variant="outlined" startIcon={<Home />} onClick={onHome}>
              Ir para início
            </Button>
          )}
        </Stack>
      )}

      {children}

      {error && getErrorDetails()}
    </Box>
  );
}
