'use client';

import React from 'react';
import {
  Card as MuiCard,
  CardContent,
  CardHeader,
  Typography,
  Box,
  SxProps,
  Theme,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(MuiCard)(({ theme }) => ({
  borderRadius: theme.spacing(1.5),
  boxShadow: theme.shadows[1],
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-1px)',
  },
  backgroundColor: theme.palette.background.paper,
}));

const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiCardHeader-title': {
    fontSize: '1rem',
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
  '& .MuiCardHeader-subheader': {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
  },
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(3),
}));

interface DSCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  elevation?: number;
  onClick?: () => void;
  sx?: SxProps<Theme>;
}

export default function DSCard({
  title,
  subtitle,
  children,
  action,
  className,
  elevation = 1,
  onClick,
  sx,
}: DSCardProps) {
  return (
    <StyledCard
      className={className}
      elevation={elevation}
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        ...sx,
      }}
    >
      {(title || subtitle || action) && (
        <StyledCardHeader title={title} subheader={subtitle} action={action} />
      )}

      <StyledCardContent>{children}</StyledCardContent>
    </StyledCard>
  );
}

// Componente auxiliar para métricas
export const MetricCard: React.FC<{
  title: string;
  value: string | number;
  trend?: number;
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'error';
}> = ({ title, value, trend, icon, color = 'primary' }) => {
  const trendColor =
    trend && trend > 0 ? 'success' : trend && trend < 0 ? 'error' : 'text.secondary';
  const trendText = trend && trend > 0 ? `+${trend}%` : trend && trend < 0 ? `${trend}%` : '';

  return (
    <DSCard>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold" color={`${color}.main`}>
            {value}
          </Typography>
          {trend && (
            <Typography variant="caption" color={`${trendColor}.main`}>
              {trendText} vs ontem
            </Typography>
          )}
        </Box>
        {icon && <Box color={`${color}.main`}>{icon}</Box>}
      </Box>
    </DSCard>
  );
};
