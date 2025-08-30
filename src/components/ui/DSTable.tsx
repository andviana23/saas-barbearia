'use client';
import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  TablePagination,
  CircularProgress,
  Typography,
  Stack,
} from '@mui/material';
import { EmptyState } from '@/components/ui';

export interface Column<T = Record<string, unknown>> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
}

interface PaginationOptions {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

interface DSTableProps<T = Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  pagination?: PaginationOptions;
  sortable?: boolean;
  onRowClick?: (item: T) => void;
  getRowKey?: (item: T, index: number) => string;
}

export default function DSTable<T = Record<string, unknown>>({
  columns,
  data,
  loading = false,
  emptyMessage = 'Nenhum item encontrado',
  pagination,
  sortable = false,
  onRowClick,
  getRowKey = (_, index) => index.toString(),
}: DSTableProps<T>) {
  const [orderBy, setOrderBy] = React.useState<string>('');
  const [order, setOrder] = React.useState<'asc' | 'desc'>('asc');

  const handleSort = (columnKey: string) => {
    if (!sortable) return;

    const isAsc = orderBy === columnKey && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(columnKey);
  };

  const sortedData = React.useMemo(() => {
    if (!sortable || !orderBy) return data;

    return [...data].sort((a: T, b: T) => {
      const aVal = (a as Record<string, unknown>)[orderBy];
      const bVal = (b as Record<string, unknown>)[orderBy];

      // Handle type safety for comparison
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        if (aVal < bVal) {
          return order === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return order === 'asc' ? 1 : -1;
        }
        return 0;
      }

      // Fallback for other types
      const aStr = String(aVal);
      const bStr = String(bVal);
      return order === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }, [data, orderBy, order, sortable]);

  const handleChangePage = (_: unknown, newPage: number) => {
    pagination?.onPageChange(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    pagination?.onLimitChange(parseInt(event.target.value, 10));
  };

  const renderCell = (column: Column<T>, item: T) => {
    if (column.render) {
      return column.render(item);
    }
    return ((item as Record<string, unknown>)[column.key] as string) || '-';
  };

  if (loading) {
    return (
      <Paper
        sx={{
          p: 4,
          textAlign: 'center',
          borderRadius: '4px',
          backgroundColor: 'background.paper',
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={40} />
          <Typography variant="body2" color="text.secondary">
            Carregando dados...
          </Typography>
        </Stack>
      </Paper>
    );
  }

  if (!loading && data.length === 0) {
    return (
      <Paper
        sx={{
          p: 4,
          borderRadius: '4px',
          backgroundColor: 'background.paper',
        }}
      >
        <EmptyState
          title={emptyMessage}
          description="Tente ajustar os filtros ou adicione novos itens."
        />
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        borderRadius: '4px',
        backgroundColor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      <TableContainer>
        <Table size="small" aria-label="Tabela de dados">
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: 'action.hover',
                '& .MuiTableCell-head': {
                  fontWeight: 600,
                  color: 'text.primary',
                  borderBottom: '2px solid',
                  borderColor: 'divider',
                },
              }}
            >
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  align={column.align || 'left'}
                  style={{ width: column.width }}
                  sortDirection={orderBy === column.key ? order : false}
                >
                  {sortable && column.sortable !== false ? (
                    <TableSortLabel
                      active={orderBy === column.key}
                      direction={orderBy === column.key ? order : 'asc'}
                      onClick={() => handleSort(column.key)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedData.map((item, index) => (
              <TableRow
                key={getRowKey(item, index)}
                hover={!!onRowClick}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
                sx={{
                  cursor: onRowClick ? 'pointer' : 'default',
                  '&:nth-of-type(odd)': {
                    backgroundColor: 'action.hover',
                  },
                  '&:hover': {
                    backgroundColor: onRowClick ? 'primary.main' : 'action.hover',
                    '&:hover .MuiTableCell-root': {
                      color: onRowClick ? 'primary.contrastText' : 'inherit',
                    },
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                {columns.map((column) => (
                  <TableCell key={column.key} align={column.align || 'left'}>
                    {renderCell(column, item)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={pagination.total}
          rowsPerPage={pagination.limit}
          page={pagination.page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Itens por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
          }
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'action.hover',
          }}
        />
      )}
    </Paper>
  );
}
