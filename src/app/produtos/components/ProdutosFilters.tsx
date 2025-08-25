'use client'

import { Grid, TextField, MenuItem, InputAdornment } from '@mui/material'
import { Search as SearchIcon } from '@mui/icons-material'

interface ProdutosFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusChange: (value: string) => void
  categoriaFilter: string
  onCategoriaChange: (value: string) => void
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos os status' },
  { value: 'active', label: 'Ativos' },
  { value: 'inactive', label: 'Inativos' },
]

const CATEGORIA_OPTIONS = [
  { value: 'all', label: 'Todas as categorias' },
  { value: 'shampoos', label: 'Shampoos' },
  { value: 'condicionadores', label: 'Condicionadores' },
  { value: 'finalizadores', label: 'Finalizadores' },
  { value: 'barba', label: 'Barba' },
  { value: 'hidratantes', label: 'Hidratantes' },
  { value: 'acessorios', label: 'Acessórios' },
]

export default function ProdutosFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  categoriaFilter,
  onCategoriaChange,
}: ProdutosFiltersProps) {
  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          label="Buscar produtos"
          placeholder="Nome, descrição..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          fullWidth
          size="small"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <TextField
          select
          label="Status"
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          fullWidth
          size="small"
        >
          {STATUS_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <TextField
          select
          label="Categoria"
          value={categoriaFilter}
          onChange={(e) => onCategoriaChange(e.target.value)}
          fullWidth
          size="small"
        >
          {CATEGORIA_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
    </Grid>
  )
}
