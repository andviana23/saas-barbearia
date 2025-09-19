'use client';
import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Box,
  Grid,
  Stack,
  Button,
  IconButton,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import TodayIcon from '@mui/icons-material/Today';
import { useRouter, useSearchParams } from 'next/navigation';
import { SidebarFiltros } from './SidebarFiltros';
import { GradeHorarios } from './GradeHorarios';
import { StatsCards } from './StatsCards';
import type { Appointment, Professional, Service } from '@/app/(protected)/agenda/page';

export const PIXELS_PER_MINUTE = 2; // escala vertical

export interface AgendaProps {
  appointments: Appointment[];
  professionals: Professional[];
  services: Service[];
  view: 'day' | 'week' | 'month';
  currentDate: string; // ISO date (YYYY-MM-DD)
}

export function Agenda({ appointments, professionals, view, currentDate }: AgendaProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estados iniciais vindos da URL
  const [selectedProfessional, setSelectedProfessional] = useState<string>(
    searchParams.get('professionalId') || '',
  );
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || '');
  const [currentView, setCurrentView] = useState<'day' | 'week' | 'month'>(
    (searchParams.get('view') as 'day' | 'week' | 'month') || view,
  );
  const [date, setDate] = useState<string>(searchParams.get('start') || currentDate);

  // Sincroniza quando URL mudar externamente (ex: back/forward)
  useEffect(() => {
    const spProf = searchParams.get('professionalId') || '';
    if (spProf !== selectedProfessional) setSelectedProfessional(spProf);
    const spStatus = searchParams.get('status') || '';
    if (spStatus !== statusFilter) setStatusFilter(spStatus);
    const spView = (searchParams.get('view') as 'day' | 'week' | 'month') || currentView;
    if (spView !== currentView) setCurrentView(spView);
    const spDate = searchParams.get('start') || date;
    if (spDate !== date) setDate(spDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const pushQuery = useCallback(
    (patch: Record<string, string | undefined>) => {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      Object.entries(patch).forEach(([k, v]) => {
        if (v === undefined || v === '') params.delete(k);
        else params.set(k, v);
      });
      router.push(`/agenda?${params.toString()}`);
    },
    [router, searchParams],
  );

  const handleProfessional = (id: string) => {
    setSelectedProfessional(id);
    pushQuery({ professionalId: id || undefined });
  };
  const handleStatus = (st: string) => {
    setStatusFilter(st);
    pushQuery({ status: st || undefined });
  };
  const handleViewChange = (v: 'day' | 'week' | 'month') => {
    setCurrentView(v);
    pushQuery({ view: v });
  };

  const shiftDate = (direction: -1 | 1) => {
    const d = new Date(date);
    if (currentView === 'day') d.setDate(d.getDate() + direction);
    else if (currentView === 'week') d.setDate(d.getDate() + 7 * direction);
    else d.setMonth(d.getMonth() + direction);
    const iso = d.toISOString().split('T')[0];
    setDate(iso);
    pushQuery({ start: iso });
  };
  const handleToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
    pushQuery({ start: today });
  };

  const filtered = useMemo(
    () =>
      appointments.filter(
        (a) =>
          (selectedProfessional ? a.professional_id === selectedProfessional : true) &&
          (statusFilter ? a.status === statusFilter : true) &&
          a.date === date,
      ),
    [appointments, selectedProfessional, statusFilter, date],
  );

  return (
    <Box>
      {/* Barra de navegação / filtros globais */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton size="small" onClick={() => shiftDate(-1)} aria-label="Dia anterior">
            <ArrowBackIosNewIcon fontSize="inherit" />
          </IconButton>
          <Button startIcon={<TodayIcon />} size="small" variant="outlined" onClick={handleToday}>
            Hoje
          </Button>
          <IconButton size="small" onClick={() => shiftDate(1)} aria-label="Próximo dia">
            <ArrowForwardIosIcon fontSize="inherit" />
          </IconButton>
          <Typography variant="subtitle2" sx={{ ml: 1 }}>
            {new Date(date).toLocaleDateString('pt-BR')}
          </Typography>
        </Stack>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Visão</InputLabel>
          <Select
            value={currentView}
            label="Visão"
            onChange={(e) => handleViewChange(e.target.value as 'day' | 'week' | 'month')}
          >
            <MenuItem value="day">Dia</MenuItem>
            <MenuItem value="week">Semana</MenuItem>
            <MenuItem value="month">Mês</MenuItem>
          </Select>
        </FormControl>
      </Stack>
      <StatsCards appointments={filtered} />
      <Grid container spacing={3}>
        <Grid item xs={12} md={3} lg={2}>
          <SidebarFiltros
            currentDate={date}
            onSelectProfessional={handleProfessional}
            onStatusChange={handleStatus}
            professionals={professionals}
          />
        </Grid>
        <Grid item xs={12} md={9} lg={10}>
          <GradeHorarios
            appointments={filtered}
            professionals={professionals}
            view={currentView}
            currentDate={date}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
