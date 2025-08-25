'use client'
import { Box, Typography, Stack } from '@mui/material'

interface PageHeaderProps {
  title: string
  subtitle?: string
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      mb={3}
      gap={2}
    >
      <Box>
        <Typography variant="h2">{title}</Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" aria-live="polite">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Stack>
  )
}
