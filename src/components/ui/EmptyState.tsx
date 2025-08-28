'use client';
import { Box, Typography, Button, Stack } from '@mui/material';

export default function EmptyState({
  title = 'Nada por aqui…',
  description = 'Tente ajustar filtros ou adicionar um novo item.',
  action,
}: {
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <Stack
      alignItems="center"
      textAlign="center"
      gap={1.5}
      p={4}
      sx={{
        border: (theme) => `1px dashed ${theme.palette.divider}`,
        borderRadius: 3,
      }}
    >
      <Typography variant="h3">{title}</Typography>
      <Typography color="text.secondary">{description}</Typography>
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </Stack>
  );
}
