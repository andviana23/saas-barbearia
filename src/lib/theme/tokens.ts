// Radius padronizado (DS v2.1): padrão universal 4px; xs para chips/sutilezas
export const radius = {
  xs: 1,
  sm: 2, // pode ser usado em inputs específicos; próximo mas distinto
  md: 4, // padrão universal (cards, modais, botões)
  lg: 6,
} as const;

export const shadows = {
  none: 'none',
  sm: '0 1px 2px rgba(0,0,0,0.12)',
  md: '0 4px 12px rgba(0,0,0,0.18)',
  lg: '0 8px 24px rgba(0,0,0,0.22)',
} as const;

// Paleta Light - Design System v2.1
export const paletteLight = {
  primary: {
    main: '#4f8cff',
    light: '#7aaaff',
    dark: '#2c5fd8',
  },
  secondary: {
    main: '#6366f1',
    light: '#818cf8',
    dark: '#4f46e5',
  },
  background: {
    default: '#F8FAFC',
    paper: '#FFFFFF',
  },
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
  success: { main: '#22C55E' },
  warning: { main: '#F59E0B' },
  error: { main: '#EF4444' },
  info: { main: '#2563EB' },
} as const;

// Paleta Dark - Design System v2.1
export const paletteDark = {
  primary: {
    main: '#4f8cff',
    light: '#7aaaff',
    dark: '#2c5fd8',
  },
  secondary: {
    main: '#6366f1',
    light: '#818cf8',
    dark: '#4f46e5',
  },
  background: {
    default: '#0B0E13',
    paper: '#12151D',
  },
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
  success: { main: '#22C55E' },
  warning: { main: '#F59E0B' },
  error: { main: '#EF4444' },
  info: { main: '#2563EB' },
} as const;

// Objeto tokens para compatibilidade
export const tokens = {
  palette: paletteLight,
  paletteDark: paletteDark,
} as const;
