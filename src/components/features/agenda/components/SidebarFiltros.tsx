'use client';
import { useState, useEffect } from 'react';
import { Paper, Stack, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import type { Professional } from '@/app/(protected)/agenda/page';

interface SidebarFiltrosProps {
  currentDate: string;
  professionals: Professional[];
  onSelectProfessional: (id: string) => void;
  onStatusChange: (status: string) => void;
  selectedProfessional?: string;
  statusFilter?: string;
}

export function SidebarFiltros({
  professionals,
  onSelectProfessional,
  onStatusChange,
  selectedProfessional = '',
  statusFilter = '',
}: SidebarFiltrosProps) {
  const [prof, setProf] = useState(selectedProfessional);
  const [status, setStatus] = useState(statusFilter);

  useEffect(() => {
    setProf(selectedProfessional);
  }, [selectedProfessional]);
  useEffect(() => {
    setStatus(statusFilter);
  }, [statusFilter]);
  return (
    <Paper sx={{ p: 2, mb: 3, borderRadius: 2.5 }} variant="outlined">
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
        Filtros
      </Typography>
      <Stack spacing={2}>
        <FormControl size="small" fullWidth>
          <InputLabel>Profissional</InputLabel>
          <Select
            value={prof}
            label="Profissional"
            onChange={(e) => {
              const v = e.target.value;
              setProf(v);
              onSelectProfessional(v);
            }}
          >
            <MenuItem value="">
              <em>Todos</em>
            </MenuItem>
            {professionals.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" fullWidth>
          <InputLabel>Status</InputLabel>
          <Select
            value={status}
            label="Status"
            onChange={(e) => {
              const v = e.target.value;
              setStatus(v);
              onStatusChange(v);
            }}
          >
            <MenuItem value="">
              <em>Todos</em>
            </MenuItem>
            <MenuItem value="scheduled">Agendado</MenuItem>
            <MenuItem value="confirmed">Confirmado</MenuItem>
            <MenuItem value="completed">Concluído</MenuItem>
            <MenuItem value="canceled">Cancelado</MenuItem>
            <MenuItem value="no_show">No-show</MenuItem>
          </Select>
        </FormControl>
      </Stack>
    </Paper>
  );
}
