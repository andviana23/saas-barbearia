import {
  Container,
  Box,
  Typography,
  Stack,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Button,
  Chip,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableSortLabel,
  TablePagination,
  Toolbar,
  IconButton,
  Tooltip,
  Paper,
} from '@mui/material'
import Link from 'next/link'
import { Suspense } from 'react'
import { unstable_noStore as noStore } from 'next/cache'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'

// 🔌 Server Actions (BACKEND FIRST): assumimos que já existem.
// Ajuste os caminhos conforme seu projeto.
import { listServices, listServiceCategories } from '@/actions/services'

/**
 * Tipos do catálogo de serviços (alinhar com o backend EP6)
 */
type ServiceCategory = {
  id: string
  name: string
}

type ServiceItem = {
  id: string
  name: string
  category_id: string | null
  category_name?: string | null
  duration_minutes: number // duração em minutos
  price_cents: number // valor em centavos
  is_active: boolean
}

type ServicesResponse = {
  items: ServiceItem[]
  total: number
}

export const metadata: Metadata = {
  title: 'Serviços | Trato',
  description: 'Lista de serviços com filtros e paginação',
}

/**
 * Utilitários
 */
function moneyBRL(cents: number) {
  return (cents ?? 0) / 100
}

function formatCurrencyBRL(cents: number) {
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(moneyBRL(cents))
  } catch {
    return `R$ ${moneyBRL(cents).toFixed(2)}`
  }
}

function coerceString(x: unknown): string | undefined {
  if (Array.isArray(x)) return x[0]
  if (typeof x === 'string') return x
  return undefined
}

function coerceNumber(x: unknown): number | undefined {
  const s = coerceString(x)
  if (!s) return undefined
  const n = Number(s)
  return Number.isFinite(n) ? n : undefined
}

function buildQuery(
  params: URLSearchParams,
  patch: Record<string, string | undefined>
) {
  const next = new URLSearchParams(params)
  Object.entries(patch).forEach(([k, v]) => {
    if (v === undefined || v === '') next.delete(k)
    else next.set(k, v)
  })
  return `?${next.toString()}`
}

/**
 * Page (Server Component) — sem hooks de cliente.
 * Filtros via querystring, SSR + Server Actions (React Server Components).
 */
