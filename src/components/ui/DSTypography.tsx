'use client';

import React from 'react';
import { Typography, TypographyProps, Box } from '@mui/material';

interface DSTypographyProps extends Omit<TypographyProps, 'variant'> {
  variant?: 
    | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    | 'subtitle1' | 'subtitle2'
    | 'body1' | 'body2'
    | 'caption' | 'overline'
    | 'display1' | 'display2' | 'display3'
    | 'label' | 'helper' | 'error';
  weight?: 'light' | 'regular' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'text' | 'disabled';
  truncate?: boolean;
  maxLines?: number;
}

const getVariantStyles = (variant: DSTypographyProps['variant']) => {
  switch (variant) {
    case 'display1':
      return {
        fontSize: '3.5rem',
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
      };
    case 'display2':
      return {
        fontSize: '2.75rem',
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
      };
    case 'display3':
      return {
        fontSize: '2.25rem',
        fontWeight: 600,
        lineHeight: 1.3,
        letterSpacing: '-0.01em',
      };
    case 'label':
      return {
        fontSize: '0.875rem',
        fontWeight: 500,
        lineHeight: 1.4,
        letterSpacing: '0.01em',
      };
    case 'helper':
      return {
        fontSize: '0.75rem',
        fontWeight: 400,
        lineHeight: 1.4,
        color: 'text.secondary',
      };
    case 'error':
      return {
        fontSize: '0.75rem',
        fontWeight: 400,
        lineHeight: 1.4,
        color: 'error.main',
      };
    default:
      return {};
  }
};

const getWeightValue = (weight: DSTypographyProps['weight']) => {
  switch (weight) {
    case 'light':
      return 300;
    case 'regular':
      return 400;
    case 'medium':
      return 500;
    case 'semibold':
      return 600;
    case 'bold':
      return 700;
    default:
      return undefined;
  }
};

const getColorValue = (color: DSTypographyProps['color']) => {
  switch (color) {
    case 'primary':
      return 'primary.main';
    case 'secondary':
      return 'secondary.main';
    case 'success':
      return 'success.main';
    case 'error':
      return 'error.main';
    case 'warning':
      return 'warning.main';
    case 'info':
      return 'info.main';
    case 'text':
      return 'text.primary';
    case 'disabled':
      return 'text.disabled';
    default:
      return undefined;
  }
};

export default function DSTypography({
  variant = 'body1',
  weight,
  color,
  truncate = false,
  maxLines,
  children,
  sx,
  ...props
}: DSTypographyProps) {
  const customVariants = ['display1', 'display2', 'display3', 'label', 'helper', 'error'];
  const isCustomVariant = customVariants.includes(variant as string);
  
  const variantStyles = getVariantStyles(variant);
  const weightValue = getWeightValue(weight);
  const colorValue = getColorValue(color);

  const truncateStyles = truncate ? {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  } : {};

  const maxLinesStyles = maxLines ? {
    display: '-webkit-box',
    WebkitLineClamp: maxLines,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  } : {};

  const finalSx = {
    ...variantStyles,
    ...(weightValue && { fontWeight: weightValue }),
    ...(colorValue && { color: colorValue }),
    ...truncateStyles,
    ...maxLinesStyles,
    ...sx,
  };

  if (isCustomVariant) {
    return (
      <Box
        component="span"
        sx={finalSx}
        {...props}
      >
        {children}
      </Box>
    );
  }

  return (
    <Typography
      variant={variant as any}
      sx={finalSx}
      {...props}
    >
      {children}
    </Typography>
  );
}

// Componentes específicos para facilitar o uso
export function DSHeading({ level = 1, ...props }: { level?: 1 | 2 | 3 | 4 | 5 | 6 } & Omit<DSTypographyProps, 'variant'>) {
  return <DSTypography variant={`h${level}` as any} {...props} />;
}

export function DSDisplay({ level = 1, ...props }: { level?: 1 | 2 | 3 } & Omit<DSTypographyProps, 'variant'>) {
  return <DSTypography variant={`display${level}` as any} {...props} />;
}

export function DSLabel(props: Omit<DSTypographyProps, 'variant'>) {
  return <DSTypography variant="label" {...props} />;
}

export function DSHelper(props: Omit<DSTypographyProps, 'variant'>) {
  return <DSTypography variant="helper" {...props} />;
}

export function DSError(props: Omit<DSTypographyProps, 'variant'>) {
  return <DSTypography variant="error" {...props} />;
}