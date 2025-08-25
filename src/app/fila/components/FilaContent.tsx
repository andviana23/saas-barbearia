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
  Divider,
  Grid,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import PersonOffIcon from '@mui/icons-material/PersonOff'
import CallIcon from '@mui/icons-material/Call'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import PeopleIcon from '@mui/icons-material/People'
import { useState } from 'react'

// Types
export type QueueStatus =
  | 'waiting'
  | 'called'
  | 'in_service'
  | 'completed'
  | 'canceled'
  | 'no_show'

export type QueueItem = {
  id: string
  ticket: string
  customer_name?: string | null
  service_name?: string | null
  unit_id: string
  unit_name?: string
  professional_id?: string | null
  professional_name?: string | null
  status: QueueStatus
  arrival_time: string
  called_at?: string | null
  started_at?: string | null
  finished_at?: string | null
  notes?: string | null
  estimated_duration?: number | null
}

export type Unit = {
  id: string
  name: string
}

export type Professional = {
  id: string
  name: string
}

export type QueueResponse = {
  items: QueueItem[]
  total: number
}

interface FilaContentProps {
  initialData: QueueResponse
  units: Unit[]
  professionals: Professional[]
  searchParams: Record<string, string>
}

function minutesBetween(startISO: string, endISO?: string) {
  const start = new Date(startISO).getTime()
  const end = endISO ? new Date(endISO).getTime() : Date.now()
  return Math.max(0, Math.round((end - start) / 60000))
}

function statusChip(status: QueueStatus) {
  switch (status) {
    case 'waiting':
      return <Chip label="Aguardando" size="small" />
    case 'called':
      return <Chip label="Chamado" color="info" size="small" />
    case 'in_service':
      return <Chip label="Em atendimento" color="primary" size="small" />
    case 'completed':
      return <Chip label="Concluído" color="success" size="small" />
    case 'canceled':
      return <Chip label="Cancelado" color="warning" size="small" />
    case 'no_show':
      return <Chip label="No-show" color="error" size="small" />
    default:
      return <Chip label={status} size="small" />
  }
}

