import {
  Container,
  Box,
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
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableSortLabel,
  Grid,
  Alert,
} from '@mui/material';
import Link from 'next/link';
import { unstable_noStore as noStore } from 'next/cache';
import type { Metadata } from 'next';

// 🔌 Server Actions previstas (alinhar caminhos/contratos com backend)
// - listQueue({ unitId?, status?, q? })
// - listUnits()
// - listProfessionals()
// - queueCallNext({ unitId })
// - queuePrioritize({ id })
// - queueDeprioritize({ id })
// - queueAssign({ id, professionalId })
// - queueSkip({ id })
// - queueCancel({ id })
import { listQueue } from '@/actions/queue';
import { listUnits } from '@/actions/units';
import { listProfessionals } from '@/actions/professionals';

/** Tipos **/
export type Unit = { id: string; name: string };
export type Professional = { id: string; name: string };
export type QueueStatus =
  | 'waiting'
  | 'called'
  | 'in_service'
  | 'completed'
  | 'canceled'
  | 'no_show';
export type QueueItem = {
  id: string;
  ticket: string; // A-001
  priority?: number; // menor = maior prioridade (ex.: 0,1,2...)
  customer_name?: string | null;
  service_name?: string | null;
  unit_id: string;
  unit_name?: string;
  professional_id?: string | null;
  professional_name?: string | null;
  status: QueueStatus;
  arrival_time: string; // ISO datetime
  notes?: string | null;
};

export type QueueResponse = { items: QueueItem[]; total: number };

export const metadata: Metadata = {
  title: 'Recepção - Fila | Trato',
  description: 'Painel da recepção para controle da fila',
};

/** Utils **/
function coerceString(x: unknown): string | undefined {
  if (Array.isArray(x)) return x[0];
  if (typeof x === 'string') return x;
  return undefined;
}
function minutesBetween(aISO?: string | null, bISO?: string | null) {
  if (!aISO || !bISO) return 0;
  const a = new Date(aISO).getTime();
  const b = new Date(bISO).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
  return Math.max(0, Math.round((b - a) / 60000));
}
function nowISO() {
  return new Date().toISOString();
}

