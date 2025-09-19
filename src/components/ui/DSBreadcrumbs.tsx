'use client';

import React from 'react';
import {
  Breadcrumbs,
  Typography,
  Link,
  Box,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  MoreHoriz as MoreIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  current?: boolean;
  disabled?: boolean;
}

interface DSBreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  showBackButton?: boolean;
  maxItems?: number;
  separator?: React.ReactNode;
  variant?: 'default' | 'compact' | 'mobile';
  onItemClick?: (item: BreadcrumbItem, index: number) => void;
}

export function DSBreadcrumbs({
  items,
  showHome = true,
  showBackButton = false,
  maxItems = 8,
  separator,
  variant = 'default',
  onItemClick,
}: DSBreadcrumbsProps) {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Ajustar variante baseado no tamanho da tela
  const actualVariant = isMobile ? 'mobile' : variant;

  const handleItemClick = (item: BreadcrumbItem, index: number) => {
    if (item.disabled) return;
    
    if (onItemClick) {
      onItemClick(item, index);
    } else if (item.href) {
      router.push(item.href);
    }
  };

  const handleBackClick = () => {
    router.back();
  };

  // Preparar items com home se necessário
  const allItems = showHome 
    ? [{ label: 'Início', href: '/', icon: <HomeIcon /> }, ...items]
    : items;

  // Renderização mobile simplificada
  if (actualVariant === 'mobile') {
    const currentItem = allItems.find(item => item.current) || allItems[allItems.length - 1];
    const parentItem = allItems[allItems.length - 2];

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
        {showBackButton && (
          <IconButton 
            onClick={handleBackClick}
            size="small"
            sx={{ mr: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
          {parentItem && (
            <>
              <Link
                component="button"
                variant="body2"
                color="text.secondary"
                onClick={() => handleItemClick(parentItem, allItems.length - 2)}
                sx={{
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                  maxWidth: '100px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {parentItem.label}
              </Link>
              <NavigateNextIcon fontSize="small" color="disabled" />
            </>
          )}
          
          <Typography
            variant="body2"
            color="text.primary"
            fontWeight={500}
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
            }}
          >
            {currentItem?.icon && (
              <Box component="span" sx={{ mr: 0.5, display: 'inline-flex', alignItems: 'center' }}>
                {currentItem.icon}
              </Box>
            )}
            {currentItem?.label}
          </Typography>
        </Box>
      </Box>
    );
  }

  // Renderização compacta
  if (actualVariant === 'compact') {
    const currentItem = allItems[allItems.length - 1];
    const hasMore = allItems.length > 2;

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {showBackButton && (
          <IconButton 
            onClick={handleBackClick}
            size="small"
            sx={{ mr: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
        )}

        <Breadcrumbs
          separator={separator || <NavigateNextIcon fontSize="small" />}
          maxItems={3}
          itemsBeforeCollapse={1}
          itemsAfterCollapse={1}
        >
          {hasMore && (
            <Chip
              icon={<MoreIcon />}
              label="..."
              size="small"
              variant="outlined"
              clickable
            />
          )}
          
          <Typography
            variant="body2"
            color="text.primary"
            fontWeight={500}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            {currentItem?.icon}
            {currentItem?.label}
          </Typography>
        </Breadcrumbs>
      </Box>
    );
  }

  // Renderização padrão
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {showBackButton && (
        <IconButton 
          onClick={handleBackClick}
          size="small"
          sx={{ mr: 1 }}
        >
          <ArrowBackIcon />
        </IconButton>
      )}

      <Breadcrumbs
        separator={separator || <NavigateNextIcon fontSize="small" />}
        maxItems={maxItems}
        itemsBeforeCollapse={2}
        itemsAfterCollapse={2}
      >
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const isClickable = !item.disabled && !isLast && item.href;

          if (isLast || !isClickable) {
            return (
              <Typography
                key={index}
                variant="body2"
                color={isLast ? 'text.primary' : 'text.secondary'}
                fontWeight={isLast ? 500 : 400}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  opacity: item.disabled ? 0.5 : 1,
                }}
              >
                {item.icon}
                {item.label}
              </Typography>
            );
          }

          return (
            <Link
              key={index}
              component="button"
              variant="body2"
              color="text.secondary"
              onClick={() => handleItemClick(item, index)}
              sx={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                '&:hover': {
                  textDecoration: 'underline',
                  color: 'primary.main',
                },
                opacity: item.disabled ? 0.5 : 1,
                cursor: item.disabled ? 'not-allowed' : 'pointer',
              }}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
}

// Hook para gerar breadcrumbs automaticamente baseado na rota
export function useBreadcrumbs(customItems?: BreadcrumbItem[]) {
  const router = useRouter();
  
  // Esta função seria implementada baseada no sistema de rotas do Next.js
  // Por enquanto, retorna os items customizados ou um exemplo
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (customItems) return customItems;
    
    // Exemplo de geração automática baseada na URL
    // Isso seria implementado de acordo com a estrutura de rotas do projeto
    return [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Agendamentos', href: '/agendamentos' },
      { label: 'Novo Agendamento', current: true },
    ];
  };

  return {
    items: generateBreadcrumbs(),
    goBack: () => router.back(),
    goHome: () => router.push('/'),
  };
}

// Componente específico para páginas
export function DSPageBreadcrumbs({
  title,
  items,
  showBackButton = true,
  actions,
}: {
  title?: string;
  items?: BreadcrumbItem[];
  showBackButton?: boolean;
  actions?: React.ReactNode;
}) {
  const { items: autoItems } = useBreadcrumbs(items);

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      mb: 3,
      flexWrap: 'wrap',
      gap: 2,
    }}>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <DSBreadcrumbs 
          items={autoItems}
          showBackButton={showBackButton}
        />
        {title && (
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ mt: 1, fontWeight: 600 }}
          >
            {title}
          </Typography>
        )}
      </Box>
      
      {actions && (
        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
          {actions}
        </Box>
      )}
    </Box>
  );
}