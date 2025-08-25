'use client'

import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  IconButton,
  Box,
  Divider,
  Card,
  CardContent,
  Chip,
  Grid,
} from '@mui/material'
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Cake as CakeIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material'

interface ClienteDetailDialogProps {
  open: boolean
  cliente?: any
  onClose: () => void
  onEdit: (cliente: any) => void
}

export default function ClienteDetailDialog({
  open,
  cliente,
  onClose,
  onEdit,
}: ClienteDetailDialogProps) {
  if (!cliente) return null

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleDateString('pt-BR')
    } catch {
      return '-'
    }
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-'
    try {
      return new Date(dateString).toLocaleString('pt-BR')
    } catch {
      return '-'
    }
  }

  const handleEdit = () => {
    onEdit(cliente)
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: 400 },
      }}
    >
      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="h6">Detalhes do Cliente</Typography>
            <Chip
              label={cliente.ativo ? 'Ativo' : 'Arquivado'}
              color={cliente.ativo ? 'success' : 'default'}
              size="small"
            />
          </Stack>

          <Stack direction="row" spacing={1}>
            <IconButton onClick={handleEdit} color="primary" size="small">
              <EditIcon />
            </IconButton>

            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {/* Informações Básicas */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Informações Básicas
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="h5" component="div">
                      {cliente.nome}
                    </Typography>
                  </Stack>
                </Grid>

                {cliente.email && (
                  <Grid item xs={12} sm={6}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <EmailIcon color="action" fontSize="small" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Email
                        </Typography>
                        <Typography variant="body1">{cliente.email}</Typography>
                      </Box>
                    </Stack>
                  </Grid>
                )}

                {cliente.telefone && (
                  <Grid item xs={12} sm={6}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <PhoneIcon color="action" fontSize="small" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Telefone
                        </Typography>
                        <Typography variant="body1">
                          {cliente.telefone}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                )}

                {cliente.data_nascimento && (
                  <Grid item xs={12} sm={6}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CakeIcon color="action" fontSize="small" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Data de Nascimento
                        </Typography>
                        <Typography variant="body1">
                          {formatDate(cliente.data_nascimento)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                )}

                <Grid item xs={12} sm={6}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CalendarIcon color="action" fontSize="small" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Cliente desde
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(cliente.created_at)}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>

              {cliente.observacoes && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Observações
                    </Typography>
                    <Typography variant="body1">
                      {cliente.observacoes}
                    </Typography>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>

          {/* Histórico Resumido */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Resumo de Atividades
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      0
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Agendamentos
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      0
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Atendimentos
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main">
                      R$ 0,00
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Gasto
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="text.secondary">
                      -
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Último Atendimento
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Metadados */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Informações do Sistema
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Criado em
                  </Typography>
                  <Typography variant="body1">
                    {formatDateTime(cliente.created_at)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Última atualização
                  </Typography>
                  <Typography variant="body1">
                    {formatDateTime(cliente.updated_at)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    ID do Cliente
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                  >
                    {cliente.id}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleEdit}
          variant="outlined"
          startIcon={<EditIcon />}
        >
          Editar
        </Button>

        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  )
}