export default async function Page({
  searchParams,
}: {
  searchParams: { [k: string]: string | string[] | undefined };
}) {
  noStore();

  // Filtros principais da recepção
  const q = coerceString(searchParams.q) ?? '';
  const unitId = coerceString(searchParams.unitId) || '';
  const status = (coerceString(searchParams.status) as QueueStatus | '' | undefined) || 'waiting'; // default: aguardando
  const sortBy = coerceString(searchParams.sortBy) || 'priority'; // priority|arrival|ticket
  const sortDir = coerceString(searchParams.sortDir) === 'desc' ? 'desc' : 'asc';

  const [units, professionals, queue] = await Promise.all([
    listUnits() as Promise<Unit[]>,
    listProfessionals() as Promise<Professional[]>,
    listQueue({
      q: q || undefined,
      unitId: unitId || undefined,
      status: status || undefined,
      sortBy,
      sortDir,
    }) as Promise<QueueResponse>,
  ]);

  // KPIs rápidos
  const now = nowISO();
  const waiting = queue.items.filter((i) => i.status === 'waiting');
  const called = queue.items.filter((i) => i.status === 'called');
  const avgWait = waiting.length
    ? Math.round(
        waiting.reduce((a, i) => a + minutesBetween(i.arrival_time, now), 0) / waiting.length,
      )
    : 0;

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
            Recepção - Fila
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button component={Link} href="/agenda/novo" variant="outlined">
              Novo agendamento
            </Button>
            <Button component={Link} href="/fila" variant="text" color="inherit">
              Abrir painel gerencial
            </Button>
          </Stack>
        </Stack>

        {/* KPI Cards */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={4} md={3}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Aguardando
              </Typography>
              <Typography variant="h5">{waiting.length}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Chamados
              </Typography>
              <Typography variant="h5">{called.length}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Espera média (min)
              </Typography>
              <Typography variant="h5">{avgWait}</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Filtros enxutos para recepção */}
        <Paper
          variant="outlined"
          component="form"
          action="/fila/recepcao"
          method="get"
          sx={{ p: 2, mb: 3, borderRadius: 3 }}
        >
          <Toolbar disableGutters sx={{ gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              name="q"
              label="Pesquisar"
              placeholder="Ticket ou cliente"
              defaultValue={q}
              sx={{ minWidth: 260 }}
            />

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="unitId-label">Unidade</InputLabel>
              <Select name="unitId" labelId="unitId-label" label="Unidade" defaultValue={unitId}>
                <MenuItem value="">
                  <em>Todas</em>
                </MenuItem>
                {units.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel id="status-label">Status</InputLabel>
              <Select name="status" labelId="status-label" label="Status" defaultValue={status}>
                <MenuItem value="waiting">Aguardando</MenuItem>
                <MenuItem value="called">Chamado</MenuItem>
                <MenuItem value="in_service">Em atendimento</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel id="sortBy-label">Ordenar</InputLabel>
              <Select name="sortBy" labelId="sortBy-label" label="Ordenar" defaultValue={sortBy}>
                <MenuItem value="priority">Prioridade</MenuItem>
                <MenuItem value="arrival">Chegada</MenuItem>
                <MenuItem value="ticket">Ticket</MenuItem>
              </Select>
            </FormControl>

            <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
              <Button type="submit" variant="contained">
                Aplicar
              </Button>
              <Button component={Link} href="/fila/recepcao" variant="text" color="inherit">
                Limpar
              </Button>
              {/* <form action={queueCallNext}><Button type="submit" variant="outlined">Chamar próximo</Button></form> */}
              <Button
                component={Link}
                href={`/fila/recepcao?unitId=${unitId}&call=next`}
                variant="outlined"
              >
                Chamar próximo
              </Button>
            </Stack>
          </Toolbar>
        </Paper>

        {/* Tabela prioritária (sem muito ruído visual) */}
        <Paper variant="outlined" sx={{ borderRadius: 3 }}>
          <ReceptionTable
            items={queue.items}
            professionals={professionals}
            sortBy={sortBy}
            sortDir={sortDir as 'asc' | 'desc'}
            currentParams={searchParams}
          />
        </Paper>

        <Alert severity="info" sx={{ mt: 2 }}>
          Dica: use <b>Priorizar</b> para atender clientes sensíveis ao tempo e <b>Atribuir</b> para
          direcionar ao profissional correto. O botão <b>Chamar</b> anunciará o ticket no painel
          público (se configurado).
        </Alert>
      </Box>
    </Container>
  );
}

function ReceptionTable({
  items,
  professionals,
  sortBy,
  sortDir,
  currentParams,
}: {
  items: QueueItem[];
  professionals: Professional[];
  sortBy: string;
  sortDir: 'asc' | 'desc';
  currentParams: { [k: string]: string | string[] | undefined };
}) {
  const params = new URLSearchParams();
  Object.entries(currentParams).forEach(([k, v]) => {
    if (Array.isArray(v)) params.set(k, v[0] as string);
    else if (typeof v === 'string') params.set(k, v);
  });
  function buildQuery(patch: Record<string, string | undefined>) {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === undefined || v === '') next.delete(k);
      else next.set(k, v);
    });
    const qs = next.toString();
    return qs ? `?${qs}` : '';
  }
  const handleSort = (column: string) => {
    const isAsc = sortBy === column && sortDir === 'asc';
    return buildQuery({ sortBy: column, sortDir: isAsc ? 'desc' : 'asc' });
  };

  const now = nowISO();

  return (
    <Table size="small" aria-label="Fila da recepção">
      <TableHead>
        <TableRow>
          <TableCell sortDirection={sortBy === 'priority' ? sortDir : false} sx={{ width: 100 }}>
            <Link href={handleSort('priority')}>
              <TableSortLabel
                active={sortBy === 'priority'}
                direction={sortBy === 'priority' ? sortDir : 'asc'}
              >
                Prio
              </TableSortLabel>
            </Link>
          </TableCell>
          <TableCell sx={{ width: 120 }}>Ticket</TableCell>
          <TableCell>Cliente</TableCell>
          <TableCell>Serviço</TableCell>
          <TableCell>Profissional</TableCell>
          <TableCell sortDirection={sortBy === 'arrival' ? sortDir : false}>
            <Link href={handleSort('arrival')}>
              <TableSortLabel
                active={sortBy === 'arrival'}
                direction={sortBy === 'arrival' ? sortDir : 'asc'}
              >
                Chegada
              </TableSortLabel>
            </Link>
          </TableCell>
          <TableCell align="right" sx={{ width: 120 }}>
            Espera
          </TableCell>
          <TableCell align="right" sx={{ width: 360 }}>
            Ações
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {items.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8}>
              <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                Nenhum cliente na fila para exibir.
              </Box>
            </TableCell>
          </TableRow>
        ) : (
          items.map((i) => {
            const waitMin = minutesBetween(i.arrival_time, now);
            const arrivalTime = new Date(i.arrival_time).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            });
            return (
              <TableRow key={i.id} hover>
                <TableCell>
                  <Chip size="small" label={i.priority ?? '—'} />
                </TableCell>
                <TableCell>
                  <Typography variant="body1" fontWeight={600}>
                    {i.ticket}
                  </Typography>
                </TableCell>
                <TableCell>{i.customer_name || '—'}</TableCell>
                <TableCell>{i.service_name || '—'}</TableCell>
                <TableCell>{i.professional_name || <em>—</em>}</TableCell>
                <TableCell>{arrivalTime}</TableCell>
                <TableCell align="right">{waitMin} min</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                    {/* Placeholders; troque por <form action=...> quando tiver Server Actions */}
                    <Button
                      component={Link}
                      href={`/fila/recepcao?prio=${i.id}`}
                      size="small"
                      variant="outlined"
                    >
                      Priorizar
                    </Button>
                    <AssignMenu professionals={professionals} id={i.id} />
                    <Button
                      component={Link}
                      href={`/fila/recepcao?call=${i.id}`}
                      size="small"
                      variant="contained"
                    >
                      Chamar
                    </Button>
                    <Button
                      component={Link}
                      href={`/fila/recepcao?skip=${i.id}`}
                      size="small"
                      variant="text"
                    >
                      Pular
                    </Button>
                    <Button
                      component={Link}
                      href={`/fila/recepcao?cancel=${i.id}`}
                      size="small"
                      color="warning"
                      variant="text"
                    >
                      Cancelar
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}

function AssignMenu({ professionals, id }: { professionals: Professional[]; id: string }) {
  // Simples: um select inline que navega com querystring (até ligar Server Actions)
  return (
    <FormControl size="small" sx={{ minWidth: 180 }}>
      <InputLabel id={`assign-${id}`}>Atribuir</InputLabel>
      <Select
        labelId={`assign-${id}`}
        label="Atribuir"
        defaultValue=""
        onChange={(e) => {
          const val = (e.target as HTMLSelectElement).value;
          if (!val) return;
          window.location.href = `/fila/recepcao?assign=${id}&professionalId=${val}`;
        }}
      >
        <MenuItem value="">
          <em>Selecionar</em>
        </MenuItem>
        {professionals.map((p) => (
          <MenuItem key={p.id} value={p.id}>
            {p.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
