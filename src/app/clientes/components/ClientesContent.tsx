'use client'

import React, { useState } from 'react'
import {
  Box,
  Container,
  Stack,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Alert,
  Snackbar,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  Visibility as ViewIcon,
  FileUpload as ImportIcon,
} from '@mui/icons-material'
import { PageHeader, DSTable } from '@/components/ui'
import { useClientes, useUpdateCliente } from '@/hooks/use-clientes'
import { safeValidate } from '@/lib/validation'
import { UpdateClienteSchema } from '@/schemas'
import ClientesFilters from './ClientesFilters'
import ClienteFormDialog from './ClienteFormDialog'
import ClienteDetailDialog from './ClienteDetailDialog'
import ImportClientesDialog from './ImportClientesDialog'

interface ClientesContentProps {}

interface ClientesData {
  clientes: any[]
  total: number
  page: number
  limit: number
}

export default function ClientesContent({}: ClientesContentProps) {
  const [filters, setFilters] = useState({
    q: '',
    ativo: true,
    page: 0,
    limit: 10,
    order: 'desc' as const,
  })

  const [formDialog, setFormDialog] = useState<{
    open: boolean
    mode: 'create' | 'edit'
    cliente?: any
  }>({
    open: false,
    mode: 'create',
  })

  const [detailDialog, setDetailDialog] = useState<{
    open: boolean
    cliente?: any
  }>({
    open: false,
  })

  const [importDialog, setImportDialog] = useState(false)
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error'
  }>({
    open: false,
    message: '',
    severity: 'success',
  })

  // Queries e mutations
  const { data: clientesData, isLoading, error } = useClientes(filters)
  const updateClienteMutation = useUpdateCliente()

  const clientes = (clientesData?.data as ClientesData)?.clientes || []
  const totalCount = (clientesData?.data as ClientesData)?.total || 0

  // Handlers
  const handleCreateCliente = () => {
    setFormDialog({
      open: true,
      mode: 'create',
    })
  }

  const handleEditCliente = (cliente: any) => {
    setFormDialog({
      open: true,
      mode: 'edit',
      cliente,
    })
  }

  const handleViewCliente = (cliente: any) => {
    setDetailDialog({
      open: true,
      cliente,
    })
  }

  const handleToggleStatus = async (cliente: any) => {
    try {
      const formData = new FormData()
      formData.append('ativo', (!cliente.ativo).toString())

      const result = await updateClienteMutation.mutateAsync({
        id: cliente.id,
        formData,
      })

      if (result.success) {
        setSnackbar({
          open: true,
          message: `Cliente ${cliente.ativo ? 'arquivado' : 'reativado'} com sucesso`,
          severity: 'success',
        })
      } else {
        throw new Error(result.message || 'Erro ao atualizar cliente')
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        severity: 'error',
      })
    }
  }

  const handleFiltersChange = (newFilters: any) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 0 }))
  }

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  const handleFormSuccess = (message: string) => {
    setFormDialog({ open: false, mode: 'create' })
    setSnackbar({
      open: true,
      message,
      severity: 'success',
    })
  }

  const handleImportSuccess = (message: string) => {
    setImportDialog(false)
    setSnackbar({
      open: true,
      message,
      severity: 'success',
    })
  }

  // Configuração das colunas da tabela
  const columns = [
    {
      key: 'nome',
      label: 'Nome',
      render: (cliente: any) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {cliente.nome}
          </Typography>
          {cliente.email && (
            <Typography variant="caption" color="text.secondary">
              {cliente.email}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      key: 'telefone',
      label: 'Telefone',
      render: (cliente: any) => cliente.telefone || '-',
    },
    {
      key: 'created_at',
      label: 'Cadastrado em',
      render: (cliente: any) => {
        const date = new Date(cliente.created_at)
        return date.toLocaleDateString('pt-BR')
      },
    },
    {
      key: 'ativo',
      label: 'Status',
      render: (cliente: any) => (
        <Chip
          label={cliente.ativo ? 'Ativo' : 'Arquivado'}
          color={cliente.ativo ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (cliente: any) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Visualizar">
            <IconButton size="small" onClick={() => handleViewCliente(cliente)}>
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => handleEditCliente(cliente)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title={cliente.ativo ? 'Arquivar' : 'Reativar'}>
            <IconButton
              size="small"
              onClick={() => handleToggleStatus(cliente)}
              disabled={updateClienteMutation.isPending}
            >
              {cliente.ativo ? (
                <ArchiveIcon fontSize="small" />
              ) : (
                <UnarchiveIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ]

  if (error) {
    return (
      <Container maxWidth="xl">
        <PageHeader
          title="Clientes"
          subtitle="Gestão completa de clientes da barbearia"
        />
        <Alert severity="error" sx={{ mt: 2 }}>
          Erro ao carregar clientes: {error.message}
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl">
      <PageHeader
        title="Clientes"
        subtitle="Gestão completa de clientes da barbearia"
      />

      <Stack spacing={3}>
        {/* Filtros e ações */}
        <Card>
          <CardContent>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ sm: 'center' }}
              justifyContent="space-between"
            >
              <ClientesFilters
                filters={filters}
                onChange={handleFiltersChange}
              />

              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<ImportIcon />}
                  onClick={() => setImportDialog(true)}
                >
                  Importar
                </Button>

                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateCliente}
                >
                  Novo Cliente
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Tabela */}
        <Card>
          <DSTable
            columns={columns}
            data={clientes}
            loading={isLoading}
            emptyMessage="Nenhum cliente encontrado"
            pagination={{
              page: filters.page,
              limit: filters.limit,
              total: totalCount,
              onPageChange: handlePageChange,
              onLimitChange: (limit) =>
                setFilters((prev) => ({ ...prev, limit, page: 0 })),
            }}
          />
        </Card>
      </Stack>

      {/* Dialogs */}
      <ClienteFormDialog
        open={formDialog.open}
        mode={formDialog.mode}
        cliente={formDialog.cliente}
        onClose={() => setFormDialog({ open: false, mode: 'create' })}
        onSuccess={handleFormSuccess}
      />

      <ClienteDetailDialog
        open={detailDialog.open}
        cliente={detailDialog.cliente}
        onClose={() => setDetailDialog({ open: false })}
        onEdit={handleEditCliente}
      />

      <ImportClientesDialog
        open={importDialog}
        onClose={() => setImportDialog(false)}
        onSuccess={handleImportSuccess}
      />

      {/* Feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}
