'use client'

import { Box, Grid, Typography, Chip, Divider, Alert } from '@mui/material'
import { Modal, Card } from '@/components/ui'

// Tipo local para Produto
interface Produto {
  id: string
  nome: string
  descricao?: string
  categoria?: string
  preco: number
  estoque: number
  ativo: boolean
  unidade_id?: string
  created_at?: string
  updated_at?: string
}

interface ProdutoDetailDialogProps {
  open: boolean
  onClose: () => void
  produto: Produto | null
}

export default function ProdutoDetailDialog({
  open,
  onClose,
  produto,
}: ProdutoDetailDialogProps) {
  if (!produto) return null

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const getEstoqueStatus = (estoque: number) => {
    if (estoque === 0) return { label: 'Sem estoque', color: 'error' as const }
    if (estoque <= 5)
      return { label: 'Estoque baixo', color: 'warning' as const }
    return { label: 'Em estoque', color: 'success' as const }
  }

  const estoqueStatus = getEstoqueStatus(produto.estoque)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={produto.nome}
      maxWidth="md"
      actions={<Box>{/* Botões de ação podem ser adicionados aqui */}</Box>}
    >
      <Box>
        {/* Informações principais */}
        <Card sx={{ mb: 3 }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Informações do Produto
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Nome
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {produto.nome}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Categoria
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {produto.categoria || 'Sem categoria'}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Descrição
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {produto.descricao || 'Sem descrição'}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Card>

        {/* Preço e estoque */}
        <Card sx={{ mb: 3 }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Preço e Estoque
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Box textAlign="center">
                  <Typography variant="h4" color="primary.main" gutterBottom>
                    {formatCurrency(produto.preco)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Preço unitário
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Box textAlign="center">
                  <Typography variant="h4" color="text.primary" gutterBottom>
                    {produto.estoque}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Quantidade em estoque
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Box textAlign="center">
                  <Chip
                    label={estoqueStatus.label}
                    color={estoqueStatus.color}
                    size="medium"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Status do estoque
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Card>

        {/* Status e configurações */}
        <Card sx={{ mb: 3 }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Status e Configurações
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Status do produto
                </Typography>
                <Chip
                  label={produto.ativo ? 'Ativo' : 'Inativo'}
                  color={produto.ativo ? 'success' : 'default'}
                  sx={{ mt: 1 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Valor total em estoque
                </Typography>
                <Typography variant="h6" color="primary.main" sx={{ mt: 1 }}>
                  {formatCurrency(produto.preco * produto.estoque)}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Card>

        {/* Alertas */}
        {produto.estoque <= 5 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Atenção:</strong> Este produto está com estoque baixo (
              {produto.estoque} unidades). Considere fazer um novo pedido.
            </Typography>
          </Alert>
        )}

        {produto.estoque === 0 && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Crítico:</strong> Este produto está sem estoque. É
              necessário fazer um pedido urgente.
            </Typography>
          </Alert>
        )}

        {/* Informações do sistema */}
        <Card>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Informações do Sistema
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  ID do produto
                </Typography>
                <Typography
                  variant="body1"
                  fontFamily="monospace"
                  sx={{ mt: 1 }}
                >
                  {produto.id}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Unidade
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {produto.unidade_id}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Card>
      </Box>
    </Modal>
  )
}