export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  noStore()

  // 🔎 Leitura dos filtros da URL
  const q = coerceString(searchParams.q) ?? ''
  const categoryId = coerceString(searchParams.categoryId) || ''
  const status = coerceString(searchParams.status) || '' // "active", "inactive" ou ""
  const minPrice = coerceNumber(searchParams.minPrice)
  const maxPrice = coerceNumber(searchParams.maxPrice)
  const minDuration = coerceNumber(searchParams.minDuration)
  const maxDuration = coerceNumber(searchParams.maxDuration)
  const sortBy = coerceString(searchParams.sortBy) || 'name' // name|price|duration|category|status
  const sortDir = coerceString(searchParams.sortDir) === 'desc' ? 'desc' : 'asc' // asc|desc
  const page = Math.max(0, coerceNumber(searchParams.page) ?? 0)
  const pageSize = Math.min(
    100,
    Math.max(5, coerceNumber(searchParams.pageSize) ?? 10)
  )

  // 📥 Busca de dados via Server Actions
  const [categories, servicesRaw] = await Promise.all([
    listServiceCategories() as Promise<ServiceCategory[]>,
    listServices() as Promise<unknown>,
  ])

  // Normalizar resposta de serviços: alguns backends retornam array simples
  const services: ServicesResponse = Array.isArray(servicesRaw)
    ? {
        items: servicesRaw as ServiceItem[],
        total: (servicesRaw as ServiceItem[]).length,
      }
    : (servicesRaw as ServicesResponse)

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom>
          Serviços
        </Typography>

        <Paper
          variant="outlined"
          sx={{ p: 2, mb: 3, borderRadius: 3 }}
          component="form"
          action="/servicos"
          method="get"
        >
          <Toolbar
            disableGutters
            sx={{ justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}
          >
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              sx={{ flex: 1 }}
            >
              <TextField
                name="q"
                label="Pesquisar"
                placeholder="Nome do serviço"
                defaultValue={q}
                fullWidth
              />

              <FormControl sx={{ minWidth: 220 }}>
                <InputLabel id="categoryId-label">Categoria</InputLabel>
                <Select
                  labelId="categoryId-label"
                  name="categoryId"
                  label="Categoria"
                  defaultValue={categoryId}
                >
                  <MenuItem value="">
                    <em>Todas</em>
                  </MenuItem>
                  {categories.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  name="status"
                  label="Status"
                  defaultValue={status}
                >
                  <MenuItem value="">
                    <em>Todos</em>
                  </MenuItem>
                  <MenuItem value="active">Ativo</MenuItem>
                  <MenuItem value="inactive">Inativo</MenuItem>
                </Select>
              </FormControl>

              <TextField
                type="number"
                name="minPrice"
                label="Preço mín (R$)"
                inputProps={{ step: '0.01', min: 0 }}
                defaultValue={minPrice ?? ''}
                sx={{ width: 170 }}
              />
              <TextField
                type="number"
                name="maxPrice"
                label="Preço máx (R$)"
                inputProps={{ step: '0.01', min: 0 }}
                defaultValue={maxPrice ?? ''}
                sx={{ width: 170 }}
              />

              <TextField
                type="number"
                name="minDuration"
                label="Duração mín (min)"
                inputProps={{ step: 5, min: 0 }}
                defaultValue={minDuration ?? ''}
                sx={{ width: 170 }}
              />
              <TextField
                type="number"
                name="maxDuration"
                label="Duração máx (min)"
                inputProps={{ step: 5, min: 0 }}
                defaultValue={maxDuration ?? ''}
                sx={{ width: 180 }}
              />
            </Stack>

            <Stack direction={{ xs: 'row' }} spacing={1}>
              <Button type="submit" variant="contained">
                Aplicar
              </Button>
              <Button
                type="button"
                variant="text"
                color="inherit"
                onClick={() => redirect('/servicos')}
              >
                Limpar
              </Button>
            </Stack>
          </Toolbar>
        </Paper>

        <Paper variant="outlined" sx={{ borderRadius: 3 }}>
          <ServicesTable
            data={services.items}
            total={services.total}
            page={page}
            pageSize={pageSize}
            sortBy={sortBy}
            sortDir={sortDir}
            currentParams={searchParams}
          />
        </Paper>
      </Box>
    </Container>
  )
}

/**
 * Tabela de resultados (server component)
 */
