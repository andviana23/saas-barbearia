'use client';

import * as React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Button,
  Chip,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Divider,
  Avatar,
  LinearProgress,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import DownloadIcon from '@mui/icons-material/Download';
import FilterListIcon from '@mui/icons-material/FilterList';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PaidIcon from '@mui/icons-material/Paid';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ReceiptIcon from '@mui/icons-material/Receipt';

const MOCK_DATA = {
  resumo: {
    faturamento_total: 45680.75,
    custos_totais: 12340.5,
    lucro_bruto: 33340.25,
    margem_lucro: 73.0,
    variacao_mes_anterior: 12.5,
  },
  faturamento_diario: [
    { data: '01/08', valor: 1250.5 },
    { data: '02/08', valor: 1480.25 },
    { data: '03/08', valor: 1320.75 },
    { data: '04/08', valor: 1650.0 },
    { data: '05/08', valor: 1180.5 },
    { data: '06/08', valor: 1890.25 },
    { data: '07/08', valor: 2120.75 },
  ],
  metodos_pagamento: [
    {
      metodo: 'Cartão de Crédito',
      valor: 18560.3,
      percentual: 40.6,
      icone: <CreditCardIcon />,
    },
    {
      metodo: 'Dinheiro',
      valor: 13704.23,
      percentual: 30.0,
      icone: <PaidIcon />,
    },
    {
      metodo: 'PIX',
      valor: 9136.15,
      percentual: 20.0,
      icone: <AccountBalanceIcon />,
    },
    {
      metodo: 'Cartão de Débito',
      valor: 4280.07,
      percentual: 9.4,
      icone: <CreditCardIcon />,
    },
  ],
  custos_categoria: [
    { categoria: 'Produtos', valor: 5680.25, percentual: 46.0 },
    { categoria: 'Salários', valor: 4200.0, percentual: 34.0 },
    { categoria: 'Aluguel', valor: 1500.0, percentual: 12.2 },
    { categoria: 'Energia', valor: 680.5, percentual: 5.5 },
    { categoria: 'Outros', valor: 279.75, percentual: 2.3 },
  ],
  comissoes: [
    {
      profissional: 'João Silva',
      vendas: 12560.0,
      comissao_percentual: 15,
      valor_comissao: 1884.0,
    },
    {
      profissional: 'Maria Santos',
      vendas: 10240.5,
      comissao_percentual: 15,
      valor_comissao: 1536.08,
    },
    {
      profissional: 'Pedro Costa',
      vendas: 8950.25,
      comissao_percentual: 12,
      valor_comissao: 1074.03,
    },
    {
      profissional: 'Ana Oliveira',
      vendas: 6780.3,
      comissao_percentual: 12,
      valor_comissao: 813.64,
    },
  ],
};

