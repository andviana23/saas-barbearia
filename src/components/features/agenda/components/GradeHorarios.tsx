'use client';
import { Box, Paper, Typography } from '@mui/material';
import type { Appointment, Professional } from '@/app/agenda/page';
import { BlocoAgendamento } from './blocos/BlocoAgendamento';
import { PIXELS_PER_MINUTE } from './Agenda';

interface GradeHorariosProps {
  appointments: Appointment[];
  professionals: Professional[];
  view: 'day' | 'week' | 'month';
  currentDate: string;
}

// Horário base (ex.: 07:00 às 21:00)
const HORA_INICIO = 7;
const HORA_FIM = 21;

export function GradeHorarios({ appointments, professionals, view }: GradeHorariosProps) {
  const horas = Array.from({ length: HORA_FIM - HORA_INICIO + 1 }, (_, i) => HORA_INICIO + i);
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
        Grade de Horários ({view})
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'stretch', overflowX: 'auto' }}>
        {/* Coluna de horas */}
        <Box sx={{ flex: '0 0 60px', pr: 1 }}>
          {horas.map((h) => (
            <Box key={h} sx={{ height: (60 * PIXELS_PER_MINUTE) / 2, position: 'relative' }}>
              <Typography variant="caption" sx={{ position: 'absolute', top: -6 }}>
                {h.toString().padStart(2, '0')}:00
              </Typography>
            </Box>
          ))}
        </Box>
        {/* Colunas de profissionais */}
        <Box sx={{ display: 'flex', flex: 1, gap: 2, minWidth: professionals.length * 240 }}>
          {professionals.map((p) => (
            <Box
              key={p.id}
              sx={{
                position: 'relative',
                flex: 1,
                borderLeft: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography
                variant="caption"
                fontWeight={600}
                sx={{ position: 'sticky', top: 0, display: 'block', mb: 0.5 }}
              >
                {p.name}
              </Typography>
              <Box
                sx={{
                  position: 'relative',
                  height: ((HORA_FIM - HORA_INICIO) * 60 * PIXELS_PER_MINUTE) / 2,
                }}
              >
                {appointments
                  .filter((a) => a.professional_id === p.id)
                  .map((a) => (
                    <BlocoAgendamento key={a.id} appointment={a} baseHour={HORA_INICIO} />
                  ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
}
