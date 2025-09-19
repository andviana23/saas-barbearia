'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  InputAdornment,
  Stack,
  Chip,
  Avatar,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  Visibility,
  FilterList,
  Store,
  Inventory,
  AttachMoney,
  TrendingUp,
  Warning,
  CheckCircle,
} from '@mui/icons-material';
import PageHeader from '@/components/ui/PageHeader';
import { SkeletonLoader } from '@/components/ui';

interface Produto {
  id: string;
  nome: string;
  categoria: string;
  preco: number;
  estoque: number;
  estoqueMinimo: number;
  marca: string;
  status: 'ativo' | 'inativo' | 'esgotado';
  vendas: number;
  ultimaVenda?: string;
  fornecedor: string;
}

export default function ProdutosPage() {
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [produtos, setProdutos] = useState<Produto[]>([
    {
      id: '1',
      nome: 'Shampoo Anticaspa',
      categoria: 'Cuidados Capilares',
      preco: 25.9,
      estoque: 45,
      estoqueMinimo: 10,
      marca: 'Head & Shoulders',
      status: 'ativo',
      vendas: 128,
      ultimaVenda: 'Hoje às 14:30',
      fornecedor: 'Distribuidora ABC',
    },
    {
      id: '2',
      nome: 'Pomada Modeladora',
      categoria: 'Finalizadores',
      preco: 18.5,
      estoque: 8,
      estoqueMinimo: 15,
      marca: 'Barba Forte',
      status: 'ativo',
      vendas: 89,
      ultimaVenda: 'Ontem às 16:45',
      fornecedor: 'Beauty Supply',
    },
    {
      id: '3',
      nome: 'Óleo para Barba',
      categoria: 'Barba',
      preco: 32.0,
      estoque: 0,
      estoqueMinimo: 5,
      marca: 'Beard Oil Co.',
      status: 'esgotado',
      vendas: 156,
      ultimaVenda: 'Há 3 dias',
      fornecedor: 'Premium Beard',
    },
    {
      id: '4',
      nome: 'Cera Modeladora',
      categoria: 'Finalizadores',
      preco: 22.9,
      estoque: 23,
      estoqueMinimo: 8,
      marca: 'Style Pro',
      status: 'ativo',
      vendas: 67,
      ultimaVenda: 'Hoje às 11:20',
      fornecedor: 'Distribuidora ABC',
    },
    {
      id: '5',
      nome: 'Condicionador Hidratante',
      categoria: 'Cuidados Capilares',
      preco: 28.9,
      estoque: 31,
      estoqueMinimo: 12,
      marca: 'Pantene',
      status: 'ativo',
      vendas: 94,
      ultimaVenda: 'Hoje às 09:15',
      fornecedor: 'Beauty Supply',
    },
    {
      id: '6',
      nome: 'Gel Fixador',
      categoria: 'Finalizadores',
      preco: 15.9,
      estoque: 18,
      estoqueMinimo: 10,
      marca: 'Gel Max',
      status: 'ativo',
      vendas: 203,
      ultimaVenda: 'Hoje às 13:45',
      fornecedor: 'Distribuidora ABC',
    },
  ]);

  // Simular carregamento inicial
  useEffect(() => {
    const loadProdutos = async () => {
      setIsLoading(true);
      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsLoading(false);
    };

    loadProdutos();
  }, []);

  // Função para refresh dos dados
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simular delay de API
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsRefreshing(false);
  };

  const categorias = ['Cuidados Capilares', 'Finalizadores', 'Barba', 'Equipamentos'];

  const produtosFiltrados = produtos.filter((produto) => {
    const matchBusca =
      produto.nome.toLowerCase().includes(busca.toLowerCase()) ||
      produto.marca.toLowerCase().includes(busca.toLowerCase());
    const matchCategoria = !categoriaFiltro || produto.categoria === categoriaFiltro;
    const matchStatus = !statusFiltro || produto.status === statusFiltro;

    return matchBusca && matchCategoria && matchStatus;
  });

  const totalProdutos = produtos.length;
  const produtosAtivos = produtos.filter((p) => p.status === 'ativo').length;
  const produtosEsgotados = produtos.filter((p) => p.status === 'esgotado').length;
  const produtosBaixoEstoque = produtos.filter(
    (p) => p.estoque <= p.estoqueMinimo && p.status !== 'esgotado',
  ).length;
  const valorTotalEstoque = produtos.reduce((sum, p) => sum + p.preco * p.estoque, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'success';
      case 'esgotado':
        return 'error';
      case 'inativo':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'Ativo';
      case 'esgotado':
        return 'Esgotado';
      case 'inativo':
        return 'Inativo';
      default:
        return 'Desconhecido';
    }
  };

  const isEstoqueBaixo = (produto: Produto) => {
    return produto.estoque <= produto.estoqueMinimo && produto.status !== 'esgotado';
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <PageHeader
        title="Produtos"
        subtitle="Gerencie produtos, estoque e vendas"
        actions={
          <Stack direction="row" spacing={2}>
            <IconButton
              onClick={handleRefresh}
              disabled={isRefreshing}
              size="small"
              title="Atualizar dados"
            >
              {isRefreshing ? <CircularProgress size={20} /> : <TrendingUp />}
            </IconButton>
            <Button variant="outlined" startIcon={<FilterList />} size="small">
              Filtros
            </Button>
            <Button variant="contained" startIcon={<Add />} size="small">
              Novo Produto
            </Button>
          </Stack>
        }
      />

      {/* Resumo */}
      {isLoading ? (
        <SkeletonLoader variant="dashboard" rows={4} />
      ) : (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Store color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" color="primary.main">
                    Total de Produtos
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {totalProdutos}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {produtosAtivos} ativos
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AttachMoney color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6" color="success.main">
                    Valor do Estoque
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  R$ {valorTotalEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Valor total em estoque
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Warning color="warning" sx={{ mr: 1 }} />
                  <Typography variant="h6" color="warning.main">
                    Estoque Baixo
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {produtosBaixoEstoque}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Produtos com estoque baixo
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Inventory color="error" sx={{ mr: 1 }} />
                  <Typography variant="h6" color="error.main">
                    Esgotados
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {produtosEsgotados}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Produtos sem estoque
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Alertas */}
      {produtosBaixoEstoque > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {produtosBaixoEstoque} produto(s) com estoque baixo. Considere fazer reposição.
        </Alert>
      )}

      {produtosEsgotados > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {produtosEsgotados} produto(s) esgotado(s). Reponha o estoque para continuar vendendo.
        </Alert>
      )}

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Buscar produtos..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Categoria</InputLabel>
                <Select
                  value={categoriaFiltro}
                  label="Categoria"
                  onChange={(e) => setCategoriaFiltro(e.target.value)}
                >
                  <MenuItem value="">Todas</MenuItem>
                  {categorias.map((categoria) => (
                    <MenuItem key={categoria} value={categoria}>
                      {categoria}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFiltro}
                  label="Status"
                  onChange={(e) => setStatusFiltro(e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="ativo">Ativo</MenuItem>
                  <MenuItem value="esgotado">Esgotado</MenuItem>
                  <MenuItem value="inativo">Inativo</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="body2" color="text.secondary">
                {produtosFiltrados.length} produto(s) encontrado(s)
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabela de Produtos */}
      <Card>
        <CardContent>
          {isLoading ? (
            <SkeletonLoader variant="table" rows={6} />
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Produto</TableCell>
                    <TableCell>Categoria</TableCell>
                    <TableCell align="right">Preço</TableCell>
                    <TableCell align="center">Estoque</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="right">Vendas</TableCell>
                    <TableCell align="center">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {produtosFiltrados.map((produto) => (
                    <TableRow key={produto.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            <Store />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {produto.nome}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {produto.marca}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={produto.categoria} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle2" fontWeight="bold">
                          R$ {produto.preco.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                        >
                          <Typography
                            variant="subtitle2"
                            fontWeight="bold"
                            color={isEstoqueBaixo(produto) ? 'warning.main' : 'text.primary'}
                          >
                            {produto.estoque}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Mín: {produto.estoqueMinimo}
                          </Typography>
                          {isEstoqueBaixo(produto) && (
                            <Warning color="warning" sx={{ fontSize: 16, mt: 0.5 }} />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={getStatusLabel(produto.status)}
                          color={getStatusColor(produto.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box
                          sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}
                        >
                          <Typography variant="subtitle2" fontWeight="bold">
                            {produto.vendas}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {produto.ultimaVenda}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <IconButton size="small" color="primary">
                            <Visibility />
                          </IconButton>
                          <IconButton size="small" color="default">
                            <Edit />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <Delete />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {!isLoading && produtosFiltrados.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Store sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Nenhum produto encontrado
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tente ajustar os filtros ou adicionar novos produtos
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
