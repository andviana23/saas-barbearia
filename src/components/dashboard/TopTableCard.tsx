'use client';

import { useMemo, useEffect } from 'react';
import {
  CardContent,
  CardHeader,
  Box,
  Typography,
  Skeleton,
  Chip,
  useTheme,
  Alert,
  AlertTitle,
} from '@mui/material';
import { DataGrid, GridColDef, GridRowsProp, GridRenderCellParams } from '@mui/x-data-grid';
import * as Sentry from '@sentry/nextjs';
import { Card } from '@/components/ui';
import {
  TopTableCardAllProps,
  TopTableCardProps,
  DashboardColumn,
  DashboardRow,
  isLegacyProps,
  convertLegacyProps,
  validateDashboardRow,
  validateDashboardColumn,
  DEFAULT_DASHBOARD_PROPS,
} from '@/types/dashboard';

/**
 * TopTableCard - Robust table component for dashboard metrics
 *
 * Features:
 * - Backward compatibility with legacy props
 * - Safe defaults and validation
 * - Loading and error states
 * - Sentry breadcrumbs for observability
 * - MUI DataGrid integration
 */
export default function TopTableCard(inputProps: TopTableCardAllProps) {
  const theme = useTheme();

  // Convert legacy props if needed and apply safe defaults
  const props: TopTableCardProps = useMemo(() => {
    try {
      const convertedProps = isLegacyProps(inputProps)
        ? convertLegacyProps(inputProps)
        : inputProps;

      // Apply safe defaults to prevent undefined access
      return {
        title: convertedProps.title || 'Tabela',
        subtitle: convertedProps.subtitle,
        data: Array.isArray(convertedProps.data)
          ? convertedProps.data
          : DEFAULT_DASHBOARD_PROPS.data,
        columns: Array.isArray(convertedProps.columns)
          ? convertedProps.columns
          : DEFAULT_DASHBOARD_PROPS.columns,
        loading: convertedProps.loading ?? DEFAULT_DASHBOARD_PROPS.loading,
        error: convertedProps.error,
        emptyMessage: convertedProps.emptyMessage || DEFAULT_DASHBOARD_PROPS.emptyMessage,
        height: convertedProps.height || DEFAULT_DASHBOARD_PROPS.height,
        pageSize: convertedProps.pageSize || DEFAULT_DASHBOARD_PROPS.pageSize,
        pageSizeOptions: convertedProps.pageSizeOptions || [5, 10, 25],
        disableActions: convertedProps.disableActions,
        onRowClick: convertedProps.onRowClick,
      };
    } catch (error) {
      // Fallback to safe defaults if conversion fails
      Sentry.addBreadcrumb({
        message: 'TopTableCard props conversion failed',
        level: 'warning',
        data: {
          inputPropsType: isLegacyProps(inputProps) ? 'legacy' : 'modern',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      return {
        title: 'Tabela',
        ...DEFAULT_DASHBOARD_PROPS,
        error: 'Erro ao processar propriedades da tabela',
      };
    }
  }, [inputProps]);

  // Add Sentry breadcrumb with component state for observability
  useEffect(() => {
    Sentry.addBreadcrumb({
      message: 'TopTableCard rendered',
      level: 'info',
      data: {
        title: props.title,
        columnsCount: props.columns?.length || 0,
        rowsCount: props.data?.length || 0,
        loading: props.loading,
        hasError: !!props.error,
        isLegacyFormat: isLegacyProps(inputProps),
      },
    });
  }, [
    props.title,
    props.columns?.length || 0,
    props.data?.length || 0,
    props.loading,
    props.error,
    inputProps,
  ]);

  // Memoized columns conversion to prevent unnecessary re-renders
  const gridColumns: GridColDef[] = useMemo(() => {
    if (!Array.isArray(props.columns) || props.columns.length === 0) {
      return [];
    }

    return props.columns
      .filter(validateDashboardColumn) // Validate each column
      .map((col: DashboardColumn) => ({
        field: col.field,
        headerName: col.headerName,
        width: col.width || 150,
        flex: 1,
        align: col.align || 'left',
        type: 'string',
        renderCell: (params: GridRenderCellParams) => {
          const value = params.value;

          // Handle null/undefined values safely
          if (value === null || value === undefined) {
            return (
              <Typography variant="body2" color="text.disabled">
                —
              </Typography>
            );
          }

          switch (col.type) {
            case 'currency':
              const numValue = Number(value);
              if (isNaN(numValue)) {
                return (
                  <Typography variant="body2" color="error">
                    Inválido
                  </Typography>
                );
              }
              return (
                <Typography variant="body2" fontWeight={600}>
                  R$ {numValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Typography>
              );

            case 'percentage':
              const pctValue = Number(value);
              if (isNaN(pctValue)) {
                return (
                  <Typography variant="body2" color="error">
                    Inválido
                  </Typography>
                );
              }
              return (
                <Typography variant="body2" color="text.secondary">
                  {pctValue.toFixed(1)}%
                </Typography>
              );

            case 'status':
              const statusColors: Record<string, 'success' | 'error' | 'warning' | 'default'> = {
                online: 'success',
                ativo: 'success',
                confirmado: 'success',
                offline: 'error',
                inativo: 'error',
                cancelado: 'error',
                pendente: 'warning',
              };

              const statusKey = String(value).toLowerCase();
              const color = statusColors[statusKey] || 'default';

              return <Chip label={value} size="small" color={color} variant="outlined" />;

            case 'number':
              const numberValue = Number(value);
              if (isNaN(numberValue)) {
                return (
                  <Typography variant="body2" color="error">
                    Inválido
                  </Typography>
                );
              }
              return (
                <Typography variant="body2" fontWeight={500}>
                  {numberValue.toLocaleString('pt-BR')}
                </Typography>
              );

            case 'date':
              try {
                const dateValue = new Date(value);
                if (isNaN(dateValue.getTime())) {
                  return (
                    <Typography variant="body2" color="error">
                      Data inválida
                    </Typography>
                  );
                }
                return (
                  <Typography variant="body2">{dateValue.toLocaleDateString('pt-BR')}</Typography>
                );
              } catch {
                return (
                  <Typography variant="body2" color="error">
                    Data inválida
                  </Typography>
                );
              }

            default:
              return (
                <Typography variant="body2" noWrap title={String(value)}>
                  {String(value)}
                </Typography>
              );
          }
        },
      }));
  }, [props.columns]);

  // Memoized rows with stable IDs and validation
  const gridRows: GridRowsProp = useMemo(() => {
    if (!Array.isArray(props.data) || props.data.length === 0) {
      return [];
    }

    return props.data
      .filter(validateDashboardRow) // Validate each row
      .map((item: DashboardRow, index) => ({
        // Garantir ID estável evitando sobrescrever spread
        ...item,
        id: item.id ?? `row-${index}`,
      }));
  }, [props.data]);

  // Loading state
  if (props.loading) {
    return (
      <Card>
        <CardHeader
          title={<Skeleton variant="text" width="60%" height={32} />}
          subheader={
            props.subtitle ? <Skeleton variant="text" width="40%" height={20} /> : undefined
          }
        />
        <CardContent>
          <Skeleton variant="rectangular" width="100%" height={props.height} />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (props.error) {
    return (
      <Card>
        <CardHeader
          title={
            <Typography variant="h6" component="h3" fontWeight={600}>
              {props.title}
            </Typography>
          }
          subheader={props.subtitle}
        />
        <CardContent>
          <Alert severity="error">
            <AlertTitle>Erro ao carregar dados</AlertTitle>
            {props.error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  const isEmpty = gridRows.length === 0 || gridColumns.length === 0;

  if (isEmpty) {
    return (
      <Card>
        <CardHeader
          title={
            <Typography variant="h6" component="h3" fontWeight={600}>
              {props.title}
            </Typography>
          }
          subheader={props.subtitle}
        />
        <CardContent>
          <Box
            sx={{
              height: props.height,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {props.emptyMessage}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title={
          <Typography variant="h6" component="h3" fontWeight={600}>
            {props.title}
          </Typography>
        }
        subheader={props.subtitle}
      />
      <CardContent>
        <Box sx={{ height: props.height, width: '100%' }}>
          <DataGrid
            rows={gridRows}
            columns={gridColumns}
            initialState={{
              pagination: { paginationModel: { pageSize: props.pageSize } },
            }}
            pageSizeOptions={props.pageSizeOptions}
            disableRowSelectionOnClick={props.disableActions}
            disableColumnMenu={props.disableActions}
            hideFooterSelectedRowCount
            onRowClick={props.onRowClick ? (params) => props.onRowClick!(params.row) : undefined}
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell': {
                borderBottom: `1px solid ${theme.palette.divider}`,
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: theme.palette.background.default,
                borderBottom: `2px solid ${theme.palette.divider}`,
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: theme.palette.action.hover,
              },
              '& .MuiDataGrid-noRowsOverlay': {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              },
            }}
            localeText={{
              // Localization for Portuguese
              noRowsLabel: props.emptyMessage,
              footerRowSelected: (count) => `${count} linha(s) selecionada(s)`,
              footerTotalRows: 'Total de linhas:',
              columnMenuSortAsc: 'Ordenar crescente',
              columnMenuSortDesc: 'Ordenar decrescente',
              columnMenuFilter: 'Filtrar',
              columnMenuHideColumn: 'Ocultar coluna',
              columnMenuShowColumns: 'Mostrar colunas',
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
