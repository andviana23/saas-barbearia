'use client'

import * as React from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useCurrentUnit } from '@/hooks/use-current-unit'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
  LinearProgress,
  IconButton,
  Paper,
  Divider,
} from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import PeopleIcon from '@mui/icons-material/People'
import ScheduleIcon from '@mui/icons-material/Schedule'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import InventoryIcon from '@mui/icons-material/Inventory'
import RefreshIcon from '@mui/icons-material/Refresh'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import QueueIcon from '@mui/icons-material/Queue'
import StarIcon from '@mui/icons-material/Star'

// Mock data - substituir por dados reais
const MOCK_KPIS = {
  faturamento: {
    hoje: 1250.5,
    meta_diaria: 1500.0,
    mes_atual: 24680.75,
    mes_anterior: 22150.3,
    variacao_mes: 11.4,
  },
  agendamentos: {
    hoje: 18,
    total_semana: 89,
    cancelamentos_hoje: 2,
    ocupacao_hoje: 75, // percentual
  },
  clientes: {
    novos_mes: 45,
    recorrentes: 156,
    total_ativos: 892,
    nps_medio: 8.7,
  },
  operacional: {
    fila_atual: 3,
    tempo_medio_atendimento: 45, // minutos
    profissionais_ativos: 4,
    produtos_estoque_baixo: 7,
  },
  top_servicos: [
    { nome: 'Corte Masculino', quantidade: 156, receita: 5460.0 },
    { nome: 'Corte + Barba', quantidade: 89, receita: 4895.0 },
    { nome: 'Barba', quantidade: 67, receita: 1675.0 },
  ],
  top_profissionais: [
    { nome: 'João Silva', agendamentos: 45, receita: 2250.0, avaliacao: 4.8 },
    { nome: 'Maria Santos', agendamentos: 38, receita: 1900.0, avaliacao: 4.9 },
    { nome: 'Pedro Costa', agendamentos: 32, receita: 1600.0, avaliacao: 4.7 },
  ],
}

