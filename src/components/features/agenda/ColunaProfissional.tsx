'use client';
import React from 'react';
import { Box, Typography } from '@mui/material';

interface ColunaProfissionalProps {
  nome: string;
}

export function ColunaProfissional({ nome }: ColunaProfissionalProps) {
  return (
    <Box minWidth={220} p={1} borderRight="1px solid" borderColor="divider">
      <Typography variant="subtitle2">{nome}</Typography>
      {/* Slots / agendamentos serão renderizados aqui */}
    </Box>
  );
}
