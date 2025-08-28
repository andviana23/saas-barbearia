'use client';

import * as React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid2 as Grid,
  Stack,
  TextField,
  MenuItem,
  Button,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  TablePagination,
  IconButton,
  Tooltip,
  Divider,
  Paper,
  CircularProgress,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import SortIcon from '@mui/icons-material/Sort';
import SearchIcon from '@mui/icons-material/Search';

// ==============================
// Configurações & Tipos
// ==============================
type MovimentoTipo = 'entrada' | 'saida';
type MetodoPagamento = 'dinheiro' | 'cartao' | 'pix' | 'transferencia' | 'outro';
type StatusMov = 'confirmado' | 'pendente' | 'estornado';

type Movimento = {
  id: string;
  data: string; // ISO yyyy-mm-dd
  hora?: string; // HH:mm (opcional)
  descricao: string;
  tipo: MovimentoTipo;
  metodo: MetodoPagamento;
  valor: number; // positivo
  operador: string;
  status: StatusMov;
  referencia?: string; // ex: #PED-123, ou null
};

type Ordem = 'asc' | 'desc';

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});
const DATE_BR = (iso: string) => {
  try {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, (m ?? 1) - 1, d ?? 1).toLocaleDateString('pt-BR');
  } catch {
    return iso;
  }
};

// ==============================
// Mock (funciona out-of-the-box)
// ==============================
const MOCK_DATA: Movimento[] = [
  {
    id: '1',
    data: '2025-08-19',
    hora: '09:10',
    descricao: 'Corte Masculino',
    tipo: 'entrada',
    metodo: 'dinheiro',
    valor: 45,
    operador: 'Lucas',
    status: 'confirmado',
    referencia: '#AG-1001',
  },
  {
    id: '2',
    data: '2025-08-19',
    hora: '09:45',
    descricao: 'Barba',
    tipo: 'entrada',
    metodo: 'pix',
    valor: 35,
    operador: 'Rafa',
    status: 'confirmado',
    referencia: '#AG-1002',
  },
  {
    id: '3',
    data: '2025-08-19',
    hora: '10:05',
    descricao: 'Compra de Pomadas',
    tipo: 'saida',
    metodo: 'cartao',
    valor: 120,
    operador: 'Admin',
    status: 'confirmado',
  },
  {
    id: '4',
    data: '2025-08-20',
    hora: '13:30',
    descricao: 'Corte + Barba',
    tipo: 'entrada',
    metodo: 'cartao',
    valor: 70,
    operador: 'Lucas',
    status: 'pendente',
    referencia: '#AG-1009',
  },
  {
    id: '5',
    data: '2025-08-21',
    hora: '11:00',
    descricao: 'Estorno compra indevida',
    tipo: 'saida',
    metodo: 'outro',
    valor: 35,
    operador: 'Admin',
    status: 'estornado',
  },
];

// Alterar para false quando integrar backend real
const USE_MOCK = true;

