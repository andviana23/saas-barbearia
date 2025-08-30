'use client';

import * as React from 'react';
import { Box, useTheme } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';

type LinePoint = { x: string | number | Date; y: number };
type BarPoint = { x: string | number | Date; y: number };

interface DSLineAreaProps {
  data?: LinePoint[];
  height?: number;
  label?: string;
  valueType?: 'currency' | 'number';
  variant?: 'elevated' | 'flat'; // flat remove box wrapper para evitar bordas sobrepostas
  compact?: boolean; // reduz padding interno
}

interface DSBarsProps {
  data?: BarPoint[];
  height?: number;
  label?: string;
  valueType?: 'currency' | 'number';
}

export function DSLineArea({
  data = [],
  height = 320,
  label = 'Série',
  valueType = 'number',
  variant = 'elevated',
  compact = false,
}: DSLineAreaProps) {
  const theme = useTheme();

  const brl = React.useMemo(
    () => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }),
    [],
  );

  const formatNumber = React.useCallback(
    (v: number) =>
      valueType === 'currency' ? brl.format(v) : new Intl.NumberFormat('pt-BR').format(v),
    [brl, valueType],
  );

  const isDateX = React.useMemo(
    () => data.length > 0 && !isNaN(new Date(data[0].x as unknown as string).getTime()),
    [data],
  );

  const formatDate = React.useCallback(
    (input: unknown) => {
      const d = input instanceof Date ? input : new Date(input as string | number | Date);
      // Densidade simples: mais de 12 pontos → incluir hora e rotacionar
      const dense = data.length > 12;
      if (dense) {
        return d.toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    },
    [data.length],
  );

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    variant === 'flat' ? (
      <>{children}</>
    ) : (
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 3,
          p: compact ? 1 : 2,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        {children}
      </Box>
    );

  return (
    <Wrapper>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity={0.25} />
            <stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity={0.05} />
          </linearGradient>
        </defs>
      </svg>
      <LineChart
        height={height}
        series={[
          {
            id: 's1',
            data: data.map((d) => d.y),
            area: true,
            label,
            // Cor primária DS v2 com gradiente
            color: theme.palette.primary.main,
            showMark: true,
            valueFormatter: (v: number | null) => (v == null ? '' : formatNumber(v)),
          },
        ]}
        xAxis={[
          {
            data: data.map((d) => (isDateX ? new Date(d.x as string | number | Date) : d.x)),
            scaleType: isDateX ? 'point' : 'point',
            hideTooltip: false,
            valueFormatter: isDateX ? (v: Date) => formatDate(v) : undefined,
            tickNumber: Math.min(6, Math.max(2, Math.floor(data.length / 2))),
            tickLabelStyle: data.length > 12 ? { angle: -30, textAnchor: 'end' } : undefined,
          },
        ]}
        yAxis={[
          {
            tickNumber: 6,
            valueFormatter: (v: number | null) => (v == null ? '' : formatNumber(v)),
          },
        ]}
        grid={{ horizontal: true, vertical: false }}
        sx={{
          '& .MuiAreaElement-root': {
            fill: `url(#areaGradient)`,
            fillOpacity: 1,
          },
          '& .MuiLineElement-root': {
            stroke: theme.palette.primary.main,
            strokeWidth: 2,
          },
          '& .MuiMarkElement-root': {
            fill: theme.palette.primary.main,
            stroke: theme.palette.primary.main,
            strokeWidth: 2,
          },
          '& .MuiChartsAxis-line': {
            stroke: theme.palette.divider,
            strokeWidth: 1,
          },
          '& .MuiChartsAxis-tickLabel': {
            fill: theme.palette.text.secondary,
            fontSize: '12px',
            fontFamily: theme.typography.fontFamily,
          },
          '& .MuiChartsGrid-line': {
            stroke: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
            strokeWidth: 1,
          },
          '& .MuiChartsTooltip-root': {
            backgroundColor: `${theme.palette.background.paper} !important`,
            color: theme.palette.text.primary,
            border: `1px solid ${theme.palette.divider} !important`,
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '14px',
            fontFamily: theme.typography.fontFamily,
            boxShadow: theme.shadows[8],
          },
        }}
      />
    </Wrapper>
  );
}

export function DSBars({
  data = [],
  height = 320,
  label = 'Série',
  valueType = 'number',
}: DSBarsProps) {
  const theme = useTheme();
  const brl = React.useMemo(
    () => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }),
    [],
  );
  const formatNumber = React.useCallback(
    (v: number) =>
      valueType === 'currency' ? brl.format(v) : new Intl.NumberFormat('pt-BR').format(v),
    [brl, valueType],
  );
  const isDateX = React.useMemo(
    () => data.length > 0 && !isNaN(new Date(data[0].x as unknown as string).getTime()),
    [data],
  );
  const formatDate = React.useCallback((input: unknown) => {
    const d = input instanceof Date ? input : new Date(input as string | number | Date);
    return d.toLocaleDateString('pt-BR', { month: '2-digit', year: '2-digit' });
  }, []);

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 1, // 4px
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
      }}
    >
      <BarChart
        height={height}
        series={[
          {
            data: data.map((d) => d.y),
            label,
            color: theme.palette.secondary.main,
            valueFormatter: (v: number | null) => (v == null ? '' : formatNumber(v)),
          },
        ]}
        xAxis={[
          {
            data: data.map((d) => (isDateX ? new Date(d.x as string | number | Date) : d.x)),
            scaleType: isDateX ? 'band' : 'band',
            hideTooltip: false,
            valueFormatter: isDateX ? (v: Date) => formatDate(v) : undefined,
            tickNumber: Math.min(6, Math.max(2, Math.floor(data.length / 2))),
            tickLabelStyle: data.length > 12 ? { angle: -30, textAnchor: 'end' } : undefined,
          },
        ]}
        yAxis={[
          {
            tickNumber: 6,
            valueFormatter: (v: number | null) => (v == null ? '' : formatNumber(v)),
          },
        ]}
        grid={{ horizontal: true, vertical: false }}
        sx={{
          '& .MuiChartsAxis-line': {
            stroke: theme.palette.divider,
            strokeWidth: 1,
          },
          '& .MuiChartsAxis-tickLabel': {
            fill: theme.palette.text.secondary,
            fontSize: '12px',
            fontFamily: theme.typography.fontFamily,
          },
          '& .MuiChartsGrid-line': {
            stroke: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
            strokeWidth: 1,
          },
          '& .MuiChartsTooltip-root': {
            backgroundColor: `${theme.palette.background.paper} !important`,
            color: theme.palette.text.primary,
            border: `1px solid ${theme.palette.divider} !important`,
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '14px',
            fontFamily: theme.typography.fontFamily,
            boxShadow: theme.shadows[8],
          },
          '& .MuiBarElement-root': {
            fill: theme.palette.secondary.main,
            '&:hover': {
              fill: theme.palette.secondary.light,
              opacity: 0.8,
            },
          },
        }}
      />
    </Box>
  );
}

// Componente PieChart adicional para futuro uso
export function DSPieChart({ height = 320 }: { height?: number }) {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 3,
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* PieChart será implementado quando necessário */}
      <Box
        sx={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.secondary',
          fontSize: '14px',
        }}
      >
        PieChart disponível para implementação futura
      </Box>
    </Box>
  );
}
