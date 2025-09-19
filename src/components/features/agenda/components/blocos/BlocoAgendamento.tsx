'use client';
import { Paper, Typography, Tooltip } from '@mui/material';
import type { Appointment } from '@/app/(protected)/agenda/page';
import { PIXELS_PER_MINUTE } from '../Agenda';

interface Props {
  appointment: Appointment;
  baseHour: number;
}

function parseMinutes(time: string) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function BlocoAgendamento({ appointment, baseHour }: Props) {
  const startMin = parseMinutes(appointment.start_time);
  const endMin = parseMinutes(appointment.end_time);
  const base = baseHour * 60;
  const top = (startMin - base) * PIXELS_PER_MINUTE;
  const height = (endMin - startMin) * PIXELS_PER_MINUTE;
  const statusColorMap: Record<Appointment['status'], string> = {
    scheduled: 'info.main',
    confirmed: 'success.main',
    completed: 'primary.main',
    canceled: 'warning.main',
    no_show: 'error.main',
  };
  const borderColor = statusColorMap[appointment.status] || 'primary.main';
  return (
    <Tooltip title={appointment.customer_name} placement="right" arrow>
      <Paper
        sx={{
          position: 'absolute',
          top,
          height,
          left: 4,
          right: 4,
          p: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          backgroundColor: 'background.paper',
          borderRadius: 2.5,
          border: '1px solid',
          borderColor: 'divider',
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.05)',
            cursor: 'pointer',
          },
          '&:before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            backgroundColor: borderColor,
          },
          overflow: 'hidden',
        }}
        elevation={0}
      >
        <Typography variant="caption" fontWeight={600} noWrap>
          {appointment.customer_name}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {appointment.service_name}
        </Typography>
      </Paper>
    </Tooltip>
  );
}