// ==============================
// Utilidades
// ==============================
function toCSV(rows: Movimento[]): string {
  const header = [
    'id',
    'data',
    'hora',
    'descricao',
    'tipo',
    'metodo',
    'valor',
    'operador',
    'status',
    'referencia',
  ];
  const escape = (v: unknown) => {
    if (v == null) return '';
    const s = String(v);
    if (s.includes(';') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const lines = [
    header.join(';'),
    ...rows.map((r) =>
      [
        r.id,
        r.data,
        r.hora ?? '',
        r.descricao,
        r.tipo,
        r.metodo,
        r.valor.toFixed(2).replace('.', ','),
        r.operador,
        r.status,
        r.referencia ?? '',
      ]
        .map(escape)
        .join(';'),
    ),
  ];
  return lines.join('\n');
}

function download(filename: string, content: string, mime = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function statusChip(status: StatusMov) {
  const map: Record<
    StatusMov,
    {
      label: string;
      color: 'success' | 'warning' | 'default' | 'error' | 'info';
    }
  > = {
    confirmado: { label: 'Confirmado', color: 'success' },
    pendente: { label: 'Pendente', color: 'warning' },
    estornado: { label: 'Estornado', color: 'default' },
  };
  const cfg = map[status];
  return (
    <Chip
      size="small"
      color={cfg.color}
      label={cfg.label}
      variant={status === 'estornado' ? 'outlined' : 'filled'}
    />
  );
}

function tipoChip(tipo: MovimentoTipo) {
  return (
    <Chip
      size="small"
      label={tipo === 'entrada' ? 'Entrada' : 'Saída'}
      color={tipo === 'entrada' ? 'success' : 'error'}
      variant="outlined"
    />
  );
}

function metodoLabel(m: MetodoPagamento) {
  const map: Record<MetodoPagamento, string> = {
    dinheiro: 'Dinheiro',
    cartao: 'Cartão',
    pix: 'PIX',
    transferencia: 'Transferência',
    outro: 'Outro',
  };
  return map[m];
}

// ==============================
// Fetch (pronto para integrar)
// ==============================
async function fetchMovimentos(): Promise<Movimento[]> {
  if (USE_MOCK) {
    // Simula latência
    await new Promise((r) => setTimeout(r, 300));
    return MOCK_DATA;
  }
  // Exemplo de integração real:
  // const res = await fetch("/api/caixa/movimentacoes", { cache: "no-store" });
  // if (!res.ok) throw new Error("Falha ao carregar movimentos");
  // const data = await res.json();
  // return data as Movimento[];
  return [];
}

// ==============================
// Componentes UI
// ==============================
function SummaryCards({ data }: { data: Movimento[] }) {
  const entradas = data
    .filter((m) => m.tipo === 'entrada' && m.status !== 'estornado')
    .reduce((a, b) => a + b.valor, 0);
  const saidas = data
    .filter((m) => m.tipo === 'saida' && m.status !== 'estornado')
    .reduce((a, b) => a + b.valor, 0);
  const saldo = entradas - saidas;

  const CardStat = ({ title, value }: { title: string; value: string }) => (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h5" sx={{ mt: 0.5 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid size={{ xs: 12, md: 4 }}>
        <CardStat title="Entradas" value={BRL.format(entradas)} />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <CardStat title="Saídas" value={BRL.format(saidas)} />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <CardStat title="Saldo" value={BRL.format(saldo)} />
      </Grid>
    </Grid>
  );
}

type Filtro = {
  de: string;
  ate: string;
  tipo: '' | MovimentoTipo;
  metodo: '' | MetodoPagamento;
  q: string;
};

function FilterBar({
  filtro,
  setFiltro,
  onExport,
  onRefresh,
  disableActions,
}: {
  filtro: Filtro;
  setFiltro: (u: Partial<Filtro>) => void;
  onExport: () => void;
  onRefresh: () => void;
  disableActions?: boolean;
}) {
  const handle = (key: keyof Filtro) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFiltro({ [key]: e.target.value });

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, mb: 2 }}>
      <CardContent>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', md: 'center' }}
        >
          <TextField
            label="De"
            type="date"
            value={filtro.de}
            onChange={handle('de')}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ minWidth: 160 }}
          />
          <TextField
            label="Até"
            type="date"
            value={filtro.ate}
            onChange={handle('ate')}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ minWidth: 160 }}
          />
          <TextField
            label="Tipo"
            select
            value={filtro.tipo}
            onChange={handle('tipo')}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="entrada">Entrada</MenuItem>
            <MenuItem value="saida">Saída</MenuItem>
          </TextField>
          <TextField
            label="Método"
            select
            value={filtro.metodo}
            onChange={handle('metodo')}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="dinheiro">Dinheiro</MenuItem>
            <MenuItem value="cartao">Cartão</MenuItem>
            <MenuItem value="pix">PIX</MenuItem>
            <MenuItem value="transferencia">Transferência</MenuItem>
            <MenuItem value="outro">Outro</MenuItem>
          </TextField>
          <TextField
            label="Buscar"
            placeholder="Descrição, operador, ref..."
            value={filtro.q}
            onChange={handle('q')}
            InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1 }} /> }}
            sx={{ flex: 1, minWidth: 220 }}
          />
          <Stack direction="row" spacing={1}>
            <Tooltip title="Exportar CSV (filtro aplicado)">
              <span>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={onExport}
                  disabled={disableActions}
                >
                  Exportar
                </Button>
              </span>
            </Tooltip>
            <Tooltip title="Recarregar">
              <span>
                <IconButton color="primary" onClick={onRefresh} disabled={disableActions}>
                  <RefreshIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

