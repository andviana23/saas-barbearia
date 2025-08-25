'use client'

import * as React from 'react'
import {
  Box,
  Container,
  Typography,
  Paper,
  Toolbar,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableSortLabel,
  Divider,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import { useState } from 'react'

// Types
export type Service = {
  id: string
  name: string
  description?: string | null
  category_id: string
  category_name?: string
  duration_minutes: number
  price: number
  is_active: boolean
  created_at?: string | null
}

export type ServiceCategory = {
  id: string
  name: string
  is_active: boolean
}

export type ServicesResponse = {
  items: Service[]
  total: number
}

interface ServicosContentProps {
  initialData: ServicesResponse
  categories: ServiceCategory[]
  searchParams: Record<string, string>
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount)
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}min`
  } else if (hours > 0) {
    return `${hours}h`
  } else {
    return `${mins}min`
  }
}

export function ServicosContent({
  initialData,
  categories,
  searchParams,
}: ServicosContentProps) {
  const [services, setServices] = useState(initialData)
  const [openCreateDialog, setOpenCreateDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  const handleEdit = (service: Service) => {
    setSelectedService(service)
    setOpenEditDialog(true)
  }

  const handleDelete = async (serviceId: string) => {
    // TODO: Implementar exclusão via server action
    console.log('Delete service:', serviceId)
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 3 }}
        >
          <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
            Serviços
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" href="/servicos/categorias">
              Categorias
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenCreateDialog(true)}
            >
              Novo Serviço
            </Button>
          </Stack>
        </Stack>

        {/* Filtros */}
        <Paper
          variant="outlined"
          component="form"
          action="/servicos"
          method="get"
          sx={{ p: 2, mb: 3, borderRadius: 3 }}
        >
          <Toolbar disableGutters sx={{ gap: 2, flexWrap: 'wrap' }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              sx={{ flex: 1 }}
            >
              <TextField
                name="q"
                label="Pesquisar"
                placeholder="Nome ou descrição do serviço"
                defaultValue={searchParams.q || ''}
                fullWidth
              />

              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel id="category-label">Categoria</InputLabel>
                <Select
                  labelId="category-label"
                  name="category"
                  label="Categoria"
                  defaultValue={searchParams.category || ''}
                >
                  <MenuItem value="">
                    <em>Todas</em>
                  </MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  name="status"
                  label="Status"
                  defaultValue={searchParams.status || ''}
                >
                  <MenuItem value="">
                    <em>Todos</em>
                  </MenuItem>
                  <MenuItem value="active">Ativo</MenuItem>
                  <MenuItem value="inactive">Inativo</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel id="price-label">Preço</InputLabel>
                <Select
                  labelId="price-label"
                  name="priceRange"
                  label="Preço"
                  defaultValue={searchParams.priceRange || ''}
                >
                  <MenuItem value="">
                    <em>Todos</em>
                  </MenuItem>
                  <MenuItem value="0-50">Até R$ 50</MenuItem>
                  <MenuItem value="50-100">R$ 50 - R$ 100</MenuItem>
                  <MenuItem value="100-200">R$ 100 - R$ 200</MenuItem>
                  <MenuItem value="200+">Acima de R$ 200</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <Stack direction="row" spacing={1}>
              <Button type="submit" variant="contained">
                Aplicar
              </Button>
              <Button href="/servicos" variant="text" color="inherit">
                Limpar
              </Button>
            </Stack>
          </Toolbar>
        </Paper>

        {/* Resumo */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={3}>
            <Paper
              variant="outlined"
              sx={{ p: 2, borderRadius: 3, textAlign: 'center' }}
            >
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total de Serviços
              </Typography>
              <Typography variant="h4" color="primary.main">
                {services.total}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper
              variant="outlined"
              sx={{ p: 2, borderRadius: 3, textAlign: 'center' }}
            >
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Serviços Ativos
              </Typography>
              <Typography variant="h4" color="success.main">
                {services.items.filter((s) => s.is_active).length}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper
              variant="outlined"
              sx={{ p: 2, borderRadius: 3, textAlign: 'center' }}
            >
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Preço Médio
              </Typography>
              <Typography variant="h4" color="info.main">
                {formatCurrency(
                  services.items.length > 0
                    ? services.items.reduce((sum, s) => sum + s.price, 0) /
                        services.items.length
                    : 0
                )}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Paper
              variant="outlined"
              sx={{ p: 2, borderRadius: 3, textAlign: 'center' }}
            >
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Duração Média
              </Typography>
              <Typography variant="h4" color="warning.main">
                {services.items.length > 0
                  ? formatDuration(
                      Math.round(
                        services.items.reduce(
                          (sum, s) => sum + s.duration_minutes,
                          0
                        ) / services.items.length
                      )
                    )
                  : '0min'}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Lista */}
        <Paper variant="outlined" sx={{ borderRadius: 3 }}>
          <Table size="small" aria-label="Tabela de serviços">
            <TableHead>
              <TableRow>
                <TableCell>Serviço</TableCell>
                <TableCell>Categoria</TableCell>
                <TableCell align="center">Duração</TableCell>
                <TableCell align="right">Preço</TableCell>
                <TableCell align="center" sx={{ width: 100 }}>
                  Status
                </TableCell>
                <TableCell align="right" sx={{ width: 120 }}>
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {services.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Box
                      sx={{
                        py: 6,
                        textAlign: 'center',
                        color: 'text.secondary',
                      }}
                    >
                      Nenhum serviço encontrado com os filtros atuais.
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                services.items.map((service) => (
                  <TableRow key={service.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          {service.name}
                        </Typography>
                        {service.description && (
                          <Typography variant="body2" color="text.secondary">
                            {service.description}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{service.category_name || '—'}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={formatDuration(service.duration_minutes)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" fontWeight={600}>
                        {formatCurrency(service.price)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {service.is_active ? (
                        <Chip label="Ativo" color="success" size="small" />
                      ) : (
                        <Chip label="Inativo" size="small" />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                      >
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(service)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(service.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Paper>

        {/* TODO: Implementar modais de criação e edição */}
        {/* <ServicoFormDialog 
          open={openCreateDialog} 
          onClose={() => setOpenCreateDialog(false)}
          categories={categories}
        />
        
        <ServicoFormDialog 
          open={openEditDialog} 
          onClose={() => setOpenEditDialog(false)}
          service={selectedService}
          categories={categories}
        /> */}
      </Box>
    </Container>
  )
}
