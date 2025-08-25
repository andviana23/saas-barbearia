import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Box,
  Typography,
  Skeleton,
} from '@mui/material'
import { ReactNode } from 'react'

export interface Column<T = Record<string, unknown>> {
  id: keyof T
  label: string
  minWidth?: number
  align?: 'left' | 'center' | 'right'
  format?: (value: unknown) => ReactNode
}

export interface TableProps<T = Record<string, unknown>> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  page?: number
  rowsPerPage?: number
  totalCount?: number
  onPageChange?: (page: number) => void
  onRowsPerPageChange?: (rowsPerPage: number) => void
  emptyMessage?: string
  onRowClick?: (row: T) => void
}

export default function Table<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  page = 0,
  rowsPerPage = 10,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  emptyMessage = 'Nenhum registro encontrado',
  onRowClick,
}: TableProps<T>) {
  const handleChangePage = (_: unknown, newPage: number) => {
    onPageChange?.(newPage)
  }

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newRowsPerPage = parseInt(event.target.value, 10)
    onRowsPerPageChange?.(newRowsPerPage)
  }

  if (loading) {
    return (
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <MuiTable>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={String(column.id)}>
                  <Skeleton variant="text" />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell key={String(column.id)}>
                    <Skeleton variant="text" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </MuiTable>
      </TableContainer>
    )
  }

  return (
    <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <TableContainer>
        <MuiTable>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'grey.50' }}>
              {columns.map((column) => (
                <TableCell
                  key={String(column.id)}
                  align={column.align}
                  sx={{
                    minWidth: column.minWidth,
                    fontWeight: 600,
                    color: 'text.primary',
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <Box sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      {emptyMessage}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow
                  key={index}
                  hover
                  onClick={() => onRowClick?.(row)}
                  sx={{
                    cursor: onRowClick ? 'pointer' : 'default',
                    '&:hover': {
                      backgroundColor: onRowClick
                        ? 'action.hover'
                        : 'transparent',
                    },
                  }}
                >
                  {columns.map((column) => {
                    const value = row[column.id]
                    return (
                      <TableCell key={String(column.id)} align={column.align}>
                        {column.format ? column.format(value) : String(value)}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </MuiTable>
      </TableContainer>

      {(onPageChange || onRowsPerPageChange) && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount ?? data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Linhas por página"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
          }
        />
      )}
    </Paper>
  )
}
