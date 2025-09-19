'use client';

import React from 'react';
import { Box, BoxProps } from '@mui/material';

type SpacingValue = 
  | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
  | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 12 | 16 | 20 | 24;

interface DSSpacingProps extends Omit<BoxProps, 'p' | 'm' | 'pt' | 'pr' | 'pb' | 'pl' | 'mt' | 'mr' | 'mb' | 'ml' | 'px' | 'py' | 'mx' | 'my'> {
  // Padding
  p?: SpacingValue;
  pt?: SpacingValue;
  pr?: SpacingValue;
  pb?: SpacingValue;
  pl?: SpacingValue;
  px?: SpacingValue;
  py?: SpacingValue;
  
  // Margin
  m?: SpacingValue;
  mt?: SpacingValue;
  mr?: SpacingValue;
  mb?: SpacingValue;
  ml?: SpacingValue;
  mx?: SpacingValue;
  my?: SpacingValue;
  
  // Gap (para flexbox/grid)
  gap?: SpacingValue;
  rowGap?: SpacingValue;
  columnGap?: SpacingValue;
}

// Mapeamento dos valores de espaçamento
const getSpacingValue = (value: SpacingValue): number => {
  if (typeof value === 'number') {
    return value;
  }
  
  switch (value) {
    case 'xs':
      return 0.5; // 4px
    case 'sm':
      return 1;   // 8px
    case 'md':
      return 2;   // 16px
    case 'lg':
      return 3;   // 24px
    case 'xl':
      return 4;   // 32px
    case 'xxl':
      return 6;   // 48px
    default:
      return 0;
  }
};

export default function DSSpacing({
  p, pt, pr, pb, pl, px, py,
  m, mt, mr, mb, ml, mx, my,
  gap, rowGap, columnGap,
  sx,
  ...props
}: DSSpacingProps) {
  const spacingStyles = {
    ...(p !== undefined && { p: getSpacingValue(p) }),
    ...(pt !== undefined && { pt: getSpacingValue(pt) }),
    ...(pr !== undefined && { pr: getSpacingValue(pr) }),
    ...(pb !== undefined && { pb: getSpacingValue(pb) }),
    ...(pl !== undefined && { pl: getSpacingValue(pl) }),
    ...(px !== undefined && { px: getSpacingValue(px) }),
    ...(py !== undefined && { py: getSpacingValue(py) }),
    
    ...(m !== undefined && { m: getSpacingValue(m) }),
    ...(mt !== undefined && { mt: getSpacingValue(mt) }),
    ...(mr !== undefined && { mr: getSpacingValue(mr) }),
    ...(mb !== undefined && { mb: getSpacingValue(mb) }),
    ...(ml !== undefined && { ml: getSpacingValue(ml) }),
    ...(mx !== undefined && { mx: getSpacingValue(mx) }),
    ...(my !== undefined && { my: getSpacingValue(my) }),
    
    ...(gap !== undefined && { gap: getSpacingValue(gap) }),
    ...(rowGap !== undefined && { rowGap: getSpacingValue(rowGap) }),
    ...(columnGap !== undefined && { columnGap: getSpacingValue(columnGap) }),
  };

  return (
    <Box
      sx={{
        ...spacingStyles,
        ...sx,
      }}
      {...props}
    />
  );
}

// Componentes específicos para layouts comuns
export function DSStack({ 
  direction = 'column', 
  spacing = 'md', 
  align = 'stretch',
  justify = 'flex-start',
  wrap = 'nowrap',
  ...props 
}: {
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  spacing?: SpacingValue;
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
} & Omit<DSSpacingProps, 'gap'>) {
  return (
    <DSSpacing
      sx={{
        display: 'flex',
        flexDirection: direction,
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap,
      }}
      gap={spacing}
      {...props}
    />
  );
}

export function DSGrid({ 
  columns = 12, 
  spacing = 'md',
  ...props 
}: {
  columns?: number | string;
  spacing?: SpacingValue;
} & Omit<DSSpacingProps, 'gap'>) {
  return (
    <DSSpacing
      sx={{
        display: 'grid',
        gridTemplateColumns: typeof columns === 'number' 
          ? `repeat(${columns}, 1fr)` 
          : columns,
      }}
      gap={spacing}
      {...props}
    />
  );
}

export function DSContainer({ 
  maxWidth = 'lg',
  centered = true,
  ...props 
}: {
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  centered?: boolean;
} & DSSpacingProps) {
  const getMaxWidth = () => {
    if (typeof maxWidth === 'number') return `${maxWidth}px`;
    
    switch (maxWidth) {
      case 'xs': return '480px';
      case 'sm': return '768px';
      case 'md': return '1024px';
      case 'lg': return '1200px';
      case 'xl': return '1440px';
      default: return '100%';
    }
  };

  return (
    <DSSpacing
      sx={{
        width: '100%',
        maxWidth: getMaxWidth(),
        ...(centered && {
          marginLeft: 'auto',
          marginRight: 'auto',
        }),
      }}
      {...props}
    />
  );
}

// Hook para usar espaçamentos em componentes customizados
export function useSpacing() {
  return {
    getSpacing: getSpacingValue,
    spacing: {
      xs: getSpacingValue('xs'),
      sm: getSpacingValue('sm'),
      md: getSpacingValue('md'),
      lg: getSpacingValue('lg'),
      xl: getSpacingValue('xl'),
      xxl: getSpacingValue('xxl'),
    },
  };
}