// app/agenda/[id]/page.tsx
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link as MUILink,
  Stack,
  Chip,
  Button,
  Divider,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Skeleton,
} from '@mui/material'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import EditIcon from '@mui/icons-material/Edit'
import PrintIcon from '@mui/icons-material/Print'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'

interface AgendamentoDetailPageProps {
  params: { id: string }
  searchParams?: { tab?: string }
}

export const metadata = {
  title: 'Detalhes do Agendamento | Trato',
  description: 'Visualizar detalhes do agendamento',
}

export default function AgendamentoDetailPage({
  params,
  searchParams,
}: AgendamentoDetailPageProps) {
  const id = params?.id
  if (!id) return notFound()

  const currentTab = (searchParams?.tab ?? 'detalhes') as
    | 'detalhes'
    | 'historico'
    | 'pagamentos'

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Header id={id} />
        <ToolbarActions id={id} />

        <Stack spacing={3} sx={{ mt: 2 }}>
          <Suspense fallback={<ResumeSkeleton />}>
            {/* TODO: Conectar com dados reais do agendamento via fetch/SSR */}
            <ResumeGrid
              resumo={{
                status: 'CONFIRMADO',
                cliente: { nome: 'João Silva', telefone: '(11) 99999-0000' },
                profissional: { nome: 'Carlos Barbosa' },
                servico: { nome: 'Corte + Barba' },
                data: '2025-09-10',
                hora: '14:30',
                duracaoMin: 60,
                preco: 89.9,
                unidade: 'Barbearia Centro',
                origem: 'App',
              }}
            />
          </Suspense>

          <Card variant="outlined">
            <TabsNav id={id} current={currentTab} />
            <Divider />
            <Box sx={{ p: 2 }}>
              {currentTab === 'detalhes' && (
                <>
                  {/* TODO: Implementar AgendamentoCard component com todas informações, observações e anexos */}
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Informações do Agendamento
                  </Typography>
                  <AgendamentoInfoPlaceholder />
                </>
              )}

              {currentTab === 'historico' && (
                <>
                  {/* TODO: Implementar Timeline/Histórico (criação, confirmações, remarcações, check-in/checkout, cancelamentos) */}
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Histórico de eventos
                  </Typography>
                  <HistoricoPlaceholder />
                </>
              )}

              {currentTab === 'pagamentos' && (
                <>
                  {/* TODO: Implementar PagamentosSection (transações, métodos, comprovantes, estorno) */}
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Pagamentos
                  </Typography>
                  <PagamentosPlaceholder />
                </>
              )}
            </Box>
          </Card>
        </Stack>
      </Box>
    </Container>
  )
}

function Header({ id }: { id: string }) {
  return (
    <Box>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
        <MUILink
          component={Link}
          href="/agenda"
          underline="hover"
          color="inherit"
        >
          Agenda
        </MUILink>
        <Typography color="text.primary">Agendamento #{id}</Typography>
      </Breadcrumbs>

      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h4" gutterBottom>
            Detalhes do Agendamento
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Visualização e ações do agendamento #{id}
          </Typography>
        </Box>
      </Stack>
    </Box>
  )
}

function ToolbarActions({ id }: { id: string }) {
  return (
    <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap">
      {/* TODO: Conectar handlers reais */}
      <Button variant="contained" startIcon={<CheckCircleIcon />}>
        Check-in
      </Button>
      <Button variant="outlined" color="secondary" startIcon={<CancelIcon />}>
        Cancelar
      </Button>
      <Button
        variant="outlined"
        startIcon={<EditIcon />}
        component={Link}
        href={`/agenda/${id}/editar`}
      >
        Editar
      </Button>
      <Button variant="outlined" startIcon={<PrintIcon />}>
        Imprimir
      </Button>
      <Button variant="text" endIcon={<MoreHorizIcon />}>
        Mais
      </Button>
    </Stack>
  )
}

type Resumo = {
  status:
    | 'PENDENTE'
    | 'CONFIRMADO'
    | 'CANCELADO'
    | 'CONCLUIDO'
    | 'NAO_COMPARECEU'
  cliente: { nome: string; telefone?: string }
  profissional: { nome: string }
  servico: { nome: string }
  data: string // ISO yyyy-mm-dd
  hora: string // HH:mm
  duracaoMin: number
  preco: number
  unidade?: string
  origem?: string
}

