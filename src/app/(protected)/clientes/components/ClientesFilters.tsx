'use client';

import React, { useState, useEffect } from 'react';
import {
  Stack,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  Box,
} from '@mui/material';
import { Search as SearchIcon, FilterList as FilterIcon } from '@mui/icons-material';
import { DSSelect } from '@/components/ui';
import { ClienteFilters } from '@/types/api';

interface ClientesFiltersProps {
  filters: ClienteFilters;
  onChange: (filters: Partial<ClienteFilters>) => void;
}

export default function ClientesFilters({ filters, onChange }: ClientesFiltersProps) {
  const [localSearch, setLocalSearch] = useState(filters.q ?? '');

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.q) {
        onChange({ q: localSearch });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, filters.q, onChange]);

  const handleStatusChange = (
    _event: React.MouseEvent<HTMLElement>,
    newStatus: 'todos' | 'ativo' | 'arquivado',
  ) => {
    if (newStatus === null) return;

    const statusMap = {
      todos: undefined,
      ativo: true,
      arquivado: false,
    };

    onChange({ ativo: statusMap[newStatus] });
  };

  const handleLimitChange = (limit: string) => {
    onChange({ limit: parseInt(limit) });
  };

  const getCurrentStatus = () => {
    if (filters.ativo === undefined) return 'todos';
    return filters.ativo ? 'ativo' : 'arquivado';
  };

  const getResultsText = () => {
    const hasFilters = filters.q || filters.ativo !== undefined;
    if (!hasFilters) return '';

    const parts = [];

    if (filters.q) {
      parts.push(`"${filters.q}"`);
    }

    if (filters.ativo === true) {
      parts.push('ativos');
    } else if (filters.ativo === false) {
      parts.push('arquivados');
    }

    return parts.length > 0 ? `Filtros: ${parts.join(', ')}` : '';
  };

  const clearFilters = () => {
    setLocalSearch('');
    onChange({
      q: '',
      ativo: undefined,
    });
  };

  const hasActiveFilters = filters.q || filters.ativo !== undefined;

  return (
    <Stack spacing={2} sx={{ flex: 1, maxWidth: 600 }}>
      {/* Linha principal de filtros */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
        {/* Busca */}
        <TextField
          placeholder="Buscar por nome, email ou telefone..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          size="small"
          sx={{ flex: 1, minWidth: 250 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        {/* Filtro de status */}
        <ToggleButtonGroup
          value={getCurrentStatus()}
          exclusive
          onChange={handleStatusChange}
          size="small"
          color="primary"
        >
          <ToggleButton value="todos">Todos</ToggleButton>
          <ToggleButton value="ativo">Ativos</ToggleButton>
          <ToggleButton value="arquivado">Arquivados</ToggleButton>
        </ToggleButtonGroup>

        {/* Itens por página */}
        <DSSelect
          id="items-per-page"
          label="Por página"
          value={filters.limit.toString()}
          onChange={(e) => handleLimitChange(e.target.value.toString())}
          options={[
            { value: '5', label: '5' },
            { value: '10', label: '10' },
            { value: '25', label: '25' },
            { value: '50', label: '50' },
          ]}
        />
      </Stack>

      {/* Filtros ativos */}
      {hasActiveFilters && (
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <FilterIcon color="action" fontSize="small" />

            {filters.q && (
              <Chip
                label={`Busca: "${filters.q}"`}
                size="small"
                onDelete={() => {
                  setLocalSearch('');
                  onChange({ q: '' });
                }}
                color="primary"
                variant="outlined"
              />
            )}

            {filters.ativo !== undefined && (
              <Chip
                label={filters.ativo ? 'Apenas ativos' : 'Apenas arquivados'}
                size="small"
                onDelete={() => onChange({ ativo: undefined })}
                color="primary"
                variant="outlined"
              />
            )}

            {hasActiveFilters && (
              <Chip
                label="Limpar filtros"
                size="small"
                onClick={clearFilters}
                color="default"
                variant="outlined"
                sx={{ cursor: 'pointer' }}
              />
            )}
          </Stack>
        </Box>
      )}
    </Stack>
  );
}
