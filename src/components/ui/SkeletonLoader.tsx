'use client';

import { Box, Skeleton, Stack, Card, CardContent } from '@mui/material';

interface SkeletonLoaderProps {
  variant?: 'table' | 'card' | 'list' | 'dashboard' | 'form' | 'custom';
  rows?: number;
  height?: number | string;
  animation?: 'pulse' | 'wave' | false;
}

export default function SkeletonLoader({
  variant = 'card',
  rows = 3,
  height = 200,
  animation = 'wave',
}: SkeletonLoaderProps) {
  const renderTableSkeleton = () => (
    <Box>
      {/* Header */}
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Skeleton variant="text" width="20%" height={40} animation={animation} />
        <Skeleton variant="text" width="30%" height={40} animation={animation} />
        <Skeleton variant="text" width="25%" height={40} animation={animation} />
        <Skeleton variant="text" width="25%" height={40} animation={animation} />
      </Stack>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, index) => (
        <Stack key={index} direction="row" spacing={2} sx={{ mb: 1 }}>
          <Skeleton variant="text" width="20%" height={32} animation={animation} />
          <Skeleton variant="text" width="30%" height={32} animation={animation} />
          <Skeleton variant="text" width="25%" height={32} animation={animation} />
          <Skeleton variant="text" width="25%" height={32} animation={animation} />
        </Stack>
      ))}
    </Box>
  );

  const renderCardSkeleton = () => (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Skeleton variant="text" width="60%" height={32} animation={animation} />
          <Skeleton variant="rectangular" width="100%" height={height} animation={animation} />
          <Stack direction="row" spacing={1}>
            <Skeleton variant="text" width="30%" height={24} animation={animation} />
            <Skeleton variant="text" width="40%" height={24} animation={animation} />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );

  const renderListSkeleton = () => (
    <Stack spacing={2}>
      {Array.from({ length: rows }).map((_, index) => (
        <Stack key={index} direction="row" spacing={2} alignItems="center">
          <Skeleton variant="circular" width={40} height={40} animation={animation} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="70%" height={24} animation={animation} />
            <Skeleton variant="text" width="50%" height={20} animation={animation} />
          </Box>
          <Skeleton variant="rectangular" width={80} height={32} animation={animation} />
        </Stack>
      ))}
    </Stack>
  );

  const renderDashboardSkeleton = () => (
    <Box>
      {/* KPI Cards */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} sx={{ flex: 1 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Skeleton variant="circular" width={48} height={48} animation={animation} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" height={24} animation={animation} />
                  <Skeleton variant="text" width="80%" height={32} animation={animation} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Charts */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Skeleton variant="text" width="40%" height={32} animation={animation} />
            <Skeleton variant="rectangular" width="100%" height={300} animation={animation} />
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Skeleton variant="text" width="40%" height={32} animation={animation} />
            <Skeleton variant="rectangular" width="100%" height={300} animation={animation} />
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );

  const renderFormSkeleton = () => (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <Skeleton variant="text" width="50%" height={32} animation={animation} />

          {Array.from({ length: rows }).map((_, index) => (
            <Stack key={index} spacing={1}>
              <Skeleton variant="text" width="30%" height={24} animation={animation} />
              <Skeleton variant="rectangular" width="100%" height={56} animation={animation} />
            </Stack>
          ))}

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Skeleton variant="rectangular" width={100} height={40} animation={animation} />
            <Skeleton variant="rectangular" width={120} height={40} animation={animation} />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );

  switch (variant) {
    case 'table':
      return renderTableSkeleton();
    case 'card':
      return renderCardSkeleton();
    case 'list':
      return renderListSkeleton();
    case 'dashboard':
      return renderDashboardSkeleton();
    case 'form':
      return renderFormSkeleton();
    default:
      return <Skeleton variant="rectangular" width="100%" height={height} animation={animation} />;
  }
}
