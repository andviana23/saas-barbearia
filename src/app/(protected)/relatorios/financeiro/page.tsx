'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  PieChart,
  Download,
  Calendar,
  Filter,
} from 'lucide-react';

interface TransacaoFinanceira {
  id: string;
  data: string;
  cliente: string;
  servico: string;
  profissional: string;
  valor: number;
  formaPagamento: 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix';
  status: 'pago' | 'pendente' | 'cancelado';
  comissao: number;
}

export default function RelatorioFinanceiroPage() {
  const [periodo, setPeriodo] = useState('mes_atual');
  const [profissionalFiltro, setProfissionalFiltro] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const transacoes: TransacaoFinanceira[] = [
    {
      id: '1',
      data: '2024-01-15',
      cliente: 'João Silva',
      servico: 'Corte + Barba',
      profissional: 'Carlos',
      valor: 45.00,
      formaPagamento: 'pix',
      status: 'pago',
      comissao: 22.50,
    },
    {
      id: '2',
      data: '2024-01-15',
      cliente: 'Pedro Santos',
      servico: 'Corte Simples',
      profissional: 'Roberto',
      valor: 25.00,
      formaPagamento: 'dinheiro',
      status: 'pago',
      comissao: 12.50,
    },
    {
      id: '3',
      data: '2024-01-14',
      cliente: 'Maria Costa',
      servico: 'Escova + Hidratação',
      profissional: 'Ana',
      valor: 80.00,
      formaPagamento: 'cartao_credito',
      status: 'pago',
      comissao: 40.00,
    },
    {
      id: '4',
      data: '2024-01-14',
      cliente: 'Lucas Oliveira',
      servico: 'Barba',
      profissional: 'Carlos',
      valor: 20.00,
      formaPagamento: 'cartao_debito',
      status: 'pendente',
      comissao: 10.00,
    },
  ];

  // Cálculos dos totais
  const receitaTotal = transacoes
    .filter(t => t.status === 'pago')
    .reduce((acc, t) => acc + t.valor, 0);

  const comissaoTotal = transacoes
    .filter(t => t.status === 'pago')
    .reduce((acc, t) => acc + t.comissao, 0);

  const receitaLiquida = receitaTotal - comissaoTotal;

  const transacoesPorFormaPagamento = transacoes
    .filter(t => t.status === 'pago')
    .reduce((acc, t) => {
      acc[t.formaPagamento] = (acc[t.formaPagamento] || 0) + t.valor;
      return acc;
    }, {} as Record<string, number>);

  const receitaPorProfissional = transacoes
    .filter(t => t.status === 'pago')
    .reduce((acc, t) => {
      acc[t.profissional] = (acc[t.profissional] || 0) + t.valor;
      return acc;
    }, {} as Record<string, number>);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago':
        return 'success';
      case 'pendente':
        return 'warning';
      case 'cancelado':
        return 'error';
      default:
        return 'default';
    }
  };

  const getFormaPagamentoLabel = (forma: string) => {
    switch (forma) {
      case 'dinheiro':
        return 'Dinheiro';
      case 'cartao_credito':
        return 'Cartão de Crédito';
      case 'cartao_debito':
        return 'Cartão de Débito';
      case 'pix':
        return 'PIX';
      default:
        return forma;
    }
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1">
            Relatório Financeiro
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Análise detalhada das receitas e transações
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Download />}
          color="primary"
        >
          Exportar PDF
        </Button>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filtros
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Período</InputLabel>
                <Select
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                  label="Período"
                >
                  <MenuItem value="hoje">Hoje</MenuItem>
                  <MenuItem value="semana_atual">Esta Semana</MenuItem>
                  <MenuItem value="mes_atual">Este Mês</MenuItem>
                  <MenuItem value="mes_anterior">Mês Anterior</MenuItem>
                  <MenuItem value="personalizado">Personalizado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {periodo === 'personalizado' && (
              <>
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    label="Data Início"
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    label="Data Fim"
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Grid>
              </>
            )}
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Profissional</InputLabel>
                <Select
                  value={profissionalFiltro}
                  onChange={(e) => setProfissionalFiltro(e.target.value)}
                  label="Profissional"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="Carlos">Carlos</MenuItem>
                  <MenuItem value="Roberto">Roberto</MenuItem>
                  <MenuItem value="Ana">Ana</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant="outlined"
                startIcon={<Filter />}
                fullWidth
              >
                Aplicar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Cards de Resumo */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" color="primary">
                    {formatarMoeda(receitaTotal)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Receita Total
                  </Typography>
                </Box>
                <TrendingUp size={24} color="#4caf50" />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUp size={16} color="#4caf50" />
                <Typography variant="caption" color="success.main" sx={{ ml: 0.5 }}>
                  +12% vs mês anterior
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" color="warning.main">
                    {formatarMoeda(comissaoTotal)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Comissões
                  </Typography>
                </Box>
                <DollarSign size={24} color="#ff9800" />
              </Box>
              <Typography variant="caption" color="text.secondary">
                {((comissaoTotal / receitaTotal) * 100).toFixed(1)}% da receita
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" color="success.main">
                    {formatarMoeda(receitaLiquida)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Receita Líquida
                  </Typography>
                </Box>
                <PieChart size={24} color="#4caf50" />
              </Box>
              <Typography variant="caption" color="text.secondary">
                Após comissões
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6">
                    {transacoes.filter(t => t.status === 'pago').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Transações
                  </Typography>
                </Box>
                <CreditCard size={24} color="#2196f3" />
              </Box>
              <Typography variant="caption" color="text.secondary">
                {transacoes.filter(t => t.status === 'pendente').length} pendentes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Receita por Forma de Pagamento */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Receita por Forma de Pagamento
              </Typography>
              <Box sx={{ mt: 2 }}>
                {Object.entries(transacoesPorFormaPagamento).map(([forma, valor]) => (
                  <Box key={forma} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2">
                      {getFormaPagamentoLabel(forma)}
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {formatarMoeda(valor)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Receita por Profissional */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Receita por Profissional
              </Typography>
              <Box sx={{ mt: 2 }}>
                {Object.entries(receitaPorProfissional).map(([profissional, valor]) => (
                  <Box key={profissional} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2">
                      {profissional}
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {formatarMoeda(valor)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Tabela de Transações */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Transações Detalhadas
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Data</TableCell>
                      <TableCell>Cliente</TableCell>
                      <TableCell>Serviço</TableCell>
                      <TableCell>Profissional</TableCell>
                      <TableCell>Valor</TableCell>
                      <TableCell>Forma Pagamento</TableCell>
                      <TableCell>Comissão</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transacoes.map((transacao) => (
                      <TableRow key={transacao.id}>
                        <TableCell>{transacao.data}</TableCell>
                        <TableCell>{transacao.cliente}</TableCell>
                        <TableCell>{transacao.servico}</TableCell>
                        <TableCell>{transacao.profissional}</TableCell>
                        <TableCell>{formatarMoeda(transacao.valor)}</TableCell>
                        <TableCell>{getFormaPagamentoLabel(transacao.formaPagamento)}</TableCell>
                        <TableCell>{formatarMoeda(transacao.comissao)}</TableCell>
                        <TableCell>
                          <Chip
                            label={transacao.status}
                            color={getStatusColor(transacao.status) as any}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}