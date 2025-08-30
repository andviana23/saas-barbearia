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
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableSortLabel,
  Divider,
  Grid,
} from '@mui/material';
import Link from 'next/link';
import { unstable_noStore as noStore } from 'next/cache';
import CaixaHarness from './page.harness';

// 🔌 Server Actions (commented out - using mock data for now)
// import { listCashMovements } from '@/actions/cash'

/** Tipos **/
export type CashMovement = {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  professional_name?: string | null;
  payment_method: string;
  date: string;
  created_at?: string | null;
};

export type CashResponse = {
  items: CashMovement[];
  total: number;
  summary: {
    total_income: number;
    total_expense: number;
    balance: number;
  };
};

/** Utils **/
function coerceString(x: unknown): string | undefined {
  if (Array.isArray(x)) return x[0];
  if (typeof x === 'string') return x;
  return undefined;
}
function coerceNumber(x: unknown): number | undefined {
  const s = coerceString(x);
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}
function buildQuery(params: URLSearchParams, patch: Record<string, string | undefined>) {
  const next = new URLSearchParams(params);
  Object.entries(patch).forEach(([k, v]) => {
    if (v === undefined || v === '') next.delete(k);
    else next.set(k, v);
  });
  const qs = next.toString();
  return qs ? `?${qs}` : '';
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  if (process.env.E2E_MODE === '1') {
    return <CaixaHarness />;
  }
  noStore();

  // 🔎 Filtros
  const q = coerceString(searchParams.q) ?? '';
  const type = coerceString(searchParams.type) || '';
  const category = coerceString(searchParams.category) || '';
  // const professional = coerceString(searchParams.professional) || ''
  const paymentMethod = coerceString(searchParams.paymentMethod) || '';
  const period = coerceString(searchParams.period) || '30d';
  const sortBy = coerceString(searchParams.sortBy) || 'date';
  const sortDir = coerceString(searchParams.sortDir) === 'desc' ? 'desc' : 'asc';
  const page = Math.max(0, coerceNumber(searchParams.page) ?? 0);
  const pageSize = Math.min(100, Math.max(5, coerceNumber(searchParams.pageSize) ?? 20));

  // 📥 Dados (mock para agora, integrar com backend depois)
  const cashData = {
    items: [
      {
        id: '1',
        description: 'Corte de cabelo',
        amount: 50,
        type: 'income' as const,
        category: 'Serviços',
        professional_name: 'João Silva',
        payment_method: 'Cartão',
        date: '2025-01-21',
        created_at: '2025-01-21T10:30:00Z',
      },
      {
        id: '2',
        description: 'Compra de produtos',
        amount: -30,
        type: 'expense' as const,
        category: 'Produtos',
        professional_name: null,
        payment_method: 'Dinheiro',
        date: '2025-01-21',
        created_at: '2025-01-21T14:15:00Z',
      },
    ],
    total: 2,
    summary: {
      total_income: 5000,
      total_expense: 1500,
      balance: 3500,
    },
  } as CashResponse;

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
            Caixa
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button component={Link} href="/caixa/fechamento" variant="outlined">
              Fechamento
            </Button>
            <Button component={Link} href="/caixa/historico" variant="outlined">
              Histórico
            </Button>
            <Button variant="contained">Novo Lançamento</Button>
          </Stack>
        </Stack>

        {/* Resumo financeiro */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Entradas
              </Typography>
              <Typography variant="h4" color="success.main">
                {formatCurrency(cashData.summary.total_income)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Saídas
              </Typography>
              <Typography variant="h4" color="error.main">
                {formatCurrency(cashData.summary.total_expense)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Saldo
              </Typography>
              <Typography variant="h4" color="primary.main">
                {formatCurrency(cashData.summary.balance)}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Filtros */}
        <Paper
          variant="outlined"
          component="form"
          action="/caixa"
          method="get"
          sx={{ p: 2, mb: 3, borderRadius: 3 }}
        >
          <Toolbar disableGutters sx={{ gap: 2, flexWrap: 'wrap' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ flex: 1 }}>
              <TextField
                name="q"
                label="Pesquisar"
                placeholder="Descrição, categoria..."
                defaultValue={q}
                fullWidth
              />

              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel id="period-label">Período</InputLabel>
                <Select labelId="period-label" name="period" label="Período" defaultValue={period}>
                  <MenuItem value="7d">Últimos 7 dias</MenuItem>
                  <MenuItem value="30d">Últimos 30 dias</MenuItem>
                  <MenuItem value="90d">Últimos 3 meses</MenuItem>
                  <MenuItem value="custom">Personalizado</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel id="type-label">Tipo</InputLabel>
                <Select labelId="type-label" name="type" label="Tipo" defaultValue={type}>
                  <MenuItem value="">
                    <em>Todos</em>
                  </MenuItem>
                  <MenuItem value="income">Entrada</MenuItem>
                  <MenuItem value="expense">Saída</MenuItem>
                </Select>
              </FormControl>

              <TextField
                name="category"
                label="Categoria"
                placeholder="Ex: Serviços"
                defaultValue={category}
                sx={{ minWidth: 150 }}
              />

              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel id="payment-label">Pagamento</InputLabel>
                <Select
                  labelId="payment-label"
                  name="paymentMethod"
                  label="Pagamento"
                  defaultValue={paymentMethod}
                >
                  <MenuItem value="">
                    <em>Todos</em>
                  </MenuItem>
                  <MenuItem value="cash">Dinheiro</MenuItem>
                  <MenuItem value="card">Cartão</MenuItem>
                  <MenuItem value="pix">PIX</MenuItem>
                  <MenuItem value="transfer">Transferência</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <Stack direction="row" spacing={1}>
              <Button type="submit" variant="contained">
                Aplicar
              </Button>
              <Button component={Link} href="/caixa" variant="text" color="inherit">
                Limpar
              </Button>
            </Stack>
          </Toolbar>
        </Paper>

        {/* Lista */}
        <Paper variant="outlined" sx={{ borderRadius: 3 }}>
          <CashTable
            data={cashData.items}
            total={cashData.total}
            page={page}
            pageSize={pageSize}
            sortBy={sortBy}
            sortDir={sortDir as 'asc' | 'desc'}
            currentParams={searchParams}
          />
        </Paper>
      </Box>
    </Container>
  );
}

function CashTable({
  data,
  total,
  page,
  pageSize,
  sortBy,
  sortDir,
  currentParams,
}: {
  data: CashMovement[];
  total: number;
  page: number;
  pageSize: number;
  sortBy: string;
  sortDir: 'asc' | 'desc';
  currentParams: { [key: string]: string | string[] | undefined };
}) {
  const params = new URLSearchParams();
  Object.entries(currentParams).forEach(([k, v]) => {
    if (Array.isArray(v)) params.set(k, v[0] as string);
    else if (typeof v === 'string') params.set(k, v);
  });

  const handleSortQuery = (column: string) => {
    const isAsc = sortBy === column && sortDir === 'asc';
    return buildQuery(params, {
      sortBy: column,
      sortDir: isAsc ? 'desc' : 'asc',
      page: '0',
    });
  };

  const handlePageLink = (nextPage: number) => buildQuery(params, { page: String(nextPage) });

  return (
    <>
      <Table size="small" aria-label="Tabela de movimentações">
        <TableHead>
          <TableRow>
            <TableCell sortDirection={sortBy === 'date' ? sortDir : false}>
              <Link href={handleSortQuery('date')}>
                <TableSortLabel
                  active={sortBy === 'date'}
                  direction={sortBy === 'date' ? sortDir : 'asc'}
                >
                  Data
                </TableSortLabel>
              </Link>
            </TableCell>
            <TableCell sortDirection={sortBy === 'description' ? sortDir : false}>
              <Link href={handleSortQuery('description')}>
                <TableSortLabel
                  active={sortBy === 'description'}
                  direction={sortBy === 'description' ? sortDir : 'asc'}
                >
                  Descrição
                </TableSortLabel>
              </Link>
            </TableCell>
            <TableCell>Categoria</TableCell>
            <TableCell>Profissional</TableCell>
            <TableCell>Pagamento</TableCell>
            <TableCell align="center">Tipo</TableCell>
            <TableCell align="right" sortDirection={sortBy === 'amount' ? sortDir : false}>
              <Link href={handleSortQuery('amount')}>
                <TableSortLabel
                  active={sortBy === 'amount'}
                  direction={sortBy === 'amount' ? sortDir : 'asc'}
                >
                  Valor
                </TableSortLabel>
              </Link>
            </TableCell>
            <TableCell align="right" sx={{ width: 120 }}>
              Ações
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8}>
                <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                  Nenhuma movimentação encontrada com os filtros atuais.
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            data.map((movement) => (
              <TableRow key={movement.id} hover>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(movement.date).toLocaleDateString('pt-BR')}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body1" fontWeight={600}>
                    {movement.description}
                  </Typography>
                </TableCell>
                <TableCell>{movement.category}</TableCell>
                <TableCell>{movement.professional_name || '—'}</TableCell>
                <TableCell>{movement.payment_method}</TableCell>
                <TableCell align="center">
                  {movement.type === 'income' ? (
                    <Chip label="Entrada" color="success" size="small" />
                  ) : (
                    <Chip label="Saída" color="error" size="small" />
                  )}
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body1"
                    fontWeight={600}
                    color={movement.type === 'income' ? 'success.main' : 'error.main'}
                  >
                    {formatCurrency(Math.abs(movement.amount))}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      component={Link}
                      href={`/caixa/${movement.id}`}
                      size="small"
                      variant="text"
                    >
                      Editar
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Divider />

      {/* Paginação */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
        }}
      >
        <Button component={Link} href={handlePageLink(Math.max(0, page - 1))} disabled={page === 0}>
          Anterior
        </Button>
        <Typography variant="body2" color="text.secondary">
          Página {page + 1} • Itens por página: {pageSize} • Total: {total}
        </Typography>
        <Button
          component={Link}
          href={handlePageLink(page + 1)}
          disabled={(page + 1) * pageSize >= total}
        >
          Próxima
        </Button>
      </Box>
    </>
  );
}

export const metadata = {
  title: 'Caixa | Trato',
  description: 'Movimentações financeiras',
};
