'use client'

import { useState } from 'react'
import {
  Box,
  Grid,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Button,
  TextField,
} from '@mui/material'
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  SwapHoriz as SwapIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material'
import { Table, Modal, EmptyState, PageHeader, Card } from '@/components/ui'
import type { Column } from '@/components/ui/Table'

// Mock data - substituir por dados reais quando implementar backend
const MOCK_MOVIMENTACOES = [
  {
    id: '1',
    produto: 'Shampoo Anti-Caspa',
    tipo: 'entrada',
    quantidade: 50,
    estoqueAnterior: 15,
    estoqueNovo: 65,
    motivo: 'Compra',
    data: '2025-08-21T10:30:00',
    responsavel: 'João Silva',
    observacoes: 'Pedido de reposição',
  },
  {
    id: '2',
    produto: 'Pomada Modeladora',
    tipo: 'saida',
    quantidade: 3,
    estoqueAnterior: 8,
    estoqueNovo: 5,
    motivo: 'Venda',
    data: '2025-08-21T14:15:00',
    responsavel: 'Maria Santos',
    observacoes: 'Venda para cliente',
  },
  {
    id: '3',
    produto: 'Condicionador Hidratante',
    tipo: 'entrada',
    quantidade: 30,
    estoqueAnterior: 0,
    estoqueNovo: 30,
    motivo: 'Compra',
    data: '2025-08-20T16:45:00',
    responsavel: 'João Silva',
    observacoes: 'Reposição de estoque',
  },
  {
    id: '4',
    produto: 'Óleo para Barba',
    tipo: 'ajuste',
    quantidade: -2,
    estoqueAnterior: 25,
    estoqueNovo: 23,
    motivo: 'Ajuste de inventário',
    data: '2025-08-19T09:20:00',
    responsavel: 'Carlos Lima',
    observacoes: 'Produto com validade vencida',
  },
]

type Movimentacao = (typeof MOCK_MOVIMENTACOES)[0]

type MovimentacaoColumn = Column<Movimentacao> & {
  render: (mov: Movimentacao) => JSX.Element
}

export default function MovimentacoesEstoqueContent() {
  const [movimentacoes, setMovimentacoes] =
    useState<Movimentacao[]>(MOCK_MOVIMENTACOES)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedTipo, setSelectedTipo] = useState<
    'entrada' | 'saida' | 'ajuste'
  >('entrada')

  const handleNovaMovimentacao = (tipo: 'entrada' | 'saida' | 'ajuste') => {
    setSelectedTipo(tipo)
    setIsFormOpen(true)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
  }

  const handleSave = (data: {
    produto: string
    quantidade: number
    motivo: string
    observacoes: string
  }) => {
    const novaMovimentacao: Movimentacao = {
      id: Date.now().toString(),
      ...data,
      tipo: selectedTipo,
      estoqueAnterior: 0, // Mock - implementar cálculo real
      estoqueNovo: 0, // Mock - implementar cálculo real
      data: new Date().toISOString(),
      responsavel: 'Usuário Atual', // Mock - implementar usuário real
    }

    setMovimentacoes((prev) => [novaMovimentacao, ...prev])
    handleFormClose()
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return <TrendingUpIcon color="success" />
      case 'saida':
        return <TrendingDownIcon color="error" />
      case 'ajuste':
        return <SwapIcon color="warning" />
      default:
        return <HistoryIcon />
    }
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return 'success'
      case 'saida':
        return 'error'
      case 'ajuste':
        return 'warning'
      default:
        return 'default'
    }
  }

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return 'Entrada'
      case 'saida':
        return 'Saída'
      case 'ajuste':
        return 'Ajuste'
      default:
        return tipo
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const columns: MovimentacaoColumn[] = [
    {
      id: 'produto',
      label: 'Produto',
      minWidth: 200,
      render: (mov: Movimentacao) => (
        <Typography variant="body1" fontWeight={500}>
          {mov.produto}
        </Typography>
      ),
    },
    {
      id: 'tipo',
      label: 'Tipo',
      minWidth: 120,
      render: (mov: Movimentacao) => (
        <Box display="flex" alignItems="center" gap={1}>
          {getTipoIcon(mov.tipo)}
          <Chip
            label={getTipoLabel(mov.tipo)}
            color={getTipoColor(mov.tipo)}
            size="small"
          />
        </Box>
      ),
    },
    {
      id: 'quantidade',
      label: 'Quantidade',
      minWidth: 120,
      render: (mov: Movimentacao) => (
        <Typography
          variant="body1"
          fontWeight={500}
          color={mov.tipo === 'entrada' ? 'success.main' : 'error.main'}
        >
          {mov.tipo === 'entrada' ? '+' : ''}
          {mov.quantidade}
        </Typography>
      ),
    },
    {
      id: 'estoqueAnterior',
      label: 'Estoque',
      minWidth: 150,
      render: (mov: Movimentacao) => (
        <Box>
          <Typography variant="body2" color="text.secondary">
            {mov.estoqueAnterior} → {mov.estoqueNovo}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'motivo',
      label: 'Motivo',
      minWidth: 150,
      render: (mov: Movimentacao) => (
        <Typography variant="body2">{mov.motivo}</Typography>
      ),
    },
    {
      id: 'data',
      label: 'Data/Hora',
      minWidth: 150,
      render: (mov: Movimentacao) => (
        <Typography variant="body2">{formatDate(mov.data)}</Typography>
      ),
    },
    {
      id: 'responsavel',
      label: 'Responsável',
      minWidth: 150,
      render: (mov: Movimentacao) => (
        <Typography variant="body2">{mov.responsavel}</Typography>
      ),
    },
  ]

  // Estatísticas
  const totalEntradas = movimentacoes.filter((m) => m.tipo === 'entrada').length
  const totalSaidas = movimentacoes.filter((m) => m.tipo === 'saida').length
  const totalAjustes = movimentacoes.filter((m) => m.tipo === 'ajuste').length

  return (
    <Box>
      {/* Header */}
      <PageHeader
        title="Movimentações"
        subtitle={`${movimentacoes.length} movimentações registradas`}
      />

      {/* Ações */}
      <Box display="flex" gap={1} sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleNovaMovimentacao('entrada')}
          color="success"
        >
          Nova Entrada
        </Button>
        <Button
          variant="contained"
          startIcon={<RemoveIcon />}
          onClick={() => handleNovaMovimentacao('saida')}
          color="error"
        >
          Nova Saída
        </Button>
        <Button
          variant="outlined"
          startIcon={<SwapIcon />}
          onClick={() => handleNovaMovimentacao('ajuste')}
        >
          Ajuste
        </Button>
      </Box>

      {/* Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <TrendingUpIcon color="success" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h4" color="success.main" gutterBottom>
                {totalEntradas}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Entradas de Estoque
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <TrendingDownIcon color="error" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h4" color="error.main" gutterBottom>
                {totalSaidas}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Saídas de Estoque
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <SwapIcon color="warning" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h4" color="warning.main" gutterBottom>
                {totalAjustes}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ajustes de Estoque
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Lista de movimentações */}
      <Card>
        {movimentacoes.length > 0 ? (
          <Table
            columns={columns}
            data={movimentacoes}
            onRowClick={() => {}} // Não implementar clique na linha por enquanto
          />
        ) : (
          <EmptyState
            title="Nenhuma movimentação encontrada"
            description="As movimentações de estoque aparecerão aqui"
            action={{
              label: 'Nova Movimentação',
              onClick: () => handleNovaMovimentacao('entrada'),
            }}
          />
        )}
      </Card>

      {/* Modal de nova movimentação */}
      <MovimentacaoFormDialog
        open={isFormOpen}
        onClose={handleFormClose}
        tipo={selectedTipo}
        onSave={handleSave}
      />
    </Box>
  )
}