function ServicesTable({
  data,
  total,
  page,
  pageSize,
  sortBy,
  sortDir,
  currentParams,
}: {
  data: ServiceItem[]
  total: number
  page: number
  pageSize: number
  sortBy: string
  sortDir: 'asc' | 'desc'
  currentParams: { [key: string]: string | string[] | undefined }
}) {
  const params = new URLSearchParams()
  Object.entries(currentParams).forEach(([k, v]) => {
    if (Array.isArray(v)) params.set(k, v[0] as string)
    else if (typeof v === 'string') params.set(k, v)
  })

  const handleSortQuery = (column: string) => {
    const isAsc = sortBy === column && sortDir === 'asc'
    return buildQuery(params, {
      sortBy: column,
      sortDir: isAsc ? 'desc' : 'asc',
      page: '0',
    })
  }

  const handlePageChangeQuery = (nextPage: number) =>
    buildQuery(params, { page: String(nextPage) })
  const handlePageSizeChangeQuery = (nextSize: number) =>
    buildQuery(params, { pageSize: String(nextSize), page: '0' })

  return (
    <>
      <Table size="small" aria-label="Tabela de serviços">
        <TableHead>
          <TableRow>
            <TableCell sortDirection={sortBy === 'name' ? sortDir : false}>
              <Link href={handleSortQuery('name')}>
                <TableSortLabel
                  active={sortBy === 'name'}
                  direction={sortBy === 'name' ? sortDir : 'asc'}
                >
                  Serviço
                </TableSortLabel>
              </Link>
            </TableCell>
            <TableCell
              sortDirection={sortBy === 'category' ? sortDir : false}
              sx={{ width: 260 }}
            >
              <Link href={handleSortQuery('category')}>
                <TableSortLabel
                  active={sortBy === 'category'}
                  direction={sortBy === 'category' ? sortDir : 'asc'}
                >
                  Categoria
                </TableSortLabel>
              </Link>
            </TableCell>
            <TableCell
              align="right"
              sortDirection={sortBy === 'duration' ? sortDir : false}
              sx={{ width: 140 }}
            >
              <Link href={handleSortQuery('duration')}>
                <TableSortLabel
                  active={sortBy === 'duration'}
                  direction={sortBy === 'duration' ? sortDir : 'asc'}
                >
                  Duração
                </TableSortLabel>
              </Link>
            </TableCell>
            <TableCell
              align="right"
              sortDirection={sortBy === 'price' ? sortDir : false}
              sx={{ width: 160 }}
            >
              <Link href={handleSortQuery('price')}>
                <TableSortLabel
                  active={sortBy === 'price'}
                  direction={sortBy === 'price' ? sortDir : 'asc'}
                >
                  Preço
                </TableSortLabel>
              </Link>
            </TableCell>
            <TableCell
              align="center"
              sortDirection={sortBy === 'status' ? sortDir : false}
              sx={{ width: 140 }}
            >
              <Link href={handleSortQuery('status')}>
                <TableSortLabel
                  active={sortBy === 'status'}
                  direction={sortBy === 'status' ? sortDir : 'asc'}
                >
                  Status
                </TableSortLabel>
              </Link>
            </TableCell>
            <TableCell align="right" sx={{ width: 120 }}>
              Ações
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={6}>
                <Box
                  sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}
                >
                  Nenhum serviço encontrado com os filtros atuais.
                </Box>
              </TableCell>
            </TableRow>
          )}
          {data.map((s) => (
            <TableRow key={s.id} hover>
              <TableCell>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body1" fontWeight={600}>
                    {s.name}
                  </Typography>
                </Stack>
              </TableCell>
              <TableCell>
                {s.category_name ? (
                  <Chip label={s.category_name} size="small" />
                ) : (
                  <Chip label="Sem categoria" size="small" variant="outlined" />
                )}
              </TableCell>
              <TableCell align="right">{s.duration_minutes} min</TableCell>
              <TableCell align="right">
                {formatCurrencyBRL(s.price_cents)}
              </TableCell>
              <TableCell align="center">
                {s.is_active ? (
                  <Chip label="Ativo" color="success" size="small" />
                ) : (
                  <Chip label="Inativo" color="default" size="small" />
                )}
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Tooltip title="Editar">
                    <IconButton component={Link} href={`/servicos/${s.id}`}>
                      ✏️
                    </IconButton>
                  </Tooltip>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Divider />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        {/* A paginação aqui é 100% via querystring para continuar SSR. */}
        <TablePagination
          component="div"
          count={total}
          page={page}
          rowsPerPage={pageSize}
          onPageChange={(_, newPage) => {
            // Como estamos em Server Components, usamos <Link> para navegar.
            const href = handlePageChangeQuery(newPage)
            // fallback para ambientes sem client nav
            window.location.href = href
          }}
          onRowsPerPageChange={(e) => {
            const newSize = Number(e.target.value)
            const href = handlePageSizeChangeQuery(newSize)
            window.location.href = href
          }}
          rowsPerPageOptions={[5, 10, 20, 50]}
          labelRowsPerPage="Por página"
        />
      </Box>
    </>
  )
}
