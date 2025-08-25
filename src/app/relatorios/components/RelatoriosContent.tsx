'use client'

import * as React from 'react'
import {
  Box,
  Typography,
  Stack,
  Button,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  Paper,
} from '@mui/material'
import AssessmentIcon from '@mui/icons-material/Assessment'
import DownloadIcon from '@mui/icons-material/Download'
import ScheduleIcon from '@mui/icons-material/Schedule'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import PeopleIcon from '@mui/icons-material/People'
import InventoryIcon from '@mui/icons-material/Inventory'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import BarChartIcon from '@mui/icons-material/BarChart'
import Link from 'next/link'

// Mock data para preview dos relatórios
const RELATORIOS_DISPONIVEIS = [
  {
    id: 'financeiro',
    titulo: 'Relatórios Financeiros',
    descricao: 'Faturamento, custos, comissões e análise de lucratividade',
    icone: <AttachMoneyIcon />,
    cor: 'primary',
    href: '/relatorios/financeiro',
    tipos: [
      'Faturamento por período',
      'Custos operacionais',
      'Comissões por profissional',
      'Análise de lucratividade',
      'Métodos de pagamento',
    ],
    ultimaAtualizacao: 'Hoje às 14:30',
  },
  {
    id: 'operacional',
    titulo: 'Relatórios Operacionais',
    descricao: 'Agendamentos, ocupação, performance e métricas operacionais',
    icone: <ScheduleIcon />,
    cor: 'success',
    href: '/relatorios/operacional',
    tipos: [
      'Taxa de ocupação',
      'Performance por profissional',
      'Cancelamentos e no-shows',
      'Tempo médio de atendimento',
      'Análise de fila',
    ],
    ultimaAtualizacao: 'Hoje às 12:15',
  },
  {
    id: 'clientes',
    titulo: 'Relatórios de Clientes',
    descricao: 'Análise de clientela, retenção e satisfação',
    icone: <PeopleIcon />,
    cor: 'info',
    href: '/relatorios/clientes',
    tipos: [
      'Novos vs. recorrentes',
      'Análise de retenção',
      'Ticket médio por cliente',
      'Satisfação (NPS)',
      'Segmentação de clientes',
    ],
    ultimaAtualizacao: 'Ontem às 18:45',
  },
  {
    id: 'estoque',
    titulo: 'Relatórios de Estoque',
    descricao: 'Produtos, movimentações e análise de estoque',
    icone: <InventoryIcon />,
    cor: 'warning',
    href: '/relatorios/estoque',
    tipos: [
      'Produtos mais vendidos',
      'Giro de estoque',
      'Produtos em falta',
      'Análise de custos',
      'Previsão de compras',
    ],
    ultimaAtualizacao: 'Hoje às 09:20',
  },
]

const RELATORIOS_RAPIDOS = [
  {
    titulo: 'Faturamento Hoje',
    valor: 'R$ 1.250,50',
    variacao: '+12%',
    cor: 'success',
    icone: <AttachMoneyIcon />,
  },
  {
    titulo: 'Agendamentos Hoje',
    valor: '18',
    variacao: '+3',
    cor: 'info',
    icone: <ScheduleIcon />,
  },
  {
    titulo: 'Taxa de Ocupação',
    valor: '75%',
    variacao: '+8%',
    cor: 'primary',
    icone: <TrendingUpIcon />,
  },
  {
    titulo: 'NPS Médio',
    valor: '8.7',
    variacao: '+0.3',
    cor: 'warning',
    icone: <PeopleIcon />,
  },
]

export function RelatoriosContent() {
  const handleExportGeral = () => {
    console.log('Exportando relatório geral...')
    // Implementar exportação geral
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
            Central de Relatórios
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Análises e relatórios detalhados do seu negócio
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExportGeral}
        >
          Exportar Geral
        </Button>
      </Stack>

      {/* Métricas Rápidas */}
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Visão Geral de Hoje
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {RELATORIOS_RAPIDOS.map((metrica) => (
          <Grid item xs={12} sm={6} md={3} key={metrica.titulo}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    sx={{
                      bgcolor: `${metrica.cor}.light`,
                      color: `${metrica.cor}.main`,
                    }}
                  >
                    {metrica.icone}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {metrica.valor}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {metrica.titulo}
                    </Typography>
                    <Chip
                      label={metrica.variacao}
                      size="small"
                      color={
                        metrica.cor as
                          | 'success'
                          | 'info'
                          | 'primary'
                          | 'warning'
                          | 'error'
                          | 'default'
                          | 'secondary'
                      }
                      variant="outlined"
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Relatórios Disponíveis */}
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Relatórios Disponíveis
      </Typography>

      <Grid container spacing={3}>
        {RELATORIOS_DISPONIVEIS.map((relatorio) => (
          <Grid item xs={12} md={6} key={relatorio.id}>
            <Card
              sx={{
                borderRadius: 3,
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardContent
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Stack
                  direction="row"
                  alignItems="flex-start"
                  spacing={2}
                  sx={{ mb: 2 }}
                >
                  <Avatar
                    sx={{
                      bgcolor: `${relatorio.cor}.light`,
                      color: `${relatorio.cor}.main`,
                      width: 56,
                      height: 56,
                    }}
                  >
                    {relatorio.icone}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {relatorio.titulo}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      paragraph
                    >
                      {relatorio.descricao}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Última atualização: {relatorio.ultimaAtualizacao}
                    </Typography>
                  </Box>
                </Stack>

                <Box sx={{ mb: 2, flex: 1 }}>
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    color="text.secondary"
                  >
                    Relatórios inclusos:
                  </Typography>
                  <Stack spacing={1}>
                    {relatorio.tipos.slice(0, 3).map((tipo, index) => (
                      <Typography
                        key={index}
                        variant="body2"
                        sx={{ display: 'flex', alignItems: 'center' }}
                      >
                        <BarChartIcon
                          fontSize="small"
                          sx={{ mr: 1, color: 'text.secondary' }}
                        />
                        {tipo}
                      </Typography>
                    ))}
                    {relatorio.tipos.length > 3 && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontStyle: 'italic' }}
                      >
                        +{relatorio.tipos.length - 3} outros relatórios...
                      </Typography>
                    )}
                  </Stack>
                </Box>

                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button
                    component={Link}
                    href={relatorio.href}
                    variant="contained"
                    color={relatorio.cor as any}
                    startIcon={<AssessmentIcon />}
                    fullWidth
                  >
                    Ver Relatórios
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Seção de Ajuda */}
      <Card sx={{ borderRadius: 3, mt: 4, bgcolor: 'grey.50' }}>
        <CardContent>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            alignItems="center"
            spacing={3}
          >
            <Avatar sx={{ bgcolor: 'info.main', width: 64, height: 64 }}>
              <AssessmentIcon fontSize="large" />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" gutterBottom>
                Precisa de ajuda com os relatórios?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Nossa central de relatórios oferece análises detalhadas sobre
                todos os aspectos do seu negócio. Cada relatório pode ser
                personalizado por período, filtrado por critérios específicos e
                exportado em diversos formatos.
              </Typography>
            </Box>
            <Button variant="contained" color="info">
              Ver Documentação
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
