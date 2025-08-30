'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  Send as SendIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';

import { useMetricasNotificacoes } from '@/hooks/use-notificacoes';

export default function MetricasTab() {
  const [periodo, setPeriodo] = useState({
    dataInicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dias atrás
    dataFim: new Date().toISOString().split('T')[0], // hoje
  });

  const {
    data: metricas,
    isLoading,
    refetch,
  } = useMetricasNotificacoes(periodo.dataInicio, periodo.dataFim);

  const handlePeriodoChange = (field: string, value: string) => {
    setPeriodo((prev) => ({ ...prev, [field]: value }));
  };

  const handleBuscar = () => {
    refetch();
  };

  const formatarPercentual = (valor: number) => {
    return `${Math.round(valor * 100) / 100}%`;
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Métricas de Notificações</Typography>
      </Box>

      {/* Filtro de Período */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Período de Análise
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Data Início"
                type="date"
                value={periodo.dataInicio}
                onChange={(e) => handlePeriodoChange('dataInicio', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Data Fim"
                type="date"
                value={periodo.dataFim}
                onChange={(e) => handlePeriodoChange('dataFim', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button fullWidth variant="contained" onClick={handleBuscar} disabled={isLoading}>
                {isLoading ? 'Carregando...' : 'Buscar'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {isLoading ? (
        <Box py={4}>
          <LinearProgress />
          <Typography variant="body2" textAlign="center" mt={2}>
            Calculando métricas...
          </Typography>
        </Box>
      ) : (
        <>
          {/* Resumo Geral */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" color="primary">
                        {metricas?.data?.resumo?.total || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Enviadas
                      </Typography>
                    </Box>
                    <SendIcon color="primary" sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" color="success.main">
                        {metricas?.data?.resumo?.enviadas || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Entregues
                      </Typography>
                    </Box>
                    <CheckIcon color="success" sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" color="warning.main">
                        {metricas?.data?.resumo?.pendentes || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pendentes
                      </Typography>
                    </Box>
                    <ScheduleIcon color="warning" sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" color="error.main">
                        {metricas?.data?.resumo?.erros || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Erros
                      </Typography>
                    </Box>
                    <ErrorIcon color="error" sx={{ fontSize: 40 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Taxa de Sucesso */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Taxa de Sucesso
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Box flex={1}>
                  <LinearProgress
                    variant="determinate"
                    value={metricas?.data?.resumo?.taxaSuccesso || 0}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
                <Typography variant="h6" color="primary">
                  {formatarPercentual(metricas?.data?.resumo?.taxaSuccesso || 0)}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Grid container spacing={3}>
            {/* Por Canal */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Performance por Canal
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Canal</TableCell>
                          <TableCell align="right">Total</TableCell>
                          <TableCell align="right">Enviadas</TableCell>
                          <TableCell align="right">Erros</TableCell>
                          <TableCell align="right">Taxa</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {metricas?.data?.porCanal?.map((canal: any) => (
                          <TableRow key={canal.nome}>
                            <TableCell>
                              <Chip label={canal.nome} size="small" variant="outlined" />
                            </TableCell>
                            <TableCell align="right">{canal.total}</TableCell>
                            <TableCell align="right">{canal.enviadas}</TableCell>
                            <TableCell align="right">{canal.erros}</TableCell>
                            <TableCell align="right">
                              {canal.total > 0
                                ? formatarPercentual((canal.enviadas / canal.total) * 100)
                                : '0%'}
                            </TableCell>
                          </TableRow>
                        )) || []}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Por Template */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Performance por Template
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Template</TableCell>
                          <TableCell align="right">Total</TableCell>
                          <TableCell align="right">Enviadas</TableCell>
                          <TableCell align="right">Taxa</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {metricas?.data?.porTemplate?.map((template: any) => (
                          <TableRow key={template.nome}>
                            <TableCell>
                              <Typography variant="body2" noWrap>
                                {template.nome}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">{template.total}</TableCell>
                            <TableCell align="right">{template.enviadas}</TableCell>
                            <TableCell align="right">
                              {template.total > 0
                                ? formatarPercentual((template.enviadas / template.total) * 100)
                                : '0%'}
                            </TableCell>
                          </TableRow>
                        )) || []}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}
