'use client';
import React from 'react';
import { Box, Typography } from '@mui/material';

export function SidebarFiltros() {
  return (
    <Box p={2} width={250} borderRight="1px solid" borderColor="divider">
      <Typography variant="subtitle1">Filtros</Typography>
      {/* TODO: implementar filtros (profissional, serviço, status) */}
    </Box>
  );
}
