'use client';

import { ReactNode } from 'react';
import { CardContent, CardHeader, Box, Typography, Skeleton } from '@mui/material';
import { Card, DSBars } from '@/components/ui';

interface SeriesData {
  x: string | Date;
  y: number;
}

interface Series {
  name: string;
  data: SeriesData[];
}

interface BarChartCardProps {
  title: string;
  series: Series[];
  loading?: boolean;
  footer?: ReactNode;
}

export default function BarChartCard({
  title,
  series,
  loading = false,
  footer,
}: BarChartCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader title={<Skeleton variant="text" width="60%" height={32} />} />
        <CardContent>
          <Skeleton variant="rectangular" width="100%" height={300} />
          {footer && <Skeleton variant="text" width="40%" height={20} sx={{ mt: 2 }} />}
        </CardContent>
      </Card>
    );
  }

  // Preparar dados para o DSBars
  const chartData =
    series[0]?.data.map((item) => ({
      x: typeof item.x === 'string' ? item.x : new Date(item.x).toISOString(),
      y: item.y,
    })) || [];

  return (
    <Card>
      <CardHeader
        title={
          <Typography variant="h6" component="h3" fontWeight={600}>
            {title}
          </Typography>
        }
        sx={{ pb: 1 }}
      />
      <CardContent sx={{ pt: 0 }}>
        <DSBars
          data={chartData}
          height={300}
          label={series[0]?.name || 'Dados'}
          valueType="currency"
        />

        {footer && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              {footer}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
