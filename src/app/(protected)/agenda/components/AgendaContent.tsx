'use client';

import * as React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Toolbar,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Divider,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import ScheduleIcon from '@mui/icons-material/Schedule';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useState } from 'react';

// Types
export type Appointment = {
  id: string;
  customer_name: string;
  professional_id: string;
  professional_name?: string;
  service_id: string;
  service_name?: string;
  date: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'canceled' | 'no_show';
  notes?: string | null;
  price?: number;
};

export type Professional = {
  id: string;
  name: string;
};

export type Service = {
  id: string;
  name: string;
  duration_minutes?: number;
};

export type AppointmentsResponse = {
  items: Appointment[];
  total: number;
};

interface AgendaContentProps {
  initialData: AppointmentsResponse;
  professionals: Professional[];
  services: Service[];
  searchParams: Record<string, string>;
}

function formatTime(time: string) {
  return time.substring(0, 5); // "14:30:00" -> "14:30"
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR');
}

function statusLabel(status: Appointment['status']) {
  switch (status) {
    case 'scheduled':
      return 'Agendado';
    case 'confirmed':
      return 'Confirmado';
    case 'completed':
      return 'Concluído';
    case 'canceled':
      return 'Cancelado';
    case 'no_show':
      return 'No-show';
    default:
      return status;
  }
}

function statusColor(status: Appointment['status']) {
  switch (status) {
    case 'scheduled':
      return 'default' as const;
    case 'confirmed':
      return 'success' as const;
    case 'completed':
      return 'primary' as const;
    case 'canceled':
      return 'warning' as const;
    case 'no_show':
      return 'error' as const;
    default:
      return 'default' as const;
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

export function AgendaContent({
  initialData,
  professionals,
  services,
  searchParams,
}: AgendaContentProps) {
  const [appointments, setAppointments] = useState(initialData);
  const [view, setView] = useState<'day' | 'week' | 'month'>(
    (searchParams.view as 'day' | 'week' | 'month') || 'week',
  );
  const [currentDate, setCurrentDate] = useState(
    searchParams.start || new Date().toISOString().split('T')[0],
  );

  const handlePrevious = () => {
    const date = new Date(currentDate);
    if (view === 'day') {
      date.setDate(date.getDate() - 1);
    } else if (view === 'week') {
      date.setDate(date.getDate() - 7);
    } else {
      date.setMonth(date.getMonth() - 1);
    }
    setCurrentDate(date.toISOString().split('T')[0]);
  };

  const handleNext = () => {
    const date = new Date(currentDate);
    if (view === 'day') {
      date.setDate(date.getDate() + 1);
    } else if (view === 'week') {
      date.setDate(date.getDate() + 7);
    } else {
      date.setMonth(date.getMonth() + 1);
    }
    setCurrentDate(date.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setCurrentDate(new Date().toISOString().split('T')[0]);
  };

  // Estatísticas do dia/período
  const stats = {
    total: appointments.items.length,
    confirmed: appointments.items.filter((a) => a.status === 'confirmed').length,
    completed: appointments.items.filter((a) => a.status === 'completed').length,
    revenue: appointments.items
      .filter((a) => a.status === 'completed')
      .reduce((sum, a) => sum + (a.price || 0), 0),
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          Agenda
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={handleToday}>
            Hoje
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} href="/agenda/novo">
            Novo Agendamento
          </Button>
        </Stack>
      </Stack>

      {/* Controles de navegação e visualização */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', md: 'center' }}
        >
          {/* Navegação de data */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton onClick={handlePrevious}>
              <NavigateBeforeIcon />
            </IconButton>

            <Typography variant="h6" sx={{ minWidth: 200, textAlign: 'center' }}>
              {view === 'day' && formatDate(currentDate)}
              {view === 'week' && `Semana de ${formatDate(currentDate)}`}
              {view === 'month' &&
                new Date(currentDate).toLocaleDateString('pt-BR', {
                  month: 'long',
                  year: 'numeric',
                })}
            </Typography>

            <IconButton onClick={handleNext}>
              <NavigateNextIcon />
            </IconButton>
          </Stack>

          {/* Seletor de visualização */}
          <FormControl sx={{ minWidth: 140 }}>
            <InputLabel>Visualização</InputLabel>
            <Select
              value={view}
              onChange={(e) => setView(e.target.value as 'day' | 'week' | 'month')}
              label="Visualização"
            >
              <MenuItem value="day">Dia</MenuItem>
              <MenuItem value="week">Semana</MenuItem>
              <MenuItem value="month">Mês</MenuItem>
            </Select>
          </FormControl>

          {/* Filtros */}
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Profissional</InputLabel>
            <Select defaultValue={searchParams.professionalId || ''} label="Profissional">
              <MenuItem value="">
                <em>Todos</em>
              </MenuItem>
              {professionals.map((professional) => (
                <MenuItem key={professional.id} value={professional.id}>
                  {professional.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>Status</InputLabel>
            <Select defaultValue={searchParams.status || ''} label="Status">
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

      {/* Estatísticas do período */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total de Agendamentos
            </Typography>
            <Typography variant="h4" color="primary.main">
              {stats.total}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Confirmados
            </Typography>
            <Typography variant="h4" color="success.main">
              {stats.confirmed}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Concluídos
            </Typography>
            <Typography variant="h4" color="info.main">
              {stats.completed}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Receita
            </Typography>
            <Typography variant="h4" color="warning.main">
              {formatCurrency(stats.revenue)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Lista de agendamentos */}
      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Agendamentos
          </Typography>

          {appointments.items.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              Nenhum agendamento encontrado para o período selecionado.
            </Alert>
          ) : (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {appointments.items.map((appointment) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={appointment.id}>
                  <Card variant="outlined" sx={{ borderRadius: 1 }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Stack spacing={1}>
                        {/* Header com horário e status */}
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <ScheduleIcon fontSize="small" color="action" />
                            <Typography variant="body2" fontWeight={600}>
                              {formatTime(appointment.start_time)} -{' '}
                              {formatTime(appointment.end_time)}
                            </Typography>
                          </Stack>
                          <Chip
                            label={statusLabel(appointment.status)}
                            color={statusColor(appointment.status)}
                            size="small"
                          />
                        </Stack>

                        {/* Cliente */}
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <PersonIcon fontSize="small" color="action" />
                          <Typography variant="body1" fontWeight={600}>
                            {appointment.customer_name}
                          </Typography>
                        </Stack>

                        {/* Serviço */}
                        <Typography variant="body2" color="text.secondary">
                          {appointment.service_name}
                        </Typography>

                        {/* Profissional */}
                        <Typography variant="body2" color="text.secondary">
                          {appointment.professional_name}
                        </Typography>

                        {/* Preço */}
                        {appointment.price && (
                          <Typography variant="body2" fontWeight={600} color="success.main">
                            {formatCurrency(appointment.price)}
                          </Typography>
                        )}

                        {/* Observações */}
                        {appointment.notes && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontStyle: 'italic' }}
                          >
                            &quot;{appointment.notes}&quot;
                          </Typography>
                        )}

                        <Divider />

                        {/* Ações */}
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="Editar">
                            <IconButton size="small" href={`/agenda/${appointment.id}`}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Excluir">
                            <IconButton size="small" color="error">
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Paper>

      {/* Legenda */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Dica:</strong> Confirme agendamentos na véspera e use reagendamento quando
          necessário. Clique em um agendamento para editar ou visualizar detalhes.
        </Typography>
      </Alert>
    </Box>
  );
}
