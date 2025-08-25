import {
  Box,
  Container,
  Typography,
  Paper,
  Toolbar,
  Stack,
  Button,
  Chip,
  Divider,
  TextField,
  Grid,
  IconButton,
} from '@mui/material'
import Link from 'next/link'
import { unstable_noStore as noStore } from 'next/cache'
import type { Metadata } from 'next'
import { ArrowBack, ArrowForward } from '@mui/icons-material'

// 🔌 Server Actions previstas — alinhe os caminhos conforme seu projeto (Backend First)
// import { listWorkingHours, upsertWorkingHour, deleteWorkingHour } from "@/actions/professionals-schedules";
// import { getProfessional } from "@/actions/professionals";

/** Tipos alinhados ao backend **/
export type WorkingHour = {
  id: string
  professional_id: string
  /** Data no formato YYYY-MM-DD */
  date: string
  /** intervalo no formato HH:mm */
  start_time: string
  end_time: string
  location?: string | null // unidade/sala opcional
}

export type WorkingHoursResponse = {
  items: WorkingHour[]
  total: number
}

export const metadata: Metadata = {
  title: 'Horários do Profissional | Trato',
  description: 'Gestão de horários de trabalho',
}

/** Utilitários simples de data (sem libs) **/
function toISODate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
function parseISODate(s?: string): Date {
  if (!s) return new Date()
  const [y, m, d] = s.split('-').map(Number)
  const dt = new Date(y, (m || 1) - 1, d || 1)
  if (Number.isNaN(dt.getTime())) return new Date()
  return dt
}
function startOfWeek(date: Date, weekStartsOn: number = 1 /* 1=Mon */) {
  const d = new Date(date)
  const day = (d.getDay() + 7 - weekStartsOn) % 7 // 0..6
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}
function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}
function formatBR(date: Date) {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function coerceString(x: unknown): string | undefined {
  if (Array.isArray(x)) return x[0]
  if (typeof x === 'string') return x
  return undefined
}

interface PageProps {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function HorariosProfissionalPage({
  params,
  searchParams,
}: PageProps) {
  noStore()
  const { id } = params

  // 🔎 Janela da semana (por querystring)
  const startParam = coerceString(searchParams.start)
  const base = startOfWeek(parseISODate(startParam))
  const week = Array.from({ length: 7 }, (_, i) => addDays(base, i))
  const from = toISODate(week[0])
  const to = toISODate(addDays(week[6], 1)) // sem incluir último dia

  // const professional = await getProfessional(id);
  // const data = (await listWorkingHours({ professionalId: id, from, to })) as WorkingHoursResponse;

  // 🔧 Mock local até conectar com o backend
  const professional = {
    id,
    name: '(carregue do backend)',
    role: 'Barbeiro',
  } as const
  const data: WorkingHoursResponse = {
    total: 4,
    items: [
      {
        id: '1',
        professional_id: id,
        date: toISODate(week[1]),
        start_time: '09:00',
        end_time: '12:00',
        location: 'Sala 1',
      },
      {
        id: '2',
        professional_id: id,
        date: toISODate(week[3]),
        start_time: '13:30',
        end_time: '18:00',
        location: 'Sala 2',
      },
      {
        id: '3',
        professional_id: id,
        date: toISODate(week[4]),
        start_time: '09:00',
        end_time: '17:00',
        location: null,
      },
      {
        id: '4',
        professional_id: id,
        date: toISODate(week[6]),
        start_time: '10:00',
        end_time: '14:00',
        location: 'Unidade B',
      },
    ],
  }

  const prevStart = toISODate(addDays(base, -7))
  const nextStart = toISODate(addDays(base, 7))

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 1 }}
        >
          <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
            Horários do Profissional
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              component={Link}
              href={`/profissionais/${id}`}
              variant="outlined"
            >
              Voltar ao perfil
            </Button>
            <Button
              component={Link}
              href={`/profissionais`}
              variant="text"
              color="inherit"
            >
              Lista de profissionais
            </Button>
          </Stack>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {professional.name} • {professional.role}
        </Typography>

        {/* Navegação da semana */}
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 3 }}>
          <Toolbar
            disableGutters
            sx={{ gap: 2, flexWrap: 'wrap', alignItems: 'center' }}
          >
            <IconButton
              component={Link}
              href={`/profissionais/${id}/horarios?start=${prevStart}`}
              aria-label="Semana anterior"
            >
              <ArrowBack />
            </IconButton>
            <Typography variant="h6" sx={{ flex: 1, textAlign: 'center' }}>
              Semana {formatBR(week[0])} — {formatBR(week[6])}
            </Typography>
            <IconButton
              component={Link}
              href={`/profissionais/${id}/horarios?start=${nextStart}`}
              aria-label="Próxima semana"
            >
              <ArrowForward />
            </IconButton>

            <form
              action={`/profissionais/${id}/horarios`}
              method="get"
              style={{ display: 'flex', gap: 8, alignItems: 'center' }}
            >
              <input type="hidden" name="id" value={id} />
              <TextField
                name="start"
                type="date"
                size="small"
                label="Ir para"
                defaultValue={toISODate(base)}
              />
              <Button type="submit" variant="contained">
                Ir
              </Button>
            </form>

            <Divider flexItem orientation="vertical" sx={{ mx: 1 }} />
            <Button
              component={Link}
              href={`/profissionais/${id}/horarios/novo?date=${toISODate(base)}`}
              variant="outlined"
            >
              Adicionar turno
            </Button>
          </Toolbar>
        </Paper>

        {/* Grade semanal */}
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
          <WeekGrid week={week} items={data.items} professionalId={id} />
          <Divider sx={{ my: 2 }} />
          <Legend />
        </Paper>

        {/* Seção de criação rápida (exemplo com POST comentado) */}
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Adicionar turno rápido
          </Typography>
          {/* 
          <form action={upsertWorkingHour} method="post" style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(6, minmax(0, 1fr))" }}>
            <input type="hidden" name="professional_id" value={id} />
            <TextField name="date" type="date" label="Data" required />
            <TextField name="start_time" type="time" label="Início" required />
            <TextField name="end_time" type="time" label="Fim" required />
            <TextField name="location" label="Local (opcional)" />
            <div />
            <Button type="submit" variant="contained">Salvar</Button>
          </form>
          */}
          <Typography variant="body2" color="text.secondary">
            Conecte a Server Action <code>upsertWorkingHour</code> e descomente
            o formulário acima.
          </Typography>
        </Paper>
      </Box>
    </Container>
  )
}

