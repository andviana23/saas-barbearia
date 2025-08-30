'use client';

import { Box, Typography, Button, Stack, Card, CardContent } from '@mui/material';
import { Lock, Home, ArrowBack } from '@mui/icons-material';
import { ReactNode } from 'react';

interface ForbiddenViewProps {
  title?: string;
  message?: string;
  onHome?: () => void;
  onBack?: () => void;
  children?: ReactNode;
  variant?: 'page' | 'card' | 'inline';
  showActions?: boolean;
}

export default function ForbiddenView({
  title = 'Acesso Negado',
  message = 'Você não tem permissão para acessar esta página ou realizar esta ação.',
  onHome,
  onBack,
  children,
  variant = 'page',
  showActions = true,
}: ForbiddenViewProps) {
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
          borderColor: 'warning.light',
          borderRadius: 2,
          bgcolor: 'warning.50',
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

  const content = (
    <Box sx={getContainerProps()}>
      <Lock
        sx={{
          fontSize: variant === 'inline' ? 48 : 80,
          color: 'warning.main',
        }}
      />

      <Stack spacing={1} alignItems="center">
        <Typography variant={variant === 'inline' ? 'h6' : 'h3'} component="h1" gutterBottom>
          {title}
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
          {message}
        </Typography>
      </Stack>

      {showActions && (onHome || onBack) && (
        <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center">
          {onBack && (
            <Button variant="outlined" startIcon={<ArrowBack />} onClick={onBack}>
              Voltar
            </Button>
          )}

          {onHome && (
            <Button variant="contained" startIcon={<Home />} onClick={onHome}>
              Ir para início
            </Button>
          )}
        </Stack>
      )}

      {children && <Box sx={{ mt: 2, width: '100%', maxWidth: 600 }}>{children}</Box>}
    </Box>
  );

  if (variant === 'card') {
    return (
      <Card sx={{ maxWidth: 600, mx: 'auto' }}>
        <CardContent>{content}</CardContent>
      </Card>
    );
  }

  return content;
}
