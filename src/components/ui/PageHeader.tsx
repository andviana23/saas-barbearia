'use client';

import { Box, Typography, Paper } from '@mui/material';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  withBackground?: boolean; // se true, aplica um Paper #040E18
}

export default function PageHeader({
  title,
  subtitle,
  actions,
  withBackground = false,
}: PageHeaderProps) {
  return (
    <Box
      component={withBackground ? Paper : 'div'}
      sx={(t) => ({
        mb: 4,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: 2,
        ...(withBackground && {
          bgcolor: 'background.paper', // #040E18
          borderRadius: t.shape.borderRadius,
          border: `1px solid ${t.palette.divider}`,
          px: 3,
          py: 2,
        }),
      })}
    >
      <Box>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            mb: subtitle ? 1 : 0,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 400 }}>
            {subtitle}
          </Typography>
        )}
      </Box>

      {actions && <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>{actions}</Box>}
    </Box>
  );
}
