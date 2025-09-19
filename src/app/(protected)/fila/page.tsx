'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Stack,
  Avatar,
  IconButton,
  Divider,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Schedule,
  Person,
  AccessTime,
  CheckCircle,
  Cancel,
  PlayArrow,
  Pause,
  SkipNext,
  Add,
  Refresh,
} from '@mui/icons-material';
import PageHeader from '@/components/ui/PageHeader';

interface ClienteFila {
  id: string;
  nome: string;
  servico: string;
  profissional: string;
  tempoEspera: number; // em minutos
  tempoEstimado: number; // em minutos
  status: 'aguardando' | 'atendimento' | 'finalizado' | 'cancelado';
  prioridade: 'normal' | 'alta';
  avatar?: string;
  observacoes?: string;
}

export default function FilaPage() {
  const [clientes] = useState<ClienteFila[]>([
    {
      id: '1',
      nome: 'João Silva',
      servico: 'Corte + Barba',
      profissional: 'Carlos Santos',
      tempoEspera: 15,
      tempoEstimado: 45,
      status: 'atendimento',
      prioridade: 'normal',
    },
    {
      id: '2',
      nome: 'Pedro Costa',
      servico: 'Corte Simples',
      profissional: 'Ana Lima',
      tempoEspera: 5,
      tempoEstimado: 30,
      status: 'aguardando',
      prioridade: 'alta',
    },
    {
      id: '3',
      nome: 'Maria Santos',
      servico: 'Escova + Hidratação',
      profissional: 'Beatriz Oliveira',
      tempoEspera: 0,
      tempoEstimado: 60,
      status: 'aguardando',
      prioridade: 'normal',
    },
    {
      id: '4',
      nome: 'Roberto Lima',
      servico: 'Barba',
      profissional: 'Carlos Santos',
      tempoEspera: 0,
      tempoEstimado: 20,
      status: 'aguardando',
      prioridade: 'normal',
    },
  ]);

  const clientesAguardando = clientes.filter((c) => c.status === 'aguardando');
  const clientesAtendimento = clientes.filter((c) => c.status === 'atendimento');
  const tempoMedioEspera =
    clientesAguardando.length > 0
      ? Math.round(
          clientesAguardando.reduce((sum, c) => sum + c.tempoEspera, 0) / clientesAguardando.length,
        )
      : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aguardando':
        return 'warning';
      case 'atendimento':
        return 'info';
      case 'finalizado':
        return 'success';
      case 'cancelado':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'aguardando':
        return 'Aguardando';
      case 'atendimento':
        return 'Em Atendimento';
      case 'finalizado':
        return 'Finalizado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return 'Desconhecido';
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    return prioridade === 'alta' ? 'error' : 'default';
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <PageHeader
        title="Fila de Atendimento"
        subtitle="Gerencie a fila de clientes e organize o atendimento"
        actions={
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" startIcon={<Refresh />} size="small">
              Atualizar
            </Button>
            <Button variant="contained" startIcon={<Add />} size="small">
              Adicionar Cliente
            </Button>
          </Stack>
        }
      />

      {/* Resumo da Fila */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Schedule color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6" color="warning.main">
                  Na Fila
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {clientesAguardando.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Clientes aguardando
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PlayArrow color="info" sx={{ mr: 1 }} />
                <Typography variant="h6" color="info.main">
                  Em Atendimento
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {clientesAtendimento.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sendo atendidos
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccessTime color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" color="primary.main">
                  Tempo Médio
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {tempoMedioEspera} min
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tempo de espera
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Person color="success" sx={{ mr: 1 }} />
                <Typography variant="h6" color="success.main">
                  Total do Dia
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {clientes.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Clientes atendidos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alertas */}
      {clientesAguardando.some((c) => c.tempoEspera > 30) && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Alguns clientes estão aguardando há mais de 30 minutos. Considere reorganizar a fila.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Clientes em Atendimento */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <PlayArrow color="info" sx={{ mr: 1 }} />
                Em Atendimento
              </Typography>

              {clientesAtendimento.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Pause sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Nenhum atendimento em andamento
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Os atendimentos em andamento aparecerão aqui
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {clientesAtendimento.map((cliente) => (
                    <Card key={cliente.id} variant="outlined">
                      <CardContent>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 2,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2, bgcolor: 'info.main' }}>
                              {cliente.nome.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {cliente.nome}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {cliente.servico}
                              </Typography>
                            </Box>
                          </Box>
                          <Chip
                            label={getStatusLabel(cliente.status)}
                            color={getStatusColor(cliente.status)}
                            size="small"
                          />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Profissional: {cliente.profissional}
                          </Typography>
                          <LinearProgress
                            variant="indeterminate"
                            color="info"
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </Box>

                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <IconButton size="small" color="success">
                            <CheckCircle />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <Cancel />
                          </IconButton>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Fila de Espera */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <Schedule color="warning" sx={{ mr: 1 }} />
                Fila de Espera
              </Typography>

              {clientesAguardando.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Schedule sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Fila vazia
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Não há clientes aguardando atendimento
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {clientesAguardando.map((cliente, index) => (
                    <Card key={cliente.id} variant="outlined">
                      <CardContent>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 2,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box
                              sx={{
                                minWidth: 32,
                                height: 32,
                                borderRadius: '50%',
                                bgcolor: 'primary.main',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 2,
                                fontSize: '0.875rem',
                                fontWeight: 'bold',
                              }}
                            >
                              {index + 1}
                            </Box>
                            <Avatar sx={{ mr: 2, bgcolor: 'warning.main' }}>
                              {cliente.nome.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {cliente.nome}
                                {cliente.prioridade === 'alta' && (
                                  <Chip
                                    label="Prioridade"
                                    color="error"
                                    size="small"
                                    sx={{ ml: 1 }}
                                  />
                                )}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {cliente.servico}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Profissional: {cliente.profissional}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Tempo estimado: {cliente.tempoEstimado} min
                          </Typography>
                          {cliente.tempoEspera > 0 && (
                            <Typography variant="body2" color="warning.main">
                              Aguardando há {cliente.tempoEspera} min
                            </Typography>
                          )}
                        </Box>

                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <IconButton size="small" color="primary">
                            <PlayArrow />
                          </IconButton>
                          <IconButton size="small" color="info">
                            <SkipNext />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <Cancel />
                          </IconButton>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
