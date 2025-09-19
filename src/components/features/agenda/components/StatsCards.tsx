'use client';
import { Grid, Paper, Typography } from '@mui/material';
import type { Appointment } from '@/app/(protected)/agenda/page';

interface Props {
  appointments: Appointment[];
}

export function StatsCards({ appointments }: Props) {
  const total = appointments.length;
  const confirmed = appointments.filter((a) => a.status === 'confirmed').length;
  const completed = appointments.filter((a) => a.status === 'completed').length;
  const revenue = appointments
    .filter((a) => a.status === 'completed')
    .reduce((s, a) => s + (a.price || 0), 0);
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {[
        { label: 'Total', value: total },
        { label: 'Confirmados', value: confirmed },
        { label: 'Concluídos', value: completed },
        {
          label: 'Receita',
          value: revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        },
      ].map((card) => (
        <Grid item xs={6} sm={3} key={card.label}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              textAlign: 'center',
              borderRadius: 2.5,
              transition: 'background .15s, border-color .15s',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.03)',
                borderColor: 'rgba(255,255,255,0.2)',
              },
            }}
          >
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              {card.label}
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {card.value}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