type ColKey = 'data' | 'descricao' | 'tipo' | 'metodo' | 'valor' | 'operador' | 'status';

function MovimentacoesTable({
  rows,
  onSort,
  orderBy,
  order,
  page,
  rowsPerPage,
  onChangePage,
  onChangeRpp,
}: {
  rows: Movimento[];
  onSort: (key: ColKey) => void;
  orderBy: ColKey;
  order: Ordem;
  page: number;
  rowsPerPage: number;
  onChangePage: (p: number) => void;
  onChangeRpp: (r: number) => void;
}) {
  const start = page * rowsPerPage;
  const paginated = rows.slice(start, start + rowsPerPage);

  const totalRow = React.useMemo(() => {
    const entradas = rows
      .filter((m) => m.tipo === 'entrada' && m.status !== 'estornado')
      .reduce((a, b) => a + b.valor, 0);
    const saidas = rows
      .filter((m) => m.tipo === 'saida' && m.status !== 'estornado')
      .reduce((a, b) => a + b.valor, 0);
    return { entradas, saidas, saldo: entradas - saidas };
  }, [rows]);

  const HeadCell = ({
    id,
    label,
    align,
  }: {
    id: ColKey;
    label: string;
    align?: 'left' | 'right' | 'center' | 'inherit' | 'justify';
  }) => (
    <TableCell align={align}>
      <Stack direction="row" spacing={0.5} alignItems="center">
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
        <IconButton size="small" onClick={() => onSort(id)} aria-label={`ordenar por ${label}`}>
          <SortIcon fontSize="inherit" />
        </IconButton>
      </Stack>
      {orderBy === id && (
        <Typography variant="caption" color="text.secondary">
          {order === 'asc' ? 'asc' : 'desc'}
        </Typography>
      )}
    </TableCell>
  );

  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <HeadCell id="data" label="Data" />
              <HeadCell id="descricao" label="Descrição" />
              <HeadCell id="tipo" label="Tipo" />
              <HeadCell id="metodo" label="Método" />
              <HeadCell id="valor" label="Valor" align="right" />
              <HeadCell id="operador" label="Operador" />
              <HeadCell id="status" label="Status" />
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((m) => (
              <TableRow hover key={m.id}>
                <TableCell>
                  <Stack spacing={0}>
                    <Typography variant="body2">{DATE_BR(m.data)}</Typography>
                    {m.hora && (
                      <Typography variant="caption" color="text.secondary">
                        {m.hora}
                      </Typography>
                    )}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack spacing={0.3}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {m.descricao}
                    </Typography>
                    {m.referencia && (
                      <Typography variant="caption" color="text.secondary">
                        {m.referencia}
                      </Typography>
                    )}
                  </Stack>
                </TableCell>
                <TableCell>{tipoChip(m.tipo)}</TableCell>
                <TableCell>
                  <Chip size="small" variant="outlined" label={metodoLabel(m.metodo)} />
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  {m.tipo === 'saida' ? `- ${BRL.format(m.valor)}` : BRL.format(m.valor)}
                </TableCell>
                <TableCell>{m.operador}</TableCell>
                <TableCell>{statusChip(m.status)}</TableCell>
              </TableRow>
            ))}

            {/* Totalizador */}
            <TableRow>
              <TableCell colSpan={4} />
              <TableCell align="right">
                <Divider sx={{ my: 1 }} />
                <Stack spacing={0.5} alignItems="flex-end">
                  <Typography variant="body2" color="success.main">
                    Entradas: {BRL.format(totalRow.entradas)}
                  </Typography>
                  <Typography variant="body2" color="error.main">
                    Saídas: - {BRL.format(totalRow.saidas)}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Saldo: {BRL.format(totalRow.saldo)}
                  </Typography>
                </Stack>
              </TableCell>
              <TableCell colSpan={2} />
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={rows.length}
        page={page}
        onPageChange={(_e, p) => onChangePage(p)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => onChangeRpp(parseInt(e.target.value, 10))}
        rowsPerPageOptions={[10, 25, 50]}
      />
    </Card>
  );
}

