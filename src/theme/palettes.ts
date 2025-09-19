import { PaletteOptions } from '@mui/material/styles';

/**
 * Paleta Light - Design System Atualizado
 */
export const lightPalette: PaletteOptions = {
  mode: 'light',
  primary: {
    main: '#4f8cff',
    light: '#7aaaff',
    dark: '#2c5fd8',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#6366f1',
    light: '#818cf8',
    dark: '#4f46e5',
    contrastText: '#FFFFFF',
  },
  background: {
    default: '#F8FAFC',
    paper: '#FFFFFF',
  },
  // @ts-ignore surfaces não faz parte do PaletteOptions padrão
  surfaces: {
    surface1: '#FFFFFF',
    surface2: '#F1F5F9',
  },
  text: {
    primary: '#181818',
    secondary: '#6B7280',
    disabled: '#E5E7EB',
  },
  divider: '#E5E7EB',
  action: {
    active: '#4f8cff',
    hover: 'rgba(79, 140, 255, 0.04)',
    selected: 'rgba(79, 140, 255, 0.10)',
    disabled: '#E5E7EB',
    disabledBackground: '#F9FAFB',
  },
  success: {
    main: '#22C55E',
    light: '#4ADE80',
    dark: '#16A34A',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: '#F59E0B',
    light: '#FBBF24',
    dark: '#D97706',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#EF4444',
    light: '#F87171',
    dark: '#DC2626',
    contrastText: '#FFFFFF',
  },
  info: {
    main: '#2563EB',
    light: '#60A5FA',
    dark: '#1D4ED8',
    contrastText: '#FFFFFF',
  },
  grey: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
};

/**
 * Paleta Dark - Design System v2.1
 */
export const darkPalette: PaletteOptions = {
  mode: 'dark',
  primary: {
    main: '#4f8cff',
    light: '#7aaaff',
    dark: '#2c5fd8',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#6366f1',
    light: '#818cf8',
    dark: '#4f46e5',
    contrastText: '#FFFFFF',
  },
  background: {
    default: '#0B0E13',
    paper: '#12151D',
  },
  // @ts-ignore surfaces não faz parte do PaletteOptions padrão
  surfaces: {
    surface1: '#161A23',
    surface2: '#1C202B',
  },
  text: {
    primary: '#F9FAFB',
    secondary: '#A0A6B5',
    disabled: '#6B7280',
  },
  divider: 'rgba(255,255,255,0.08)',
  action: {
    active: '#4f8cff',
    hover: 'rgba(79, 140, 255, 0.08)',
    selected: 'rgba(79, 140, 255, 0.16)',
    disabled: '#6B7280',
    disabledBackground: '#1C202B',
  },
  success: {
    main: '#22C55E',
    light: '#4ADE80',
    dark: '#16A34A',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: '#F59E0B',
    light: '#FBBF24',
    dark: '#D97706',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#EF4444',
    light: '#F87171',
    dark: '#DC2626',
    contrastText: '#FFFFFF',
  },
  info: {
    main: '#2563EB',
    light: '#60A5FA',
    dark: '#1D4ED8',
    contrastText: '#FFFFFF',
  },
  grey: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#2D2D2D',
    900: '#181818',
  },
};
