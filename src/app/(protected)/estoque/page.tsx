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
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Stack,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Inventory,
  Warning,
  TrendingDown,
  Add,
  Search,
  Visibility,
  Edit,
  Download,
  FilterList,
  Refresh,
} from '@mui/icons-material';
import PageHeader from '@/components/ui/PageHeader';
import { SkeletonLoader, RetryButton } from '@/components/ui';
import { useRetry } from '@/hooks/useRetry';

interface ProdutoEstoque {
  id: string;
  nome: string;
  categoria: string;
  quantidadeAtual: number;
  quantidadeMinima: number;
  unidade: string;
  valorUnitario: number;
  valorTotal: number;
  ultimaMovimentacao: string;
  status: 'normal' | 'baixo' | 'critico';
}

export default function EstoquePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [produtos, setProdutos] = useState<ProdutoEstoque[]>([]);

  // Dados mock para demonstração
  const mockProdutos: ProdutoEstoque[] = [
    {
      id: '1',
      nome: 'Shampoo Profissional',
      categoria: 'Higiene',
      quantidadeAtual: 15,
      quantidadeMinima: 10,
      unidade: 'un',
      valorUnitario: 25.9,
      valorTotal: 388.5,
      ultimaMovimentacao: '2024-01-15',
      status: 'normal',
    },
    {
      id: '2',
      nome: 'Pomada Modeladora',
      categoria: 'Styling',
      quantidadeAtual: 3,
      quantidadeMinima: 5,
      unidade: 'un',
      valorUnitario: 18.5,
      valorTotal: 55.5,
      ultimaMovimentacao: '2024-01-14',
      status: 'baixo',
    },
    {
      id: '3',
      nome: 'Óleo para Barba',
      categoria: 'Barba',
      quantidadeAtual: 1,
      quantidadeMinima: 3,
      unidade: 'un',
      valorUnitario: 32.0,
      valorTotal: 32.0,
      ultimaMovimentacao: '2024-01-13',
      status: 'critico',
    },
  ];

  // Simula uma API que falha ocasionalmente
  const fetchEstoque = async (): Promise<ProdutoEstoque[]> => {
    // Simula delay de rede
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simula falha em 60% das tentativas para demonstrar o retry
    if (Math.random() < 0.6) {
      throw new Error('Erro de conexão com o servidor. Tente novamente.');
    }

    return mockProdutos;
  };

  // Hook de retry para carregamento inicial
  const {
    execute: loadEstoque,
    state,
    reset,
  } = useRetry({
    maxAttempts: 3,
    initialDelay: 1000,
    backoffMultiplier: 1.5,
  });

  // Hook de retry para refresh manual
  const {
    execute: refreshEstoque,
    state: refreshState,
    reset: resetRefresh,
  } = useRetry({
    maxAttempts: 3,
    initialDelay: 500,
    backoffMultiplier: 1.2,
  });

  // Carregamento inicial
  useEffect(() => {
    loadEstoque(async () => {
      const data = await fetchEstoque();
      setProdutos(data);
      return data;
    });
  }, [loadEstoque]);

  // Função para refresh dos dados
  const handleRefresh = () => {
    refreshEstoque(async () => {
      const data = await fetchEstoque();
      setProdutos(data);
      return data;
    });
  };

  const produtosFiltrados = produtos.filter(
    (produto) =>
      produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.categoria.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalProdutos = produtos.length;
  const produtosBaixoEstoque = produtos.filter((p) => p.status === 'baixo').length;
  const produtosCriticos = produtos.filter((p) => p.status === 'critico').length;
  const valorTotalEstoque = produtos.reduce((sum, p) => sum + p.valorTotal, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'success';
      case 'baixo':
        return 'warning';
      case 'critico':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'normal':
        return 'Normal';
      case 'baixo':
        return 'Baixo';
      case 'critico':
        return 'Crítico';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <PageHeader
        title="Controle de Estoque"
        subtitle="Gerencie produtos e monitore níveis de estoque"
        actions={
          <Stack direction="row" spacing={2}>
            <IconButton
              onClick={handleRefresh}
              disabled={refreshState.isLoading}
              color="primary"
              size="small"
            >
              {refreshState.isLoading ? <CircularProgress size={20} /> : <Refresh />}
            </IconButton>
            <Button variant="outlined" startIcon={<Download />} size="small">
              Exportar
            </Button>
            <Button variant="contained" startIcon={<Add />} size="small">
              Novo Produto
            </Button>
          </Stack>
        }
      />

      {/* Alertas */}
      {produtosCriticos > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <strong>{produtosCriticos} produto(s)</strong> com estoque crítico precisam de reposição
          urgente!
        </Alert>
      )}

      {produtosBaixoEstoque > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <strong>{produtosBaixoEstoque} produto(s)</strong> com estoque baixo. Considere fazer
          pedido de reposição.
        </Alert>
      )}

      {/* Erro no carregamento inicial */}
      {state.lastError && !state.isLoading && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Erro ao carregar dados do estoque
            </Typography>
            <RetryButton
              error={state.lastError}
              attemptCount={state.currentAttempt}
              maxAttempts={3}
              onRetry={() =>
                loadEstoque(async () => {
                  const data = await fetchEstoque();
                  setProdutos(data);
                  return data;
                })
              }
              onCancel={reset}
              showErrorDetails={true}
              showAttemptCount={true}
            />
          </CardContent>
        </Card>
      )}

      {/* Erro no refresh */}
      {refreshState.lastError && !refreshState.isLoading && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography>Erro ao atualizar dados: {refreshState.lastError?.message}</Typography>
            <RetryButton
              error={refreshState.lastError}
              attemptCount={refreshState.currentAttempt}
              maxAttempts={3}
              onRetry={() =>
                refreshEstoque(async () => {
                  const data = await fetchEstoque();
                  setProdutos(data);
                  return data;
                })
              }
              onCancel={resetRefresh}
              variant="text"
              size="small"
              retryText="Tentar novamente"
              showAttemptCount={false}
            />
          </Box>
        </Alert>
      )}

      {/* Resumo do Estoque */}
      {state.isLoading ? (
        <SkeletonLoader variant="dashboard" />
      ) : !state.lastError ? (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Inventory color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" color="primary.main">
                    Total de Produtos
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {totalProdutos}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Itens cadastrados
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
                  Produtos para repor
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingDown color="error" sx={{ mr: 1 }} />
                  <Typography variant="h6" color="error.main">
                    Estoque Crítico
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {produtosCriticos}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Reposição urgente
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" color="success.main">
                    💰 Valor Total
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  R$ {valorTotalEstoque.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Valor do estoque
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : null}

      {/* Conteúdo principal - só exibe se não há erro no carregamento inicial */}
      {!state.lastError && (
        <>
          {/* Filtros e Busca */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                <TextField
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ flexGrow: 1 }}
                />
                <Button variant="outlined" startIcon={<FilterList />}>
                  Filtros
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* Lista de Produtos */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Produtos em Estoque
              </Typography>

              {state.isLoading ? (
                <SkeletonLoader variant="table" rows={6} />
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Produto</TableCell>
                        <TableCell>Categoria</TableCell>
                        <TableCell align="center">Quantidade</TableCell>
                        <TableCell align="center">Mínimo</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell align="right">Valor Unit.</TableCell>
                        <TableCell align="right">Valor Total</TableCell>
                        <TableCell align="center">Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {produtosFiltrados.map((produto) => (
                        <TableRow key={produto.id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {produto.nome}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={produto.categoria} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell align="center">
                            <Typography fontWeight="bold">
                              {produto.quantidadeAtual} {produto.unidade}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            {produto.quantidadeMinima} {produto.unidade}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={getStatusLabel(produto.status)}
                              color={getStatusColor(produto.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">R$ {produto.valorUnitario.toFixed(2)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            R$ {produto.valorTotal.toFixed(2)}
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={1} justifyContent="center">
                              <IconButton size="small" color="primary">
                                <Visibility />
                              </IconButton>
                              <IconButton size="small" color="primary">
                                <Edit />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {!state.isLoading && produtosFiltrados.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Inventory sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Nenhum produto encontrado
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {searchTerm
                      ? 'Tente ajustar os filtros de busca'
                      : 'Cadastre produtos para começar'}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </Container>
  );
}