function formatTime(isoString: string) {
  return new Date(isoString).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function FilaContent({
  initialData,
  units,
  professionals,
  searchParams,
}: FilaContentProps) {
  const [queue, setQueue] = useState(initialData)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Estatísticas da fila
  const stats = {
    waiting: queue.items.filter((item) => item.status === 'waiting').length,
    inService: queue.items.filter((item) => item.status === 'in_service')
      .length,
    avgWaitTime:
      queue.items.filter((item) => item.status === 'waiting').length > 0
        ? Math.round(
            queue.items
              .filter((item) => item.status === 'waiting')
              .reduce(
                (sum, item) => sum + minutesBetween(item.arrival_time),
                0
              ) / queue.items.filter((item) => item.status === 'waiting').length
          )
        : 0,
    total: queue.total,
  }

  const handleCallNext = async () => {
    // TODO: Implementar chamar próximo via server action
    console.log('Call next in queue')
  }

  const handleCallItem = async (itemId: string) => {
    // TODO: Implementar chamar item específico via server action
    console.log('Call item:', itemId)
  }

  const handleStartService = async (itemId: string) => {
    // TODO: Implementar iniciar atendimento via server action
    console.log('Start service:', itemId)
  }

  const handleFinishService = async (itemId: string) => {
    // TODO: Implementar finalizar atendimento via server action
    console.log('Finish service:', itemId)
  }

  const handleCancelItem = async (itemId: string) => {
    // TODO: Implementar cancelar item via server action
    console.log('Cancel item:', itemId)
  }

  const handleNoShow = async (itemId: string) => {
    // TODO: Implementar marcar como no-show via server action
    console.log('Mark as no-show:', itemId)
  }

  const handleRefresh = () => {
    // TODO: Atualizar dados da fila
    console.log('Refresh queue')
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          sx={{ mb: 3 }}
          spacing={1}
        >
          <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
            Fila de Atendimento
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" href="/agenda/novo">
              Novo Agendamento
            </Button>
            <Button
              variant="contained"
              onClick={handleCallNext}
              disabled={stats.waiting === 0}
            >
              Chamar Próximo
            </Button>
            <Button variant="text" onClick={handleRefresh}>
              Atualizar
            </Button>
          </Stack>
        </Stack>

        {/* Filtros */}
        <Paper
          variant="outlined"
          component="form"
          action="/fila"
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
                placeholder="Ticket, cliente, serviço"
                defaultValue={searchParams.q || ''}
                fullWidth
                sx={{ maxWidth: 300 }}
              />

              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel id="unit-label">Unidade</InputLabel>
                <Select
                  labelId="unit-label"
                  name="unitId"
                  label="Unidade"
                  defaultValue={searchParams.unitId || ''}
                >
                  <MenuItem value="">
                    <em>Todas</em>
                  </MenuItem>
                  {units.map((unit) => (
                    <MenuItem key={unit.id} value={unit.id}>
                      {unit.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel id="professional-label">Profissional</InputLabel>
                <Select
                  labelId="professional-label"
                  name="professionalId"
                  label="Profissional"
                  defaultValue={searchParams.professionalId || ''}
                >
                  <MenuItem value="">
                    <em>Todos</em>
                  </MenuItem>
                  {professionals.map((professional) => (
                    <MenuItem key={professional.id} value={professional.id}>
                      {professional.name}
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
                  <MenuItem value="waiting">Aguardando</MenuItem>
                  <MenuItem value="called">Chamado</MenuItem>
                  <MenuItem value="in_service">Em atendimento</MenuItem>
                  <MenuItem value="completed">Concluído</MenuItem>
                  <MenuItem value="canceled">Cancelado</MenuItem>
                  <MenuItem value="no_show">No-show</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <Stack direction="row" spacing={1}>
              <Button type="submit" variant="contained">
                Aplicar
              </Button>
              <Button href="/fila" variant="text" color="inherit">
                Limpar
              </Button>
            </Stack>
          </Toolbar>
        </Paper>

        {/* Estatísticas */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              variant="outlined"
              sx={{ p: 2, borderRadius: 3, textAlign: 'center' }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="center"
                spacing={1}
                sx={{ mb: 1 }}
              >
                <PeopleIcon color="primary" />
                <Typography variant="body2" color="text.secondary">
                  Aguardando
                </Typography>
              </Stack>
              <Typography variant="h4" color="primary.main">
                {stats.waiting}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              variant="outlined"
              sx={{ p: 2, borderRadius: 3, textAlign: 'center' }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="center"
                spacing={1}
                sx={{ mb: 1 }}
              >
                <PlayArrowIcon color="info" />
                <Typography variant="body2" color="text.secondary">
                  Em Atendimento
                </Typography>
              </Stack>
              <Typography variant="h4" color="info.main">
                {stats.inService}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              variant="outlined"
              sx={{ p: 2, borderRadius: 3, textAlign: 'center' }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="center"
                spacing={1}
                sx={{ mb: 1 }}
              >
                <AccessTimeIcon color="warning" />
                <Typography variant="body2" color="text.secondary">
                  Espera Média (min)
                </Typography>
              </Stack>
              <Typography variant="h4" color="warning.main">
                {stats.avgWaitTime}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              variant="outlined"
              sx={{ p: 2, borderRadius: 3, textAlign: 'center' }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="center"
                spacing={1}
                sx={{ mb: 1 }}
              >
                <PeopleIcon color="success" />
                <Typography variant="body2" color="text.secondary">
                  Total na Fila
                </Typography>
              </Stack>
              <Typography variant="h4" color="success.main">
                {stats.total}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Lista da Fila */}
        <Paper variant="outlined" sx={{ borderRadius: 3 }}>
          <Table size="small" aria-label="Tabela da fila">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 120 }}>Ticket</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Serviço</TableCell>
                <TableCell>Profissional</TableCell>
                <TableCell>Chegada</TableCell>
                <TableCell align="right">Espera</TableCell>
                <TableCell align="center" sx={{ width: 140 }}>
                  Status
                </TableCell>
                <TableCell align="right" sx={{ width: 200 }}>
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {queue.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Box
                      sx={{
                        py: 6,
                        textAlign: 'center',
                        color: 'text.secondary',
                      }}
                    >
                      Nenhum item na fila no momento.
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                queue.items.map((item) => {
                  const waitTime = minutesBetween(item.arrival_time)
                  const arrivalTime = formatTime(item.arrival_time)

                  return (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Typography variant="body1" fontWeight={600}>
                          {item.ticket}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1">
                          {item.customer_name || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {item.service_name || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {item.professional_name || <em>A definir</em>}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{arrivalTime}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          fontWeight={waitTime > 30 ? 600 : 400}
                          color={
                            waitTime > 30 ? 'warning.main' : 'text.primary'
                          }
                        >
                          {waitTime} min
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {statusChip(item.status)}
                      </TableCell>
                      <TableCell align="right">
                        <Stack
                          direction="row"
                          spacing={0.5}
                          justifyContent="flex-end"
                        >
                          {item.status === 'waiting' && (
                            <Tooltip title="Chamar">
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() => handleCallItem(item.id)}
                              >
                                <CallIcon />
                              </IconButton>
                            </Tooltip>
                          )}

                          {(item.status === 'called' ||
                            item.status === 'waiting') && (
                            <Tooltip title="Iniciar Atendimento">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleStartService(item.id)}
                              >
                                <PlayArrowIcon />
                              </IconButton>
                            </Tooltip>
                          )}

                          {item.status === 'in_service' && (
                            <Tooltip title="Finalizar Atendimento">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleFinishService(item.id)}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                          )}

                          {item.status !== 'completed' &&
                            item.status !== 'canceled' &&
                            item.status !== 'no_show' && (
                              <>
                                <Tooltip title="Cancelar">
                                  <IconButton
                                    size="small"
                                    color="warning"
                                    onClick={() => handleCancelItem(item.id)}
                                  >
                                    <CancelIcon />
                                  </IconButton>
                                </Tooltip>

                                <Tooltip title="No-show">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleNoShow(item.id)}
                                  >
                                    <PersonOffIcon />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </Paper>

        {/* Dicas */}
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Dica:</strong> Mantenha este painel aberto na recepção para
            acompanhar a fila em tempo real. Os tempos de espera são calculados
            automaticamente desde a chegada do cliente.
          </Typography>
        </Alert>
      </Box>
    </Container>
  )
}