// Componente de formulário para movimentação
interface MovimentacaoFormDialogProps {
  open: boolean
  onClose: () => void
  tipo: 'entrada' | 'saida' | 'ajuste'
  onSave: (data: {
    produto: string
    quantidade: number
    motivo: string
    observacoes: string
  }) => void
}

function MovimentacaoFormDialog({
  open,
  onClose,
  tipo,
  onSave,
}: MovimentacaoFormDialogProps) {
  const [formData, setFormData] = useState({
    produto: '',
    quantidade: '',
    motivo: '',
    observacoes: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (
      formData.produto.trim() &&
      formData.quantidade &&
      formData.motivo.trim()
    ) {
      onSave({
        ...formData,
        quantidade: Number(formData.quantidade),
      })
    }
  }

  const handleClose = () => {
    setFormData({ produto: '', quantidade: '', motivo: '', observacoes: '' })
    onClose()
  }

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return 'Entrada de Estoque'
      case 'saida':
        return 'Saída de Estoque'
      case 'ajuste':
        return 'Ajuste de Estoque'
      default:
        return 'Movimentação'
    }
  }

  const getMotivoOptions = () => {
    switch (tipo) {
      case 'entrada':
        return [
          { value: 'compra', label: 'Compra' },
          { value: 'devolucao', label: 'Devolução' },
          { value: 'transferencia', label: 'Transferência' },
          { value: 'ajuste', label: 'Ajuste de inventário' },
        ]
      case 'saida':
        return [
          { value: 'venda', label: 'Venda' },
          { value: 'uso_interno', label: 'Uso interno' },
          { value: 'perda', label: 'Perda/Avaria' },
          { value: 'transferencia', label: 'Transferência' },
        ]
      case 'ajuste':
        return [
          { value: 'inventario', label: 'Ajuste de inventário' },
          { value: 'validade', label: 'Validade vencida' },
          { value: 'dano', label: 'Produto danificado' },
          { value: 'outro', label: 'Outro motivo' },
        ]
      default:
        return []
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={getTipoLabel(tipo)}
      maxWidth="sm"
      actions={
        <>
          <Button variant="outlined" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={
              !formData.produto.trim() ||
              !formData.quantidade ||
              !formData.motivo.trim()
            }
            color={
              tipo === 'entrada'
                ? 'success'
                : tipo === 'saida'
                  ? 'error'
                  : 'warning'
            }
          >
            Confirmar {getTipoLabel(tipo)}
          </Button>
        </>
      }
    >
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Produto"
              value={formData.produto}
              onChange={(e) =>
                setFormData({ ...formData, produto: e.target.value })
              }
              fullWidth
              required
              placeholder="Nome do produto..."
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Quantidade"
              type="number"
              value={formData.quantidade}
              onChange={(e) =>
                setFormData({ ...formData, quantidade: e.target.value })
              }
              fullWidth
              required
              inputProps={{
                min: tipo === 'ajuste' ? undefined : 1,
                step: 1,
              }}
              placeholder={
                tipo === 'ajuste'
                  ? 'Quantidade (negativa para redução)'
                  : 'Quantidade'
              }
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              select
              label="Motivo"
              value={formData.motivo}
              onChange={(e) =>
                setFormData({ ...formData, motivo: e.target.value })
              }
              fullWidth
              required
            >
              {getMotivoOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Observações"
              value={formData.observacoes}
              onChange={(e) =>
                setFormData({ ...formData, observacoes: e.target.value })
              }
              fullWidth
              multiline
              rows={3}
              placeholder="Observações sobre a movimentação..."
            />
          </Grid>
        </Grid>
      </Box>
    </Modal>
  )
}
