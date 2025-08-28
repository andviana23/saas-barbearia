'use client';
import React from 'react';
import { Paper, Typography } from '@mui/material';

interface BlocoAgendamentoProps {
  inicio: string;
  fim: string;
  cliente?: string;
  servico?: string;
}

export function BlocoAgendamento({ inicio, fim, cliente, servico }: BlocoAgendamentoProps) {
  return (
    <Paper variant="outlined" sx={{ p: 0.5, mb: 0.5 }}>
      <Typography variant="caption">
        {inicio} - {fim}
      </Typography>
      <Typography variant="body2" fontWeight={500} noWrap>
        {cliente || 'Cliente'}
      </Typography>
      <Typography variant="caption" color="text.secondary" noWrap>
        {servico || 'Serviço'}
      </Typography>
    </Paper>
  );
}
