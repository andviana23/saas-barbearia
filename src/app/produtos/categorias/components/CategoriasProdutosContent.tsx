'use client'

import { useState } from 'react'
import {
  Box,
  Card,
  Grid,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  TextField,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
} from '@mui/icons-material'
import { Button, Table, Modal, EmptyState, PageHeader } from '@/components/ui'
import type { Column } from '@/components/ui/Table'

// Mock data - substituir por dados reais quando implementar backend
const MOCK_CATEGORIAS = [
  {
    id: '1',
    nome: 'Shampoos',
    descricao: 'Produtos para limpeza do cabelo',
    ativo: true,
    produtosCount: 15,
  },
  {
    id: '2',
    nome: 'Condicionadores',
    descricao: 'Produtos para hidratação',
    ativo: true,
    produtosCount: 12,
  },
  {
    id: '3',
    nome: 'Finalizadores',
    descricao: 'Produtos para finalização',
    ativo: true,
    produtosCount: 8,
  },
  {
    id: '4',
    nome: 'Barba',
    descricao: 'Produtos específicos para barba',
    ativo: true,
    produtosCount: 6,
  },
  {
    id: '5',
    nome: 'Hidratantes',
    descricao: 'Produtos hidratantes',
    ativo: true,
    produtosCount: 10,
  },
  {
    id: '6',
    nome: 'Acessórios',
    descricao: 'Acessórios diversos',
    ativo: false,
    produtosCount: 0,
  },
]

type Categoria = (typeof MOCK_CATEGORIAS)[0]

type CategoriaColumn = Column<Categoria> & {
  render: (categoria: Categoria) => React.ReactNode
}

export default function CategoriasProdutosContent() {
  const [categorias, setCategorias] = useState<Categoria[]>(MOCK_CATEGORIAS)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(
    null
  )

  const handleCreate = () => {
    setEditingCategoria(null)
    setIsFormOpen(true)
  }

  const handleEdit = (categoria: Categoria) => {
    setEditingCategoria(categoria)
    setIsFormOpen(true)
  }

  const handleDelete = async (categoria: Categoria) => {
    if (categoria.produtosCount > 0) {
      alert(
        `Não é possível excluir uma categoria que possui ${categoria.produtosCount} produtos.`
      )
      return
    }

    if (
      confirm(`Tem certeza que deseja excluir a categoria "${categoria.nome}"?`)
    ) {
      setCategorias((prev) => prev.filter((c) => c.id !== categoria.id))
    }
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingCategoria(null)
  }

  const handleSave = (data: { nome: string; descricao: string }) => {
    if (editingCategoria) {
      setCategorias((prev) =>
        prev.map((c) => (c.id === editingCategoria.id ? { ...c, ...data } : c))
      )
    } else {
      const newCategoria: Categoria = {
        id: Date.now().toString(),
        ...data,
        ativo: true,
        produtosCount: 0,
      }
      setCategorias((prev) => [...prev, newCategoria])
    }
    handleFormClose()
  }

  const columns: CategoriaColumn[] = [
    {
      id: 'nome',
      label: 'Nome',
      minWidth: 200,
      render: (categoria: Categoria) => (
        <Box display="flex" alignItems="center" gap={1}>
          <CategoryIcon color="primary" />
          <Box>
            <Typography variant="body1" fontWeight={500}>
              {categoria.nome}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {categoria.descricao}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'produtosCount',
      label: 'Produtos',
      minWidth: 120,
      render: (categoria: Categoria) => (
        <Typography variant="body1" fontWeight={500}>
          {categoria.produtosCount}
        </Typography>
      ),
    },
    {
      id: 'ativo',
      label: 'Status',
      minWidth: 100,
      render: (categoria: Categoria) => (
        <Chip
          label={categoria.ativo ? 'Ativa' : 'Inativa'}
          color={categoria.ativo ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      id: 'id',
      label: 'Ações',
      minWidth: 150,
      render: (categoria: Categoria) => (
        <Box display="flex" gap={1}>
          <Tooltip title="Editar categoria">
            <IconButton
              size="small"
              onClick={() => handleEdit(categoria)}
              color="primary"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Excluir categoria">
            <IconButton
              size="small"
              onClick={() => handleDelete(categoria)}
              color="error"
              disabled={categoria.produtosCount > 0}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ]

  return (
    <Box>
      {/* Header com ações */}
      <PageHeader
        title="Categorias"
        subtitle={`${categorias.length} categorias cadastradas`}
      />

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Nova Categoria
        </Button>
      </Box>

      {/* Lista de categorias */}
      <Card>
        {categorias.length > 0 ? (
          <Table
            columns={columns}
            data={categorias}
            onRowClick={() => {}} // Não implementar clique na linha por enquanto
          />
        ) : (
          <EmptyState
            title="Nenhuma categoria encontrada"
            description="Crie sua primeira categoria para organizar os produtos"
            action={{
              label: 'Criar Categoria',
              onClick: handleCreate,
            }}
          />
        )}
      </Card>

      {/* Modal de formulário */}
      <CategoriaFormDialog
        open={isFormOpen}
        onClose={handleFormClose}
        categoria={editingCategoria}
        onSave={handleSave}
      />
    </Box>
  )
}

// Componente de formulário para categoria
interface CategoriaFormDialogProps {
  open: boolean
  onClose: () => void
  categoria: Categoria | null
  onSave: (data: { nome: string; descricao: string }) => void
}

function CategoriaFormDialog({
  open,
  onClose,
  categoria,
  onSave,
}: CategoriaFormDialogProps) {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.nome.trim()) {
      onSave(formData)
    }
  }

  const handleClose = () => {
    setFormData({ nome: '', descricao: '' })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={categoria ? 'Editar Categoria' : 'Nova Categoria'}
      maxWidth="sm"
      actions={
        <>
          <Button variant="outlined" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!formData.nome.trim()}
          >
            {categoria ? 'Salvar' : 'Criar'}
          </Button>
        </>
      }
    >
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Nome da categoria"
              value={formData.nome}
              onChange={(e) =>
                setFormData({ ...formData, nome: e.target.value })
              }
              fullWidth
              required
              placeholder="Ex: Shampoos, Condicionadores..."
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Descrição"
              value={formData.descricao}
              onChange={(e) =>
                setFormData({ ...formData, descricao: e.target.value })
              }
              fullWidth
              multiline
              rows={3}
              placeholder="Descreva o propósito desta categoria..."
            />
          </Grid>
        </Grid>
      </Box>
    </Modal>
  )
}
