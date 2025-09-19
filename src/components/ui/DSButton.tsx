'use client';

import React from 'react';
import {
  Button,
  ButtonProps,
  CircularProgress,
  Box,
} from '@mui/material';

interface DSButtonProps extends Omit<ButtonProps, 'variant' | 'size'> {
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'start' | 'end';
  fullWidth?: boolean;
}

export default function DSButton({
  variant = 'contained',
  size = 'medium',
  loading = false,
  loadingText,
  icon,
  iconPosition = 'start',
  children,
  disabled,
  sx,
  ...props
}: DSButtonProps) {
  const isDisabled = disabled || loading;
  
  const loadingSize = {
    small: 16,
    medium: 20,
    large: 24,
  }[size];

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress 
            size={loadingSize} 
            color="inherit"
            thickness={4}
          />
          {loadingText || children}
        </Box>
      );
    }

    if (icon) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {iconPosition === 'start' && icon}
          {children}
          {iconPosition === 'end' && icon}
        </Box>
      );
    }

    return children;
  };

  return (
    <Button
      variant={variant}
      size={size}
      disabled={isDisabled}
      sx={{
        borderRadius: (t) => t.shape.borderRadius,
        textTransform: 'none',
        fontWeight: 600,
        boxShadow: variant === 'contained' ? 2 : 0,
        '&:hover': {
          boxShadow: variant === 'contained' ? 4 : 0,
        },
        '&.Mui-disabled': {
          opacity: 0.6,
        },
        // Variações de tamanho
        ...(size === 'small' && {
          padding: '6px 16px',
          fontSize: '0.875rem',
        }),
        ...(size === 'medium' && {
          padding: '8px 20px',
          fontSize: '0.875rem',
        }),
        ...(size === 'large' && {
          padding: '12px 24px',
          fontSize: '1rem',
        }),
        // Variações de estilo
        ...(variant === 'outlined' && {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        }),
        ...sx,
      }}
      {...props}
    >
      {renderContent()}
    </Button>
  );
}