export function RelatorioFinanceiroContent() {
  const [periodo, setPeriodo] = React.useState('mes_atual');
  const [dataInicio, setDataInicio] = React.useState<Date | null>(new Date());
  const [dataFim, setDataFim] = React.useState<Date | null>(new Date());

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleExport = () => {
    console.log('Exportando relatório financeiro...');
  };

  const getVariationColor = (variation: number) => {
    return variation >= 0 ? 'success.main' : 'error.main';
  };

  const getVariationIcon = (variation: number) => {
    return variation >= 0 ? (
      <TrendingUpIcon fontSize="small" />
    ) : (
      <TrendingDownIcon fontSize="small" />
    );
  };

  // Handlers compatíveis com AdapterDateFns (Date | null)
  const handleChangeDataInicio = (value: Date | null) => {
    setDataInicio(value);
  };
  const handleChangeDataFim = (value: Date | null) => {
    setDataFim(value);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box sx={{ py: 3 }}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ mb: 0.5 }}>
              Relatórios Financeiros
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Análise detalhada de faturamento, custos e lucratividade
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleExport}>
            Exportar Relatório
          </Button>
        </Stack>

        {/* Filtros */}
        <Card sx={{ borderRadius: 3, mb: 3 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <FilterListIcon color="primary" />
              <Typography variant="h6">Filtros</Typography>
            </Stack>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Período</InputLabel>
                  <Select
                    value={periodo}
                    label="Período"
                    onChange={(e) => setPeriodo(e.target.value)}
                  >
                    <MenuItem value="hoje">Hoje</MenuItem>
                    <MenuItem value="semana">Esta Semana</MenuItem>
                    <MenuItem value="mes_atual">Mês Atual</MenuItem>
                    <MenuItem value="mes_anterior">Mês Anterior</MenuItem>
                    <MenuItem value="trimestre">Trimestre</MenuItem>
                    <MenuItem value="personalizado">Personalizado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {periodo === 'personalizado' && (
                <>
                  <Grid item xs={12} sm={6} md={3}>
                    <DatePicker
                      label="Data Início"
                      value={dataInicio}
                      onChange={(value) => handleChangeDataInicio(value as Date | null)}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <DatePicker
                      label="Data Fim"
                      value={dataFim}
                      onChange={(value) => handleChangeDataFim(value as Date | null)}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </CardContent>
        </Card>

        {/* Resumo Financeiro */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                    <AttachMoneyIcon />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {formatCurrency(MOCK_DATA.resumo.faturamento_total)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Faturamento Total
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1 }}>
                      {getVariationIcon(MOCK_DATA.resumo.variacao_mes_anterior)}
                      <Typography
                        variant="caption"
                        color={getVariationColor(MOCK_DATA.resumo.variacao_mes_anterior)}
                      >
                        +{MOCK_DATA.resumo.variacao_mes_anterior}% vs mês anterior
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'error.main', width: 56, height: 56 }}>
                    <ReceiptIcon />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {formatCurrency(MOCK_DATA.resumo.custos_totais)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Custos Totais
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(
                        (MOCK_DATA.resumo.custos_totais / MOCK_DATA.resumo.faturamento_total) *
                        100
                      ).toFixed(1)}
                      % do faturamento
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                    <TrendingUpIcon />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {formatCurrency(MOCK_DATA.resumo.lucro_bruto)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Lucro Bruto
                    </Typography>
                    <Chip
                      label={`${MOCK_DATA.resumo.margem_lucro}% margem`}
                      size="small"
                      color="success"
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
                    <AccountBalanceIcon />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {MOCK_DATA.resumo.margem_lucro.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Margem de Lucro
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={MOCK_DATA.resumo.margem_lucro}
                      sx={{ mt: 1, height: 6, borderRadius: 3 }}
                      color="success"
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Métodos de Pagamento */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Métodos de Pagamento
                </Typography>

                <Stack spacing={2}>
                  {MOCK_DATA.metodos_pagamento.map((metodo) => (
                    <Box key={metodo.metodo}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mb: 1 }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: 'primary.light',
                            }}
                          >
                            {metodo.icone}
                          </Avatar>
                          <Typography variant="subtitle2">{metodo.metodo}</Typography>
                        </Stack>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {formatCurrency(metodo.valor)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {metodo.percentual}%
                          </Typography>
                        </Box>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={metodo.percentual}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Custos por Categoria */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Custos por Categoria
                </Typography>

                <Stack spacing={2}>
                  {MOCK_DATA.custos_categoria.map((custo) => (
                    <Box key={custo.categoria}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mb: 1 }}
                      >
                        <Typography variant="subtitle2">{custo.categoria}</Typography>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {formatCurrency(custo.valor)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {custo.percentual}%
                          </Typography>
                        </Box>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={custo.percentual}
                        sx={{ height: 6, borderRadius: 3 }}
                        color="error"
                      />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Comissões por Profissional */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Comissões por Profissional
                </Typography>

                <Stack spacing={2}>
                  {MOCK_DATA.comissoes.map((comissao, index) => (
                    <Paper key={comissao.profissional} sx={{ p: 2, borderRadius: 2 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={3}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {comissao.profissional}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Typography variant="body2" color="text.secondary">
                            Vendas: {formatCurrency(comissao.vendas)}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Chip
                            label={`${comissao.comissao_percentual}% comissão`}
                            size="small"
                            color="info"
                          />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'right' }}>
                            {formatCurrency(comissao.valor_comissao)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
}