// ==============================
// Componente Principal
// ==============================
export function HistoricoCaixaClient() {
  const [loading, setLoading] = React.useState(true);
  const [raw, setRaw] = React.useState<Movimento[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const todayISO = React.useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  const sevenDaysAgo = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  const [filtro, setFiltroState] = React.useState<Filtro>({
    de: sevenDaysAgo,
    ate: todayISO,
    tipo: '',
    metodo: '',
    q: '',
  });

  const setFiltro = (u: Partial<Filtro>) => setFiltroState((prev) => ({ ...prev, ...u }));

  const [orderBy, setOrderBy] = React.useState<ColKey>('data');
  const [order, setOrder] = React.useState<Ordem>('desc');
  const [page, setPage] = React.useState(0);
  const [rpp, setRpp] = React.useState(10);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMovimentos();
      setRaw(data);
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const filtered = React.useMemo(() => {
    const de = filtro.de ? new Date(filtro.de) : null;
    const ate = filtro.ate ? new Date(filtro.ate) : null;

    return raw
      .filter((m) => {
        const d = new Date(m.data);
        if (de && d < de) return false;
        if (ate && d > ate) return false;
        if (filtro.tipo && m.tipo !== filtro.tipo) return false;
        if (filtro.metodo && m.metodo !== filtro.metodo) return false;
        if (filtro.q) {
          const q = filtro.q.toLowerCase();
          const hay =
            `${m.descricao} ${m.operador} ${m.referencia ?? ''} ${m.status}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const mul = order === 'asc' ? 1 : -1;
        switch (orderBy) {
          case 'data':
            return (
              mul * (a.data.localeCompare(b.data) || (a.hora ?? '').localeCompare(b.hora ?? ''))
            );
          case 'descricao':
            return mul * a.descricao.localeCompare(b.descricao);
          case 'tipo':
            return mul * a.tipo.localeCompare(b.tipo);
          case 'metodo':
            return mul * a.metodo.localeCompare(b.metodo);
          case 'valor':
            return mul * (a.valor - b.valor);
          case 'operador':
            return mul * a.operador.localeCompare(b.operador);
          case 'status':
            return mul * a.status.localeCompare(b.status);
          default:
            return 0;
        }
      });
  }, [raw, filtro, order, orderBy]);

  const handleSort = (key: ColKey) => {
    if (orderBy === key) {
      setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setOrderBy(key);
      setOrder('asc');
    }
    setPage(0);
  };

  const handleExport = () => {
    download(`historico-caixa_${filtro.de}_a_${filtro.ate}.csv`, toCSV(filtered));
  };

  return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Histórico do Caixa
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Histórico de movimentações
        </Typography>
      </Box>

      <SummaryCards data={filtered} />

      <FilterBar
        filtro={filtro}
        setFiltro={setFiltro}
        onExport={handleExport}
        onRefresh={load}
        disableActions={loading}
      />

      {loading ? (
        <Paper variant="outlined" sx={{ p: 6, borderRadius: 3, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Carregando movimentações...
          </Typography>
        </Paper>
      ) : error ? (
        <Paper variant="outlined" sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="subtitle1" color="error" gutterBottom>
            Ocorreu um erro
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {error}
          </Typography>
          <Button startIcon={<RefreshIcon />} variant="outlined" onClick={load}>
            Tentar novamente
          </Button>
        </Paper>
      ) : (
        <MovimentacoesTable
          rows={filtered}
          onSort={handleSort}
          orderBy={orderBy}
          order={order}
          page={page}
          rowsPerPage={rpp}
          onChangePage={setPage}
          onChangeRpp={(n) => {
            setRpp(n);
            setPage(0);
          }}
        />
      )}
    </Box>
  );
}
