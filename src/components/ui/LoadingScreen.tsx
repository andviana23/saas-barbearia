'use client';

import { Box, CircularProgress, Typography, Stack } from '@mui/material';
import { ReactNode } from 'react';

interface LoadingScreenProps {
  message?: string;
  children?: ReactNode;
  size?: 'small' | 'medium' | 'large';
  variant?: 'page' | 'overlay' | 'inline';
}

export default function LoadingScreen({
  message = 'Carregando...',
  children,
  size = 'medium',
  variant = 'page',
}: LoadingScreenProps) {
  const getSizeProps = () => {
    switch (size) {
      case 'small':
        return { size: 24, fontSize: '0.875rem' };
      case 'large':
        return { size: 64, fontSize: '1.25rem' };
      default:
        return { size: 40, fontSize: '1rem' };
    }
  };

  const { size: circularSize, fontSize } = getSizeProps();

  const getContainerProps = () => {
    const baseProps = {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
    };

    switch (variant) {
      case 'overlay':
        return {
          ...baseProps,
          position: 'fixed' as const,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          zIndex: 9999,
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
          p: 4,
        };
    }
  };

  return (
    <Box sx={getContainerProps()}>
      <CircularProgress size={circularSize} />
      <Stack alignItems="center" spacing={1}>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize }}>
          {message}
        </Typography>
        {children}
      </Stack>
    </Box>
  );
}
