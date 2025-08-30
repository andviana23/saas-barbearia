'use client';

import { useState } from 'react';
import { Box, Card, Grid, Typography, Chip, IconButton, Tooltip, Alert } from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { DSButton, DSTable, DSDialog, EmptyState, PageHeader } from '@/components/ui';
import { useProdutos, useDeleteProduto } from '@/hooks/use-produtos';
import ProdutoFormDialog from './ProdutoFormDialog';
import ProdutoDetailDialog from './ProdutoDetailDialog';
import ProdutosFilters from './ProdutosFilters';

// Tipo local para Produto
interface Produto {
  id: string;
  nome: string;
  descricao?: string;
  categoria?: string;
  preco: number;
  estoque: number;
  ativo: boolean;
  unidade_id?: string;
  created_at?: string;
  updated_at?: string;
}

export default function ProdutosContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoriaFilter, setCategoriaFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);

  const {
    data: produtos,
    isLoading,
    error,
  } = useProdutos({
    page: 1,
    limit: 50,
    order: 'asc',
    q: searchTerm,
    ativo: statusFilter === 'all' ? undefined : statusFilter === 'active',
  });

  const deleteProduto = useDeleteProduto();

  const handleCreate = () => {
    setEditingProduto(null);
    setIsFormOpen(true);
  };

  const handleEdit = (produto: Produto) => {
    setEditingProduto(produto);
    setIsFormOpen(true);
  };

  const handleView = (produto: Produto) => {
    setSelectedProduto(produto);
    setIsDetailOpen(true);
  };

  const handleDelete = async (produto: Produto) => {
    if (confirm(`Tem certeza que deseja excluir "${produto.nome}"?`)) {
      await deleteProduto.mutateAsync(produto.id);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingProduto(null);
  };

  const handleDetailClose = () => {
    setIsDetailOpen(false);
    setSelectedProduto(null);
  };

  const columns = [
    {
      key: 'nome',
      label: 'Nome',
      minWidth: 200,
      render: (produto: Produto) => (
        <Box>
          <Typography variant="body1" fontWeight={500}>
            {produto.nome}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {produto.categoria || 'Sem categoria'}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'preco',
      label: 'Preço',
      minWidth: 120,
      render: (produto: Produto) => (
        <Typography variant="body1" fontWeight={500}>
          R$ {produto.preco.toFixed(2).replace('.', ',')}
        </Typography>
      ),
    },
    {
      key: 'estoque',
      label: 'Estoque',
      minWidth: 120,
      render: (produto: Produto) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body1">{produto.estoque}</Typography>
          {produto.estoque <= 5 && (
            <Chip icon={<WarningIcon />} label="Baixo" color="warning" size="small" />
          )}
        </Box>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      minWidth: 100,
      render: (produto: Produto) => (
        <Chip
          label={produto.ativo ? 'Ativo' : 'Inativo'}
          color={produto.ativo ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      key: 'actions',
      label: 'Ações',
      minWidth: 150,
      render: (produto: Produto) => (
        <Box display="flex" gap={1}>
          <Tooltip title="Ver detalhes">
            <IconButton size="small" onClick={() => handleView(produto)} color="primary">
              <InventoryIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => handleEdit(produto)} color="primary">
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Excluir">
            <IconButton size="small" onClick={() => handleDelete(produto)} color="error">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        Erro ao carregar produtos: {error.message}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header com ações */}
      <PageHeader
        title="Produtos"
        subtitle={`${(produtos?.data as any[])?.length || 0} produtos cadastrados`}
      />

      <Box display="flex" gap={1} sx={{ mb: 3 }}>
        <DSButton variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
          Novo Produto
        </DSButton>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <ProdutosFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            categoriaFilter={categoriaFilter}
            onCategoriaChange={setCategoriaFilter}
          />
        </Box>
      </Card>

      {/* Lista de produtos */}
      <Card>
        {produtos && (produtos.data as any[])?.length > 0 ? (
          <DSTable
            columns={columns}
            data={produtos.data as any[]}
            loading={isLoading}
            onRowClick={handleView}
          />
        ) : (
          <EmptyState
            title="Nenhum produto encontrado"
            description={
              searchTerm || statusFilter !== 'all' || categoriaFilter !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Crie seu primeiro produto para começar'
            }
            action={
              !searchTerm && statusFilter === 'all' && categoriaFilter === 'all'
                ? {
                    label: 'Criar Produto',
                    onClick: handleCreate,
                  }
                : undefined
            }
          />
        )}
      </Card>

      {/* Modais */}
      <ProdutoFormDialog open={isFormOpen} onClose={handleFormClose} produto={editingProduto} />

      <ProdutoDetailDialog
        open={isDetailOpen}
        onClose={handleDetailClose}
        produto={selectedProduto}
      />
    </Box>
  );
}
