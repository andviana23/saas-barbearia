'use client';

import * as React from 'react';
import { Box, Stack, Paper, Typography, Divider, Snackbar, Alert } from '@mui/material';
import PageHeader from '@/components/ui/PageHeader';
import FormRow from '@/components/ui/FormRow';
import DSButton from '@/components/ui/DSButton';
import DSTextField from '@/components/ui/DSTextField';
import DSSelect from '@/components/ui/DSSelect';
import DSDateTime from '@/components/ui/DSDateTime';
import DSTable from '@/components/ui/DSTable';
import DSDialog from '@/components/ui/DSDialog';
import EmptyState from '@/components/ui/EmptyState';
import dayjs, { Dayjs } from 'dayjs';

export default function DesignSystemShowcase() {
  const [snack, setSnack] = React.useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [select, setSelect] = React.useState('basic');
  const [date, setDate] = React.useState<Dayjs | null>(dayjs());
  const [name, setName] = React.useState('');
  const rows = [
    { Mês: 'Jan', Usuários: 9800, Conversões: 320 },
    { Mês: 'Fev', Usuários: 10400, Conversões: 355 },
    { Mês: 'Mar', Usuários: 8700, Conversões: 289 },
  ];

  return (
    <Box p={3}>
      <PageHeader title="Catálogo do Design System" subtitle="Componentes base e padrões de uso" />
      <Stack gap={3}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h3" gutterBottom>
            Botões
          </Typography>
          <Stack direction="row" gap={1.5} flexWrap="wrap">
            <DSButton onClick={() => setSnack('Ação principal')}>Primário</DSButton>
            <DSButton variant="outlined">Secundário</DSButton>
            <DSButton color="success">Sucesso</DSButton>
            <DSButton color="error">Erro</DSButton>
            <DSButton color="info">Info</DSButton>
            <DSButton color="warning">Aviso</DSButton>
          </Stack>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h3" gutterBottom>
            Form Inputs
          </Typography>
          <Stack gap={2}>
            <FormRow>
              <DSTextField
                label="Nome do cliente"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <DSSelect
                id="tipo-plano"
                label="Plano"
                value={select}
                onChange={(e) => setSelect(e.target.value.toString())}
                options={[
                  { label: 'Básico', value: 'basic' },
                  { label: 'Pro', value: 'pro' },
                  { label: 'Enterprise', value: 'ent' },
                ]}
              />
              <DSDateTime label="Agendar" value={date} onChange={setDate} />
            </FormRow>
            <Typography variant="caption" color="text.secondary">
              Acessibilidade: labels, foco visível e navegação por teclado habilitados.
            </Typography>
          </Stack>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h3" gutterBottom>
            Tabela
          </Typography>
          <DSTable
            columns={[
              { key: 'Mês', label: 'Mês' },
              { key: 'Usuários', label: 'Usuários' },
              { key: 'Conversões', label: 'Conversões' },
            ]}
            data={rows}
          />
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h3" gutterBottom>
            Dialog
          </Typography>
          <DSButton onClick={() => setDialogOpen(true)}>Abrir dialog</DSButton>
          <DSDialog
            open={dialogOpen}
            title="Confirmação"
            onClose={() => setDialogOpen(false)}
            onConfirm={() => {
              setSnack('Confirmado');
              setDialogOpen(false);
            }}
          >
            Tem certeza que deseja confirmar esta ação?
          </DSDialog>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h3" gutterBottom>
            Empty State
          </Typography>
          <EmptyState
            title="Sem registros"
            description="Quando não há dados para exibir, mostre um zero-state claro com ação."
            action={{
              label: 'Adicionar item',
              onClick: () => setSnack('Adicionar'),
            }}
          />
        </Paper>

        <Divider />
        <Typography variant="body2" color="text.secondary">
          Padrões de uso: utilize <code>sx</code> apenas para ajustes locais; tokens de tema definem
          tipografia, cores e espaçamentos globais.
        </Typography>
      </Stack>

      <Snackbar
        open={!!snack}
        autoHideDuration={2000}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" sx={{ width: '100%' }}>
          {snack}
        </Alert>
      </Snackbar>
    </Box>
  );
}