export default function DashboardContent() {
  const { user } = useAuth()
  const { currentUnit } = useCurrentUnit()
  const [loading, setLoading] = React.useState(false)

  const handleRefresh = async () => {
    setLoading(true)
    // Simular loading
    setTimeout(() => setLoading(false), 1000)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const getVariationIcon = (variation: number) => {
    return variation >= 0 ? (
      <TrendingUpIcon color="success" fontSize="small" />
    ) : (
      <TrendingDownIcon color="error" fontSize="small" />
    )
  }

  const getVariationColor = (variation: number) => {
    return variation >= 0 ? 'success.main' : 'error.main'
  }

  return (
    <Box sx={{ py: 3 }}>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" gutterBottom sx={{ mb: 0.5 }}>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Olá, {user?.nome || 'Usuário'}! Bem-vindo ao{' '}
            {currentUnit?.nome || 'Trato'}
          </Typography>
        </Box>
        <IconButton onClick={handleRefresh} disabled={loading}>
          <RefreshIcon />
        </IconButton>
      </Stack>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* KPIs Principais */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Faturamento Hoje */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: 'primary.main',
                    borderRadius: 2,
                    color: 'white',
                  }}
                >
                  <AttachMoneyIcon />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {formatCurrency(MOCK_KPIS.faturamento.hoje)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Faturamento hoje
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={
                      (MOCK_KPIS.faturamento.hoje /
                        MOCK_KPIS.faturamento.meta_diaria) *
                      100
                    }
                    sx={{ mt: 1, height: 6, borderRadius: 3 }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Agendamentos Hoje */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: 'success.main',
                    borderRadius: 2,
                    color: 'white',
                  }}
                >
                  <ScheduleIcon />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {MOCK_KPIS.agendamentos.hoje}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Agendamentos hoje
                  </Typography>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ mt: 1 }}
                  >
                    <Chip
                      label={`${MOCK_KPIS.agendamentos.ocupacao_hoje}% ocupação`}
                      size="small"
                      color="success"
                    />
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Fila Atual */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: 'warning.main',
                    borderRadius: 2,
                    color: 'white',
                  }}
                >
                  <QueueIcon />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {MOCK_KPIS.operacional.fila_atual}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Clientes na fila
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    ~{MOCK_KPIS.operacional.tempo_medio_atendimento}min por
                    atendimento
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Novos Clientes */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: 'info.main',
                    borderRadius: 2,
                    color: 'white',
                  }}
                >
                  <PeopleIcon />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {MOCK_KPIS.clientes.novos_mes}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Novos clientes (mês)
                  </Typography>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={0.5}
                    sx={{ mt: 1 }}
                  >
                    <StarIcon fontSize="small" color="warning" />
                    <Typography variant="body2" color="text.secondary">
                      NPS: {MOCK_KPIS.clientes.nps_medio}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Comparativo Mensal */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Faturamento Mensal
              </Typography>

              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Mês atual
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {formatCurrency(MOCK_KPIS.faturamento.mes_atual)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Mês anterior
                  </Typography>
                  <Typography variant="body1">
                    {formatCurrency(MOCK_KPIS.faturamento.mes_anterior)}
                  </Typography>
                </Box>

                <Stack direction="row" alignItems="center" spacing={1}>
                  {getVariationIcon(MOCK_KPIS.faturamento.variacao_mes)}
                  <Typography
                    variant="body1"
                    color={getVariationColor(
                      MOCK_KPIS.faturamento.variacao_mes
                    )}
                    sx={{ fontWeight: 600 }}
                  >
                    {MOCK_KPIS.faturamento.variacao_mes > 0 ? '+' : ''}
                    {MOCK_KPIS.faturamento.variacao_mes}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    vs mês anterior
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Serviços */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Serviços (Mês)
              </Typography>

              <Stack spacing={2}>
                {MOCK_KPIS.top_servicos.map((servico, index) => (
                  <Box key={servico.nome}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600 }}
                        >
                          #{index + 1} {servico.nome}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {servico.quantidade} agendamentos
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {formatCurrency(servico.receita)}
                      </Typography>
                    </Stack>
                    {index < MOCK_KPIS.top_servicos.length - 1 && (
                      <Divider sx={{ mt: 1 }} />
                    )}
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Profissionais */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Profissionais (Mês)
              </Typography>

              <Stack spacing={2}>
                {MOCK_KPIS.top_profissionais.map((profissional, index) => (
                  <Box key={profissional.nome}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600 }}
                        >
                          #{index + 1} {profissional.nome}
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="body2" color="text.secondary">
                            {profissional.agendamentos} agendamentos
                          </Typography>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={0.5}
                          >
                            <StarIcon
                              fontSize="small"
                              sx={{ color: 'warning.main' }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {profissional.avaliacao}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {formatCurrency(profissional.receita)}
                      </Typography>
                    </Stack>
                    {index < MOCK_KPIS.top_profissionais.length - 1 && (
                      <Divider sx={{ mt: 1 }} />
                    )}
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Alertas e Ações Rápidas */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Alertas e Ações Rápidas
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, bgcolor: 'error.light', borderRadius: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <InventoryIcon sx={{ color: 'error.main' }} />
                      <Box>
                        <Typography variant="h6" color="error.main">
                          {MOCK_KPIS.operacional.produtos_estoque_baixo}
                        </Typography>
                        <Typography variant="body2" color="error.main">
                          Produtos com estoque baixo
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 2 }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CalendarTodayIcon sx={{ color: 'warning.main' }} />
                      <Box>
                        <Typography variant="h6" color="warning.main">
                          {MOCK_KPIS.agendamentos.cancelamentos_hoje}
                        </Typography>
                        <Typography variant="body2" color="warning.main">
                          Cancelamentos hoje
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    sx={{ p: 2, bgcolor: 'success.light', borderRadius: 2 }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <PeopleIcon sx={{ color: 'success.main' }} />
                      <Box>
                        <Typography variant="h6" color="success.main">
                          {MOCK_KPIS.operacional.profissionais_ativos}
                        </Typography>
                        <Typography variant="body2" color="success.main">
                          Profissionais ativos
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <ScheduleIcon sx={{ color: 'info.main' }} />
                      <Box>
                        <Typography variant="h6" color="info.main">
                          {MOCK_KPIS.agendamentos.total_semana}
                        </Typography>
                        <Typography variant="body2" color="info.main">
                          Agendamentos esta semana
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
