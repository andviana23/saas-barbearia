import {
  Container,
  Box,
  Typography,
  Paper,
  Toolbar,
  Stack,
  Button,
  Chip,
  Divider,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import Link from 'next/link'
import { unstable_noStore as noStore } from 'next/cache'
import type { Metadata } from 'next'

// 🔌 Server Actions (alinhar com backend)
// - getCurrentProfessional()  // opcional, pega profissional logado
// - listQueue({ professionalId, status?, q? })
// - queueCallNextForProfessional({ professionalId })
// - queueStartService({ id })
// - queueFinishService({ id })
// - queueNoShow({ id })
import { listQueue } from '@/actions/queue'
import { listProfessionals } from '@/actions/professionals'
// import { getCurrentProfessional, queueCallNextForProfessional, queueStartService, queueFinishService, queueNoShow } from "@/actions/queue";

/** Tipos **/
export type QueueStatus =
  | 'waiting'
  | 'called'
  | 'in_service'
  | 'completed'
  | 'canceled'
  | 'no_show'
export type Professional = { id: string; name: string }
export type QueueItem = {
  id: string
  ticket: string
  customer_name?: string | null
  service_name?: string | null
  professional_id?: string | null
  professional_name?: string | null
  status: QueueStatus
  arrival_time: string // ISO datetime
  called_at?: string | null
  started_at?: string | null
  notes?: string | null
}
export type QueueResponse = { items: QueueItem[]; total: number }

export const metadata: Metadata = {
  title: 'Profissional - Fila | Trato',
  description: 'Painel do profissional para controle da fila',
}

/** Utils **/
function coerceString(x: unknown): string | undefined {
  if (Array.isArray(x)) return x[0]
  if (typeof x === 'string') return x
  return undefined
}
function minutesBetween(aISO?: string | null, bISO?: string | null) {
  if (!aISO || !bISO) return 0
  const a = new Date(aISO).getTime()
  const b = new Date(bISO).getTime()
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0
  return Math.max(0, Math.round((b - a) / 60000))
}
function nowISO() {
  return new Date().toISOString()
}

export default async function Page({
  searchParams,
}: {
  searchParams: { [k: string]: string | string[] | undefined }
}) {
  noStore()

  // Profissional em contexto (use getCurrentProfessional no mundo real)
  const professionalId = coerceString(searchParams.professionalId) || ''
  const status =
    (coerceString(searchParams.status) as QueueStatus | '' | undefined) || '' // todos por padrão
  const q = coerceString(searchParams.q) ?? ''

  const [professionals, queue] = await Promise.all([
    listProfessionals() as Promise<Professional[]>,
    listQueue({
      professionalId: professionalId || undefined,
      status: status || undefined,
      q: q || undefined,
    }) as Promise<QueueResponse>,
  ])

  // Próximo cliente: prioriza "called" > "waiting" para o profissional atual
  const mine = queue.items.filter(
    (i) => !professionalId || i.professional_id === professionalId
  )
  const next =
    mine.find((i) => i.status === 'called') ||
    mine.find((i) => i.status === 'waiting')

  const now = nowISO()

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          sx={{ mb: 2 }}
          spacing={1}
        >
          <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
            Profissional - Fila
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button component={Link} href="/agenda" variant="outlined">
              Ver agenda
            </Button>
            <Button
              component={Link}
              href="/fila"
              variant="text"
              color="inherit"
            >
              Painel da fila
            </Button>
          </Stack>
        </Stack>

        {/* Contexto do profissional e filtros mínimos */}
        <Paper
          variant="outlined"
          component="form"
          action="/fila/profissional"
          method="get"
          sx={{ p: 2, mb: 3, borderRadius: 3 }}
        >
          <Toolbar
            disableGutters
            sx={{ gap: 2, flexWrap: 'wrap', alignItems: 'center' }}
          >
            <FormControl sx={{ minWidth: 260 }}>
              <InputLabel id="professionalId-label">Profissional</InputLabel>
              <Select
                name="professionalId"
                labelId="professionalId-label"
                label="Profissional"
                defaultValue={professionalId}
              >
                <MenuItem value="">
                  <em>Todos</em>
                </MenuItem>
                {professionals.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                name="status"
                labelId="status-label"
                label="Status"
                defaultValue={status}
              >
                <MenuItem value="">
                  <em>Todos</em>
                </MenuItem>
                <MenuItem value="waiting">Aguardando</MenuItem>
                <MenuItem value="called">Chamado</MenuItem>
                <MenuItem value="in_service">Em atendimento</MenuItem>
              </Select>
            </FormControl>

            <TextField
              name="q"
              label="Pesquisar"
              placeholder="Ticket ou cliente"
              defaultValue={q}
              sx={{ minWidth: 260 }}
            />

            <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
              <Button type="submit" variant="contained">
                Aplicar
              </Button>
              <Button
                component={Link}
                href="/fila/profissional"
                variant="text"
                color="inherit"
              >
                Limpar
              </Button>
            </Stack>
          </Toolbar>
        </Paper>

        {/* Cartão principal: próximo cliente */}
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Próximo cliente
          </Typography>
          {next ? (
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  flexWrap="wrap"
                >
                  <Chip label={`Ticket ${next.ticket}`} color="primary" />
                  <Typography variant="h6">
                    {next.customer_name || 'Cliente'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • {next.service_name || 'Serviço'}
                  </Typography>
                  {next.started_at ? (
                    <Chip size="small" color="primary" label="Em atendimento" />
                  ) : next.called_at ? (
                    <Chip size="small" color="info" label="Chamado" />
                  ) : (
                    <Chip size="small" label="Aguardando" />
                  )}
                </Stack>
              </Grid>
              <Grid item xs={12} md={4}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
                >
                  {/* <form action={queueCallNextForProfessional.bind(null, { professionalId })}><Button type="submit" variant="outlined">Chamar próximo</Button></form> */}
                  <Button
                    component={Link}
                    href={`/fila/profissional?professionalId=${professionalId}&call=next`}
                    variant="outlined"
                  >
                    Chamar próximo
                  </Button>

                  {/* <form action={queueStartService.bind(null, next.id)}><Button type="submit" variant="contained">Iniciar</Button></form> */}
                  <Button
                    component={Link}
                    href={`/fila/profissional?start=${next.id}`}
                    variant="contained"
                  >
                    Iniciar
                  </Button>

                  {/* <form action={queueFinishService.bind(null, next.id)}><Button type="submit" variant="outlined" color="success">Concluir</Button></form> */}
                  <Button
                    component={Link}
                    href={`/fila/profissional?finish=${next.id}`}
                    variant="outlined"
                    color="success"
                  >
                    Concluir
                  </Button>

                  {/* <form action={queueNoShow.bind(null, next.id)}><Button type="submit" variant="text" color="error">No-show</Button></form> */}
                  <Button
                    component={Link}
                    href={`/fila/profissional?nshow=${next.id}`}
                    variant="text"
                    color="error"
                  >
                    No-show
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Nenhum cliente na fila para este profissional.
            </Typography>
          )}
        </Paper>

        {/* Minha fila */}
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom>
            Minha fila
          </Typography>
          <Grid container spacing={1}>
            {mine.length === 0 ? (
              <Grid item xs={12}>
                <Box
                  sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}
                >
                  Sem clientes na sua fila.
                </Box>
              </Grid>
            ) : (
              mine.map((i) => {
                const wait = minutesBetween(i.arrival_time, now)
                return (
                  <Grid item xs={12} md={6} lg={4} key={i.id}>
                    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        flexWrap="wrap"
                      >
                        <Chip size="small" label={i.ticket} />
                        <Typography variant="subtitle1" fontWeight={600}>
                          {i.customer_name || 'Cliente'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          • {i.service_name || 'Serviço'}
                        </Typography>
                        <Chip
                          size="small"
                          variant="outlined"
                          label={`${wait} min`}
                          sx={{ ml: 'auto' }}
                        />
                      </Stack>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Button
                          component={Link}
                          href={`/fila/profissional?call=${i.id}&professionalId=${professionalId}`}
                          size="small"
                          variant="outlined"
                        >
                          Chamar
                        </Button>
                        <Button
                          component={Link}
                          href={`/fila/profissional?start=${i.id}&professionalId=${professionalId}`}
                          size="small"
                          variant="contained"
                        >
                          Iniciar
                        </Button>
                        <Button
                          component={Link}
                          href={`/fila/profissional?finish=${i.id}&professionalId=${professionalId}`}
                          size="small"
                          variant="outlined"
                          color="success"
                        >
                          Concluir
                        </Button>
                        <Button
                          component={Link}
                          href={`/fila/profissional?nshow=${i.id}&professionalId=${professionalId}`}
                          size="small"
                          variant="text"
                          color="error"
                        >
                          No-show
                        </Button>
                      </Stack>
                    </Paper>
                  </Grid>
                )
              })
            )}
          </Grid>
        </Paper>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Dica: mantenha este painel aberto no seu posto de trabalho. Podemos
            ativar atualização automática e notificações de chamada.
          </Typography>
        </Box>
      </Box>
    </Container>
  )
}
