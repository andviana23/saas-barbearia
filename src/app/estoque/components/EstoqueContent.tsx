'use client'

import { useState } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Alert,
} from '@mui/material'
import {
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material'
import { Button as DSButton, Card as DSCard, PageHeader } from '@/components/ui'
import { useProdutos } from '@/hooks/use-produtos'

export default function EstoqueContent() {
  const [selectedFilter, setSelectedFilter] = useState('all')

  const { data: produtos, isLoading, error } = useProdutos()

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        Erro ao carregar dados de estoque: {error.message}
      </Alert>
    )
  }

  if (!produtos?.data) {
    return null
  }

  // Cálculos de métricas
  const produtosData = produtos.data as any[]
  const totalProdutos = produtosData.length
  const produtosAtivos = produtosData.filter((p) => p.ativo).length
  const produtosSemEstoque = produtosData.filter((p) => p.estoque === 0).length
  const produtosEstoqueBaixo = produtosData.filter(
    (p) => p.estoque > 0 && p.estoque <= 5
  ).length
  const valorTotalEstoque = produtosData
    .filter((p) => p.ativo)
    .reduce((sum, p) => sum + p.preco * p.estoque, 0)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const getEstoqueStatus = (estoque: number) => {
    if (estoque === 0)
      return {
        label: 'Sem estoque',
        color: 'error' as const,
        icon: <ErrorIcon />,
      }
    if (estoque <= 5)
      return {
        label: 'Estoque baixo',
        color: 'warning' as const,
        icon: <WarningIcon />,
      }
    return {
      label: 'Em estoque',
      color: 'success' as const,
      icon: <InventoryIcon />,
    }
  }

  const produtosFiltrados = produtosData.filter((produto) => {
    if (selectedFilter === 'all') return true
    if (selectedFilter === 'sem-estoque') return produto.estoque === 0
    if (selectedFilter === 'estoque-baixo')
      return produto.estoque > 0 && produto.estoque <= 5
    if (selectedFilter === 'ativos') return produto.ativo
    return true
  })

  const alertasEstoque = [
    ...produtosData
      .filter((p) => p.estoque === 0)
      .map((p) => ({
        tipo: 'error' as const,
        produto: p.nome,
        mensagem: 'Produto sem estoque',
      })),
    ...produtosData
      .filter((p) => p.estoque > 0 && p.estoque <= 5)
      .map((p) => ({
        tipo: 'warning' as const,
        produto: p.nome,
        mensagem: `Estoque baixo: ${p.estoque} unidades`,
      })),
  ]

  return (
    <Box>
      {/* Header */}
      <PageHeader
        title="Controle de Estoque"
        subtitle={`${totalProdutos} produtos cadastrados`}
      />

      {/* Filtros */}
      <Box display="flex" gap={1} mb={3}>
        <Button
          variant="outlined"
          onClick={() => setSelectedFilter('all')}
          color={selectedFilter === 'all' ? 'primary' : 'inherit'}
        >
          Todos
        </Button>
        <Button
          variant="outlined"
          onClick={() => setSelectedFilter('sem-estoque')}
          color={selectedFilter === 'sem-estoque' ? 'error' : 'inherit'}
        >
          Sem Estoque
        </Button>
        <Button
          variant="outlined"
          onClick={() => setSelectedFilter('estoque-baixo')}
          color={selectedFilter === 'estoque-baixo' ? 'warning' : 'inherit'}
        >
          Estoque Baixo
        </Button>
        <Button
          variant="outlined"
          onClick={() => setSelectedFilter('ativos')}
          color={selectedFilter === 'ativos' ? 'success' : 'inherit'}
        >
          Ativos
        </Button>
      </Box>

      {/* Métricas principais */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <InventoryIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="primary" gutterBottom>
                {totalProdutos}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total de Produtos
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUpIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="success.main" gutterBottom>
                {produtosAtivos}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Produtos Ativos
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ErrorIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="error.main" gutterBottom>
                {produtosSemEstoque}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sem Estoque
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <WarningIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="warning.main" gutterBottom>
                {produtosEstoqueBaixo}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Estoque Baixo
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Valor total em estoque */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <MoneyIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h3" color="primary.main" gutterBottom>
            {formatCurrency(valorTotalEstoque)}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Valor total em estoque
          </Typography>
        </Box>
      </Card>

      {/* Alertas de estoque */}
      {alertasEstoque.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Alertas de Estoque
            </Typography>

            <Grid container spacing={2}>
              {alertasEstoque.slice(0, 6).map((alerta, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Alert severity={alerta.tipo} sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      <strong>{alerta.produto}:</strong> {alerta.mensagem}
                    </Typography>
                  </Alert>
                </Grid>
              ))}
            </Grid>

            {alertasEstoque.length > 6 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                +{alertasEstoque.length - 6} alertas adicionais
              </Typography>
            )}
          </Box>
        </Card>
      )}

      {/* Lista de produtos filtrada */}
      <Card>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Produtos{' '}
            {selectedFilter !== 'all' && `(${produtosFiltrados.length})`}
          </Typography>

          {produtosFiltrados.length > 0 ? (
            <Grid container spacing={2}>
              {produtosFiltrados.map((produto) => {
                const status = getEstoqueStatus(produto.estoque)

                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={produto.id}>
                    <Card variant="outlined" sx={{ p: 2 }}>
                      <Box
                        display="flex"
                        alignItems="center"
                        gap={1}
                        sx={{ mb: 1 }}
                      >
                        {status.icon}
                        <Typography variant="body1" fontWeight={500}>
                          {produto.nome}
                        </Typography>
                      </Box>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        {produto.categoria || 'Sem categoria'}
                      </Typography>

                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mb: 1 }}
                      >
                        <Typography variant="h6" color="primary.main">
                          {formatCurrency(produto.preco)}
                        </Typography>
                        <Chip
                          label={`${produto.estoque} un.`}
                          color={status.color}
                          size="small"
                        />
                      </Box>

                      <Chip
                        label={status.label}
                        color={status.color}
                        size="small"
                        variant="outlined"
                      />
                    </Card>
                  </Grid>
                )
              })}
            </Grid>
          ) : (
            <Box textAlign="center" sx={{ py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Nenhum produto encontrado com os filtros selecionados.
              </Typography>
            </Box>
          )}
        </Box>
      </Card>
    </Box>
  )
}
