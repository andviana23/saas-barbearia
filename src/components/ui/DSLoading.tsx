'use client';

import React from 'react';
import {
  Box,
  CircularProgress,
  LinearProgress,
  Skeleton,
  Typography,
  Card,
  CardContent,
  Stack,
} from '@mui/material';

interface DSLoadingProps {
  variant?: 'circular' | 'linear' | 'skeleton' | 'overlay';
  size?: 'small' | 'medium' | 'large';
  message?: string;
  fullScreen?: boolean;
  transparent?: boolean;
}

interface DSSkeletonProps {
  variant?: 'text' | 'rectangular' | 'circular' | 'card' | 'table' | 'list';
  lines?: number;
  height?: number | string;
  width?: number | string;
  animation?: 'pulse' | 'wave' | false;
}

export function DSLoading({
  variant = 'circular',
  size = 'medium',
  message,
  fullScreen = false,
  transparent = false,
}: DSLoadingProps) {
  const getSizeValue = () => {
    switch (size) {
      case 'small':
        return 24;
      case 'medium':
        return 40;
      case 'large':
        return 56;
      default:
        return 40;
    }
  };

  const renderLoader = () => {
    switch (variant) {
      case 'linear':
        return (
          <Box sx={{ width: '100%', mb: message ? 2 : 0 }}>
            <LinearProgress />
          </Box>
        );
      
      case 'circular':
      default:
        return (
          <CircularProgress 
            size={getSizeValue()}
            thickness={4}
            sx={{ mb: message ? 2 : 0 }}
          />
        );
    }
  };

  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        p: 3,
      }}
    >
      {renderLoader()}
      {message && (
        <Typography 
          variant="body2" 
          color="text.secondary"
          textAlign="center"
        >
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullScreen || variant === 'overlay') {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: transparent ? 'rgba(255, 255, 255, 0.8)' : 'background.default',
          zIndex: 9999,
          backdropFilter: transparent ? 'blur(2px)' : 'none',
        }}
      >
        {content}
      </Box>
    );
  }

  return content;
}

export function DSSkeleton({
  variant = 'text',
  lines = 3,
  height = 20,
  width = '100%',
  animation = 'pulse',
}: DSSkeletonProps) {
  if (variant === 'card') {
    return (
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Skeleton variant="text" width="60%" height={24} animation={animation} />
            <Skeleton variant="text" width="100%" height={16} animation={animation} />
            <Skeleton variant="text" width="80%" height={16} animation={animation} />
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Skeleton variant="rectangular" width={80} height={32} animation={animation} />
              <Skeleton variant="rectangular" width={80} height={32} animation={animation} />
            </Box>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'table') {
    return (
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2, p: 2, bgcolor: 'grey.50' }}>
          <Skeleton variant="text" width="20%" height={20} animation={animation} />
          <Skeleton variant="text" width="30%" height={20} animation={animation} />
          <Skeleton variant="text" width="25%" height={20} animation={animation} />
          <Skeleton variant="text" width="25%" height={20} animation={animation} />
        </Box>
        
        {/* Rows */}
        {Array.from({ length: lines }).map((_, index) => (
          <Box key={index} sx={{ display: 'flex', gap: 2, mb: 1, p: 2 }}>
            <Skeleton variant="text" width="20%" height={16} animation={animation} />
            <Skeleton variant="text" width="30%" height={16} animation={animation} />
            <Skeleton variant="text" width="25%" height={16} animation={animation} />
            <Skeleton variant="text" width="25%" height={16} animation={animation} />
          </Box>
        ))}
      </Box>
    );
  }

  if (variant === 'list') {
    return (
      <Stack spacing={2}>
        {Array.from({ length: lines }).map((_, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Skeleton variant="circular" width={40} height={40} animation={animation} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={16} animation={animation} />
              <Skeleton variant="text" width="40%" height={14} animation={animation} />
            </Box>
            <Skeleton variant="rectangular" width={60} height={24} animation={animation} />
          </Box>
        ))}
      </Stack>
    );
  }

  if (variant === 'text') {
    return (
      <Stack spacing={1}>
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton 
            key={index}
            variant="text" 
            width={index === lines - 1 ? '70%' : width}
            height={height}
            animation={animation}
          />
        ))}
      </Stack>
    );
  }

  return (
    <Skeleton 
      variant={variant as any}
      width={width}
      height={height}
      animation={animation}
    />
  );
}

// Componente para estados de carregamento específicos
export function DSPageLoading({ message = 'Carregando...' }: { message?: string }) {
  return <DSLoading variant="overlay" message={message} transparent />;
}

export function DSButtonLoading({ size = 'small' }: { size?: 'small' | 'medium' | 'large' }) {
  return <DSLoading variant="circular" size={size} />;
}

export function DSTableLoading({ rows = 5 }: { rows?: number }) {
  return <DSSkeleton variant="table" lines={rows} />;
}

export function DSCardLoading() {
  return <DSSkeleton variant="card" />;
}

export function DSListLoading({ items = 3 }: { items?: number }) {
  return <DSSkeleton variant="list" lines={items} />;
}

// Hook para gerenciar estados de loading
export function useLoading(initialState = false) {
  const [loading, setLoading] = React.useState(initialState);
  const [message, setMessage] = React.useState<string>();

  const startLoading = (loadingMessage?: string) => {
    setLoading(true);
    setMessage(loadingMessage);
  };

  const stopLoading = () => {
    setLoading(false);
    setMessage(undefined);
  };

  const withLoading = async <T,>(
    asyncFn: () => Promise<T>,
    loadingMessage?: string
  ): Promise<T> => {
    startLoading(loadingMessage);
    try {
      const result = await asyncFn();
      return result;
    } finally {
      stopLoading();
    }
  };

  return {
    loading,
    message,
    startLoading,
    stopLoading,
    withLoading,
  };
}