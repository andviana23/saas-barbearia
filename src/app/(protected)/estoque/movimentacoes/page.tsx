'use client';

import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add,
  Remove,
  Search,
  TrendingUp,
  TrendingDown,
  Inventory,
  CalendarMonth,
  FilterList,
} from '@mui/icons-material';
import { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';

export default function EstoqueMovimentacoesPage() {
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroPeriodo, setFiltroPeriodo] = useState('30');

  // Mock das movimentações
  const movimentacoes = [
    {
      id: 1,
      data: '30/08/2025',
      hora: '14:30',
      produto: 'Shampoo Anticaspa Premium',
      categoria: 'Produtos para Cabelo',
      tipo: 'entrada',
      quantidade: 50,
      motivo: 'Compra - Fornecedor ABC',
      usuario: 'João Silva',
      estoqueAnterior: 25,
      estoqueAtual: 75,
    },
    {
      id: 2,
      data: '30/08/2025',
      hora: '11:15',
      produto: 'Óleo para Barba Natural',
      categoria: 'Produtos para Barba',
      tipo: 'saida',
      quantidade: 3,
      motivo: 'Venda - Cliente Premium',
      usuario: 'Maria Santos',
      estoqueAnterior: 28,
      estoqueAtual: 25,
    },
    {
      id: 3,
      data: '29/08/2025',
      hora: '16:45',
      produto: 'Máquina de Corte Profissional',
      categoria: 'Ferramentas',
      tipo: 'entrada',
      quantidade: 2,
      motivo: 'Compra - Equipamentos Novos',
      usuario: 'João Silva',
      estoqueAnterior: 3,
      estoqueAtual: 5,
    },
    {
      id: 4,
      data: '29/08/2025',
      hora: '09:20',
      produto: 'Desinfetante para Equipamentos',
      categoria: 'Produtos de Limpeza',
      tipo: 'saida',
      quantidade: 10,
      motivo: 'Uso interno - Limpeza diária',
      usuario: 'Carlos Oliveira',
      estoqueAnterior: 45,
      estoqueAtual: 35,
    },
    {
      id: 5,
      data: '28/08/2025',
      hora: '13:10',
      produto: 'Pomada Modeladora Forte',
      categoria: 'Produtos para Cabelo',
      tipo: 'entrada',
      quantidade: 30,
      motivo: 'Reposição - Estoque baixo',
      usuario: 'João Silva',
      estoqueAnterior: 8,
      estoqueAtual: 38,
    },
  ];

  // Estatísticas
  const estatisticas = {
    totalEntradas: movimentacoes.filter((m) => m.tipo === 'entrada').length,
    totalSaidas: movimentacoes.filter((m) => m.tipo === 'saida').length,
    quantidadeEntradas: movimentacoes
      .filter((m) => m.tipo === 'entrada')
      .reduce((total, m) => total + m.quantidade, 0),
    quantidadeSaidas: movimentacoes
      .filter((m) => m.tipo === 'saida')
      .reduce((total, m) => total + m.quantidade, 0),
  };

  const movimentacoesFiltradas = movimentacoes.filter((mov) => {
    if (filtroTipo === 'todos') return true;
    return mov.tipo === filtroTipo;
  });

  const getTipoChip = (tipo: string) => {
    if (tipo === 'entrada') {
      return <Chip label="Entrada" color="success" size="small" icon={<Add />} />;
    }
    return <Chip label="Saída" color="error" size="small" icon={<Remove />} />;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header da Página */}
      <PageHeader
        title="Movimentações de Estoque"
        subtitle="Acompanhe todas as entradas e saídas de produtos"
      />

      {/* Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 2 }}>
                <TrendingUp />
              </Avatar>
              <Typography variant="h4" fontWeight="bold">
                {estatisticas.totalEntradas}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Entradas (30 dias)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'error.main', mx: 'auto', mb: 2 }}>
                <TrendingDown />
              </Avatar>
              <Typography variant="h4" fontWeight="bold">
                {estatisticas.totalSaidas}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Saídas (30 dias)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
                <Add />
              </Avatar>
              <Typography variant="h4" fontWeight="bold">
                {estatisticas.quantidadeEntradas}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Itens Adicionados
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 2 }}>
                <Remove />
              </Avatar>
              <Typography variant="h4" fontWeight="bold">
                {estatisticas.quantidadeSaidas}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Itens Consumidos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
            🔍 Filtros
          </Typography>

          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Buscar por produto..."
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Movimentação</InputLabel>
                <Select
                  value={filtroTipo}
                  label="Tipo de Movimentação"
                  onChange={(e) => setFiltroTipo(e.target.value)}
                >
                  <MenuItem value="todos">Todos</MenuItem>
                  <MenuItem value="entrada">Apenas Entradas</MenuItem>
                  <MenuItem value="saida">Apenas Saídas</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Período</InputLabel>
                <Select
                  value={filtroPeriodo}
                  label="Período"
                  onChange={(e) => setFiltroPeriodo(e.target.value)}
                >
                  <MenuItem value="7">Últimos 7 dias</MenuItem>
                  <MenuItem value="30">Últimos 30 dias</MenuItem>
                  <MenuItem value="90">Últimos 90 dias</MenuItem>
                  <MenuItem value="365">Último ano</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <Button variant="outlined" startIcon={<FilterList />} fullWidth>
                Limpar Filtros
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabela de Movimentações */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
            📋 Histórico de Movimentações
          </Typography>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Data/Hora</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Produto</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Quantidade</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Estoque</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Motivo</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Usuário</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {movimentacoesFiltradas.map((movimentacao) => (
                  <TableRow key={movimentacao.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {movimentacao.data}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {movimentacao.hora}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {movimentacao.produto}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {movimentacao.categoria}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>{getTipoChip(movimentacao.tipo)}</TableCell>

                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color={movimentacao.tipo === 'entrada' ? 'success.main' : 'error.main'}
                      >
                        {movimentacao.tipo === 'entrada' ? '+' : '-'}
                        {movimentacao.quantidade}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {movimentacao.estoqueAnterior} → {movimentacao.estoqueAtual}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Atual: {movimentacao.estoqueAtual} unidades
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">{movimentacao.motivo}</Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">{movimentacao.usuario}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {movimentacoesFiltradas.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Inventory sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Nenhuma movimentação encontrada
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tente ajustar os filtros para ver mais resultados
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
            ⚡ Ações Rápidas
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                startIcon={<Add />}
                fullWidth
                onClick={() => alert('Registrar entrada de estoque')}
              >
                Registrar Entrada
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                startIcon={<Remove />}
                fullWidth
                onClick={() => alert('Registrar saída de estoque')}
              >
                Registrar Saída
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                startIcon={<CalendarMonth />}
                fullWidth
                onClick={() => alert('Agendar inventário')}
              >
                Agendar Inventário
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                startIcon={<Inventory />}
                fullWidth
                onClick={() => alert('Relatório de movimentações')}
              >
                Gerar Relatório
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
}