function WeekGrid({
  week,
  items,
  professionalId,
}: {
  week: Date[]
  items: WorkingHour[]
  professionalId: string
}) {
  const byDate = new Map<string, WorkingHour[]>()
  for (const w of items) {
    const arr = byDate.get(w.date) ?? []
    arr.push(w)
    byDate.set(w.date, arr)
  }

  return (
    <Grid container spacing={2}>
      {week.map((d, idx) => {
        const key = toISODate(d)
        const dayItems = (byDate.get(key) ?? []).sort((a, b) =>
          a.start_time.localeCompare(b.start_time)
        )
        const isWeekend = d.getDay() === 0 || d.getDay() === 6
        return (
          <Grid item xs={12} sm={6} md={3} lg={(12 / 7) as any} key={key}>
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                borderRadius: 3,
                bgcolor: isWeekend ? 'action.hover' : undefined,
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1 }}
              >
                <Typography variant="subtitle2" fontWeight={600}>
                  {weekdayLabel(d)} • {formatBR(d)}
                </Typography>
                <Button
                  component={Link}
                  href={`/profissionais/${professionalId}/horarios/novo?date=${key}`}
                  size="small"
                >
                  + turno
                </Button>
              </Stack>
              <Stack direction="column" spacing={1}>
                {dayItems.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Sem turnos cadastrados.
                  </Typography>
                ) : (
                  dayItems.map((it) => (
                    <ShiftChip
                      key={it.id}
                      item={it}
                      professionalId={professionalId}
                    />
                  ))
                )}
              </Stack>
            </Paper>
          </Grid>
        )
      })}
    </Grid>
  )
}

function ShiftChip({
  item,
  professionalId,
}: {
  item: WorkingHour
  professionalId: string
}) {
  const label = `${item.start_time} – ${item.end_time}${item.location ? ` · ${item.location}` : ''}`
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Chip label={label} variant="outlined" />
      <Button
        component={Link}
        href={`/profissionais/${professionalId}/horarios/${item.id}`}
        size="small"
      >
        Editar
      </Button>
      {/* <form action={deleteWorkingHour.bind(null, item.id)}><Button size="small" color="error" type="submit">Excluir</Button></form> */}
    </Stack>
  )
}

function Legend() {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{ alignItems: 'center', justifyContent: 'space-between' }}
    >
      <Typography variant="body2" color="text.secondary">
        Dica: use períodos curtos (ex.: 09:00–12:00, 13:30–18:00) para permitir
        intervalos e controlar a capacidade de agenda.
      </Typography>
      <Stack direction="row" spacing={2}>
        <Chip label="Dia útil" variant="outlined" />
        <Chip
          label="Fim de semana"
          color="default"
          variant="filled"
          sx={{ bgcolor: 'action.hover' }}
        />
      </Stack>
    </Stack>
  )
}

function weekdayLabel(d: Date) {
  const n = d.getDay()
  const names = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const
  return names[n] ?? ''
}
