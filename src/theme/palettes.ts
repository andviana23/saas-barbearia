import { PaletteOptions } from '@mui/material/styles';

/**
 * Paleta Light - Design System Atualizado
 */
export const lightPalette: PaletteOptions = {
  mode: 'light',
  primary: {
    main: '#F4A300',
    light: '#F6B733',
    dark: '#CC8A00',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#181818',
    light: '#333333',
    dark: '#000000',
    contrastText: '#FFFFFF',
  },
  background: {
    default: '#FFFFFF',
    paper: '#FFFFFF',
  },
  text: {
    primary: '#181818',
    secondary: '#6B7280',
    disabled: '#E5E7EB',
  },
  divider: '#E5E7EB',
  action: {
    active: '#F4A300',
    hover: 'rgba(244, 163, 0, 0.04)',
    selected: 'rgba(244, 163, 0, 0.12)',
    disabled: '#E5E7EB',
    disabledBackground: '#F9FAFB',
  },
  success: {
    main: '#10B981',
    light: '#34D399',
    dark: '#059669',
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
 * Paleta Dark - Design System Atualizado
 */
export const darkPalette: PaletteOptions = {
  mode: 'dark',

  primary: {
    main: '#F4A300',
    light: '#F6B733',
    dark: '#CC8A00',
    contrastText: '#181818',
  },

  secondary: {
    main: '#FFFFFF',
    light: '#FFFFFF',
    dark: '#E5E7EB',
    contrastText: '#181818',
  },

  background: {
    default: '#181818',
    paper: '#2D2D2D',
  },

  text: {
    primary: '#FFFFFF',
    secondary: '#9CA3AF',
    disabled: '#6B7280',
  },

  divider: 'rgba(255,255,255,0.08)',

  action: {
    active: '#F4A300',
    hover: 'rgba(244, 163, 0, 0.08)',
    selected: 'rgba(244, 163, 0, 0.16)',
    disabled: '#6B7280',
    disabledBackground: '#374151',
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
    main: '#22C55E',
    light: '#4ADE80',
    dark: '#16A34A',
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
