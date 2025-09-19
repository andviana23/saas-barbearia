'use client';

import { ReactNode } from 'react';
import { CardContent, Box, Typography, Skeleton, useTheme } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { Card } from '@/components/ui';

interface KpiCardProps {
  title: string;
  value: string | number;
  delta?: number;
  icon?: ReactNode;
  subtitle?: string;
  loading?: boolean;
  onClick?: () => void;
}

export default function KpiCard({
  title,
  value,
  delta,
  icon,
  subtitle,
  loading = false,
  onClick,
}: KpiCardProps) {
  const theme = useTheme();

  const getDeltaColor = (delta: number) => {
    if (delta > 0) return theme.palette.success.main;
    if (delta < 0) return theme.palette.error.main;
    return theme.palette.text.secondary;
  };

  const getDeltaIcon = (delta: number) => {
    if (delta > 0) return <TrendingUp fontSize="small" />;
    if (delta < 0) return <TrendingDown fontSize="small" />;
    return null;
  };

  const formatDelta = (delta: number) => {
    const sign = delta > 0 ? '+' : '';
    return `${sign}${delta.toFixed(1)}%`;
  };

  // Verificar se o valor indica "sem dados"
  const hasNoData = value === 'Sem dados' || value === 0;

  if (loading) {
    return (
      <Card sx={{ height: '100%', cursor: 'pointer' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Box sx={{ ml: 2, flex: 1 }}>
              <Skeleton variant="text" width="60%" height={24} />
            </Box>
          </Box>
          <Skeleton variant="text" width="80%" height={32} />
          <Skeleton variant="text" width="40%" height={20} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': onClick
          ? {
              transform: 'translateY(-2px)',
              boxShadow: theme.shadows[8],
            }
          : {},
      }}
      onClick={onClick}
    >
      <CardContent>
        {/* Header com ícone e título */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: 1, // radius.xs para ícones
                backgroundColor: hasNoData ? 'action.disabledBackground' : 'primary.light', // primary com transparência
                color: hasNoData ? 'text.disabled' : 'primary.main', // cor primária do DS
                mr: 2,
              }}
            >
              {icon}
            </Box>
          )}
          <Typography variant="subtitle2" color="text.secondary" fontWeight={500}>
            {title}
          </Typography>
        </Box>

        {/* Valor principal */}
        <Typography
          variant="h4"
          component="div"
          sx={{
            fontWeight: 700,
            mb: 1,
            color: hasNoData ? 'text.disabled' : 'text.primary',
          }}
        >
          {value}
        </Typography>

        {/* Subtitle e delta */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}

          {delta !== undefined && !hasNoData && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: getDeltaColor(delta),
              }}
            >
              {getDeltaIcon(delta)}
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: 'inherit',
                }}
              >
                {formatDelta(delta)}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
