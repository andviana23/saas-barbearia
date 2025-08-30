'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  TrendingUp,
  AttachMoney,
  Receipt,
  Person,
  AccountBalance,
  Schedule,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';

import { PageHeader, DSButton, DSTable } from '@/components/ui';
import { useDashboardFinanceiro, useTransacoes, useTransacaoHelpers } from '@/hooks/use-transacoes';
import { useCurrentUnit } from '@/hooks/use-current-unit';

export default function DashboardFinanceiroPage() {
  const [periodo, setPeriodo] = useState('hoje'); // 'hoje', 'semana', 'mes'

  const { currentUnit } = useCurrentUnit();
  const { data: dashboard, isLoading } = useDashboardFinanceiro();
  const { data: transacoesRecentes } = useTransacoes({
    dataInicio: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  const { formatarValor, formatarData } = useTransacaoHelpers();

  if (!currentUnit) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Selecione uma unidade</Typography>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box>
        <PageHeader title="Dashboard Financeiro" subtitle="Visão geral das finanças da unidade" />
        <LinearProgress sx={{ mt: 2 }} />
      </Box>
    );
  }

  const dadosHoje = dashboard?.data?.hoje;
  const dadosMes = dashboard?.data?.mes;

  // Calcular crescimento
  const calcularCrescimento = (atual: number, anterior: number) => {
    if (anterior === 0) return atual > 0 ? 100 : 0;
    return ((atual - anterior) / anterior) * 100;
  };

  // KPIs do período selecionado
  const kpis = periodo === 'hoje' ? dadosHoje : dadosMes;

  return (
    <Box>
      <PageHeader
        title="Dashboard Financeiro"
        subtitle={`Visão geral das finanças - ${currentUnit.nome}`}
      />

      <Box display="flex" justifyContent="flex-end" mb={2}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Período</InputLabel>
          <Select value={periodo} label="Período" onChange={(e) => setPeriodo(e.target.value)}>
            <MenuItem value="hoje">Hoje</MenuItem>
            <MenuItem value="semana">Esta Semana</MenuItem>
            <MenuItem value="mes">Este Mês</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* KPIs */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Receita */}
        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Receita
                  </Typography>
                  <Typography variant="h4">{formatarValor(kpis?.totalFaturamento || 0)}</Typography>
                  <Box display="flex" alignItems="center" mt={1}>
                    {kpis?.totalFaturamento && dadosMes?.totalFaturamento ? (
                      <>
                        {calcularCrescimento(kpis.totalFaturamento, dadosMes.totalFaturamento) >
                        0 ? (
                          <ArrowUpward color="success" fontSize="small" />
                        ) : (
                          <ArrowDownward color="error" fontSize="small" />
                        )}
                        <Typography
                          variant="body2"
                          color={
                            calcularCrescimento(kpis.totalFaturamento, dadosMes.totalFaturamento) >
                            0
                              ? 'success.main'
                              : 'error.main'
                          }
                          ml={0.5}
                        >
                          {Math.abs(
                            calcularCrescimento(kpis.totalFaturamento, dadosMes.totalFaturamento),
                          ).toFixed(1)}
                          %
                        </Typography>
                      </>
                    ) : null}
                  </Box>
                </Box>
                <AttachMoney color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Clientes */}
        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Clientes
                  </Typography>
                  <Typography variant="h4">{kpis?.totalTransacoes || 0}</Typography>
                  <Box display="flex" alignItems="center" mt={1}>
                    {kpis?.totalTransacoes && dadosMes?.totalTransacoes ? (
                      <>
                        {calcularCrescimento(kpis.totalTransacoes, dadosMes.totalTransacoes) > 0 ? (
                          <ArrowUpward color="success" fontSize="small" />
                        ) : (
                          <ArrowDownward color="error" fontSize="small" />
                        )}
                        <Typography
                          variant="body2"
                          color={
                            calcularCrescimento(kpis.totalTransacoes, dadosMes.totalTransacoes) > 0
                              ? 'success.main'
                              : 'error.main'
                          }
                          ml={0.5}
                        >
                          {Math.abs(
                            calcularCrescimento(kpis.totalTransacoes, dadosMes.totalTransacoes),
                          ).toFixed(1)}
                          %
                        </Typography>
                      </>
                    ) : null}
                  </Box>
                </Box>
                <Person color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Serviços */}
        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Serviços
                  </Typography>
                  <Typography variant="h4">{kpis?.totalTransacoes || 0}</Typography>
                  <Box display="flex" alignItems="center" mt={1}>
                    {kpis?.totalTransacoes && dadosMes?.totalTransacoes ? (
                      <>
                        {calcularCrescimento(kpis.totalTransacoes, dadosMes.totalTransacoes) > 0 ? (
                          <ArrowUpward color="success" fontSize="small" />
                        ) : (
                          <ArrowDownward color="error" fontSize="small" />
                        )}
                        <Typography
                          variant="body2"
                          color={
                            calcularCrescimento(kpis.totalTransacoes, dadosMes.totalTransacoes) > 0
                              ? 'success.main'
                              : 'error.main'
                          }
                          ml={0.5}
                        >
                          {Math.abs(
                            calcularCrescimento(kpis.totalTransacoes, dadosMes.totalTransacoes),
                          ).toFixed(1)}
                          %
                        </Typography>
                      </>
                    ) : null}
                  </Box>
                </Box>
                <Receipt color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Ticket Médio */}
        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Ticket Médio
                  </Typography>
                  <Typography variant="h4">{formatarValor(kpis?.ticketMedio || 0)}</Typography>
                  <Box display="flex" alignItems="center" mt={1}>
                    {kpis?.ticketMedio && dadosMes?.ticketMedio ? (
                      <>
                        {calcularCrescimento(kpis.ticketMedio, dadosMes.ticketMedio) > 0 ? (
                          <ArrowUpward color="success" fontSize="small" />
                        ) : (
                          <ArrowDownward color="error" fontSize="small" />
                        )}
                        <Typography
                          variant="body2"
                          color={
                            calcularCrescimento(kpis.ticketMedio, dadosMes.ticketMedio) > 0
                              ? 'success.main'
                              : 'error.main'
                          }
                          ml={0.5}
                        >
                          {Math.abs(
                            calcularCrescimento(kpis.ticketMedio, dadosMes.ticketMedio),
                          ).toFixed(1)}
                          %
                        </Typography>
                      </>
                    ) : null}
                  </Box>
                </Box>
                <AccountBalance color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Transações Recentes */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Transações Recentes</Typography>
            <DSButton variant="outlined" size="small">
              Ver Todas
            </DSButton>
          </Box>

          {transacoesRecentes?.data && transacoesRecentes.data.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Data</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Serviço</TableCell>
                    <TableCell>Valor</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transacoesRecentes.data.slice(0, 5).map((transacao) => (
                    <TableRow key={transacao.id}>
                      <TableCell>{formatarData(transacao.created_at)}</TableCell>
                      <TableCell>{transacao.cliente?.nome || 'N/A'}</TableCell>
                      <TableCell>{transacao.servico?.nome || 'N/A'}</TableCell>
                      <TableCell>{formatarValor(transacao.valor)}</TableCell>
                      <TableCell>
                        <Chip
                          label={transacao.status}
                          color={transacao.status === 'confirmado' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box textAlign="center" py={3}>
              <Typography color="textSecondary">Nenhuma transação encontrada</Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
