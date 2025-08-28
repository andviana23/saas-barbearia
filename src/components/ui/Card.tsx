'use client';

import {
  Card as MuiCard,
  CardProps as MuiCardProps,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

export interface CardProps extends Omit<MuiCardProps, 'title'> {
  title?: string;
  subtitle?: string;
  value?: string;
  trend?: string;
  trendUp?: boolean;
  actions?: ReactNode;
  loading?: boolean;
}

export default function Card({
  title,
  subtitle,
  value,
  trend,
  trendUp,
  actions,
  loading = false,
  children,
  sx,
  ...props
}: CardProps) {
  return (
    <MuiCard
      elevation={0} // usa padrão do tema (sem sombras artificiais)
      sx={{
        // deixa o tema mandar: background.paper = #040E18, radius/divider via theme
        bgcolor: 'background.paper',
        borderRadius: (t) => t.shape.borderRadius,
        border: (t) => `1px solid ${t.palette.divider}`,
        ...sx,
      }}
      {...props}
    >
      {(title || subtitle) && (
        <CardHeader
          title={
            title && (
              <Typography variant="h6" component="h2" sx={{ fontWeight: 500 }}>
                {title}
              </Typography>
            )
          }
          subheader={
            subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )
          }
          action={
            trend && (
              <Chip
                icon={trendUp ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
                label={trend}
                size="small"
                color={trendUp ? 'success' : 'error'}
                variant="outlined"
              />
            )
          }
          sx={{ pb: title && !subtitle ? 2 : 1 }}
        />
      )}

      <CardContent sx={{ pt: title || subtitle ? 0 : 2 }}>
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 100,
            }}
          >
            <Typography color="text.secondary">Carregando...</Typography>
          </Box>
        ) : (
          <>
            {value && (
              <Typography
                variant="h3"
                component="div"
                sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}
              >
                {value}
              </Typography>
            )}
            {children}
          </>
        )}
      </CardContent>

      {actions && <CardActions sx={{ px: 2, pb: 2 }}>{actions}</CardActions>}
    </MuiCard>
  );
}
