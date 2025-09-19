/**
 * Dashboard Types - Centralized type definitions for dashboard components
 * Following project patterns and MUI DataGrid compatibility
 */

// Base column definition for tables
export interface DashboardColumn {
  field: string;
  headerName: string;
  width?: number;
  type?: 'text' | 'number' | 'currency' | 'percentage' | 'status' | 'date';
  align?: 'left' | 'center' | 'right';
}

// Row data interface with required id field
export interface DashboardRow {
  id: string | number;
  [key: string]: string | number | boolean | null | undefined;
}

// Loading and error states
export interface DashboardState {
  loading: boolean;
  error?: string | null;
  data?: DashboardRow[] | Record<string, unknown>;
}

// Table card props interface - flexible structure
export interface TopTableCardProps {
  title?: string;
  subtitle?: string;
  data?: DashboardRow[];
  columns?: DashboardColumn[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  height?: number | string;
  pageSize?: number;
  pageSizeOptions?: number[];
  disableActions?: boolean;
  onRowClick?: (row: DashboardRow) => void;
}

// Legacy props support for backward compatibility
export interface TopTableCardLegacyProps {
  title?: string;
  headers?: string[];
  rows?: Array<{
    id: string | number;
    cells: string[];
  }>;
  loading?: boolean;
  emptyMessage?: string;
}

// Union type for both interfaces
export type TopTableCardAllProps = TopTableCardProps | TopTableCardLegacyProps;

// Type guard to check if props are legacy format
export function isLegacyProps(props: TopTableCardAllProps): props is TopTableCardLegacyProps {
  return 'headers' in props && 'rows' in props;
}

// Convert legacy props to new format
export function convertLegacyProps(props: TopTableCardLegacyProps): TopTableCardProps {
  const { title, headers = [], rows = [], loading = false, emptyMessage } = props;

  // Generate columns from headers
  const columns: DashboardColumn[] = headers.map((header, index) => ({
    field: `col${index}`,
    headerName: header,
    width: 150,
    type: 'text' as const,
  }));

  // Convert rows to new format
  const data: DashboardRow[] = rows.map((row) => {
    const rowData: DashboardRow = { id: row.id };
    row.cells.forEach((cell, index) => {
      rowData[`col${index}`] = cell;
    });
    return rowData;
  });

  return {
    title,
    columns,
    data,
    loading,
    emptyMessage,
  };
}

// Validation schemas using simple validation (can be enhanced with Zod)
export function validateDashboardRow(row: unknown): row is DashboardRow {
  return (
    typeof row === 'object' &&
    row !== null &&
    'id' in row &&
    (typeof (row as Record<string, unknown>).id === 'string' ||
      typeof (row as Record<string, unknown>).id === 'number')
  );
}

export function validateDashboardColumn(column: unknown): column is DashboardColumn {
  return (
    typeof column === 'object' &&
    column !== null &&
    'field' in column &&
    'headerName' in column &&
    typeof (column as Record<string, unknown>).field === 'string' &&
    typeof (column as Record<string, unknown>).headerName === 'string'
  );
}

// Safe defaults
export const DEFAULT_DASHBOARD_PROPS: Required<
  Pick<TopTableCardProps, 'data' | 'columns' | 'loading' | 'emptyMessage' | 'height' | 'pageSize'>
> = {
  data: [],
  columns: [],
  loading: false,
  emptyMessage: 'Nenhum dado encontrado',
  height: 400,
  pageSize: 5,
};