function ResumeGrid({ resumo }: { resumo: Resumo }) {
  const statusColor: Record<
    Resumo['status'],
    'default' | 'primary' | 'success' | 'warning' | 'error'
  > = {
    PENDENTE: 'warning',
    CONFIRMADO: 'primary',
    CONCLUIDO: 'success',
    CANCELADO: 'error',
    NAO_COMPARECEU: 'default',
  }

  const money = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const dateBR = (date: string, time: string) => {
    try {
      const d = new Date(`${date}T${time}:00`)
      return d.toLocaleString('pt-BR', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return `${date} ${time}`
    }
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={8}>
        <Card variant="outlined">
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Typography variant="h6">Resumo</Typography>
              <Chip
                label={resumo.status}
                color={statusColor[resumo.status]}
                size="small"
              />
            </Stack>

            <Grid container spacing={2}>
              <InfoItem
                label="Cliente"
                value={resumo.cliente.nome}
                extra={resumo.cliente.telefone}
              />
              <InfoItem label="Profissional" value={resumo.profissional.nome} />
              <InfoItem label="Serviço" value={resumo.servico.nome} />
              <InfoItem
                label="Data & Hora"
                value={dateBR(resumo.data, resumo.hora)}
              />
              <InfoItem label="Duração" value={`${resumo.duracaoMin} min`} />
              <InfoItem label="Preço" value={money(resumo.preco)} />
              {resumo.unidade && (
                <InfoItem label="Unidade" value={resumo.unidade} />
              )}
              {resumo.origem && (
                <InfoItem label="Origem" value={resumo.origem} />
              )}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Ações rápidas
            </Typography>
            <Stack spacing={1}>
              {/* TODO: Conectar com modais/rotas específicas */}
              <Button
                fullWidth
                variant="contained"
                startIcon={<CheckCircleIcon />}
              >
                Confirmar presença
              </Button>
              <Button fullWidth variant="outlined" startIcon={<CancelIcon />}>
                Remarcar / Cancelar
              </Button>
              <Button fullWidth variant="outlined" startIcon={<PrintIcon />}>
                Comprovante / Recibo
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

function InfoItem({
  label,
  value,
  extra,
}: {
  label: string
  value: string
  extra?: string
}) {
  return (
    <Grid item xs={12} sm={6}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1" sx={{ display: 'block' }}>
        {value}
      </Typography>
      {extra && (
        <Typography variant="body2" color="text.secondary">
          {extra}
        </Typography>
      )}
    </Grid>
  )
}

function TabsNav({
  id,
  current,
}: {
  id: string
  current: 'detalhes' | 'historico' | 'pagamentos'
}) {
  const tabs = [
    { value: 'detalhes', label: 'Detalhes' },
    { value: 'historico', label: 'Histórico' },
    { value: 'pagamentos', label: 'Pagamentos' },
  ] as const

  return (
    <Tabs
      value={current}
      variant="scrollable"
      scrollButtons="auto"
      aria-label="Navegação de detalhes do agendamento"
      sx={{ px: 2 }}
    >
      {tabs.map((t) => (
        <Tab
          key={t.value}
          value={t.value}
          label={t.label}
          component={Link}
          href={`/agenda/${id}?tab=${t.value}`}
        />
      ))}
    </Tabs>
  )
}

/**
 * PLACEHOLDERS — Substituir pelos componentes reais de domínio
 */

function AgendamentoInfoPlaceholder() {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Observações
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {/* TODO: Renderizar observações do agendamento */}
              Sem observações adicionadas.
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Itens & adicionais
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {/* TODO: Listar serviços adicionais, descontos, cupons */}
              Nenhum adicional vinculado.
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

function HistoricoPlaceholder() {
  return (
    <Stack spacing={1}>
      <ItemLine
        primary="Agendamento criado"
        secondary="por Ana (recepção) — 10/09/2025 09:12"
      />
      <ItemLine
        primary="Status atualizado para CONFIRMADO"
        secondary="via App — 10/09/2025 09:15"
      />
      {/* TODO: Timeline real */}
    </Stack>
  )
}

function ItemLine({
  primary,
  secondary,
}: {
  primary: string
  secondary?: string
}) {
  return (
    <Box>
      <Typography variant="body1">{primary}</Typography>
      {secondary && (
        <Typography variant="body2" color="text.secondary">
          {secondary}
        </Typography>
      )}
      <Divider sx={{ my: 1 }} />
    </Box>
  )
}

function PagamentosPlaceholder() {
  return (
    <Stack spacing={2}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Transações
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {/* TODO: Tabela de pagamentos, método (PIX/Cartão/Dinheiro), status, valor, recibo */}
            Nenhuma transação registrada.
          </Typography>
        </CardContent>
      </Card>

      <Stack direction="row" spacing={1}>
        {/* TODO: Conectar ações de cobrança/estorno */}
        <Button variant="contained">Registrar pagamento</Button>
        <Button variant="outlined">Emitir recibo</Button>
      </Stack>
    </Stack>
  )
}

function ResumeSkeleton() {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={8}>
        <Card variant="outlined">
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Skeleton variant="text" width={120} height={28} />
              <Skeleton variant="rounded" width={90} height={28} />
            </Stack>
            <Grid container spacing={2}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Grid item xs={12} sm={6} key={i}>
                  <Skeleton variant="text" width={100} />
                  <Skeleton variant="text" width="80%" />
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card variant="outlined">
          <CardContent>
            <Skeleton variant="text" width={140} height={28} sx={{ mb: 2 }} />
            <Stack spacing={1}>
              <Skeleton variant="rounded" height={40} />
              <Skeleton variant="rounded" height={40} />
              <Skeleton variant="rounded" height={40} />
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
