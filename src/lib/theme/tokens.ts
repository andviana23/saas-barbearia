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

// Paleta Dark atualizada (Design System)
export const paletteDark = {
  primary: {
    main: '#F4A300',
    light: '#F6B733',
    dark: '#CC8A00',
  },
  secondary: {
    main: '#FFFFFF',
    light: '#FFFFFF',
    dark: '#E5E7EB',
  },
  success: { main: '#22C55E' },
  warning: { main: '#FBBF24' },
  error: { main: '#F87171' },
  info: { main: '#22C55E' },
  divider: 'rgba(255,255,255,0.08)',
  background: {
    default: '#181818',
    paper: '#2D2D2D',
  },
  // @ts-ignore
  surfaces: {
    1: '#2D2D2D',
    2: '#404040',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#9CA3AF',
    disabled: '#6B7280',
  },
  action: {
    hover: 'rgba(244, 163, 0, 0.08)',
    selected: 'rgba(244, 163, 0, 0.16)',
    disabledOpacity: 0.38,
  },
  neutralBorder: 'rgba(255,255,255,0.1)',
  input: {
    background: '#2D2D2D',
    placeholder: '#6B7280',
  },
} as const;

export const paletteLight = {
  primary: { main: '#F4A300' },
  secondary: { main: '#181818' },
  success: { main: '#16A34A' },
  warning: { main: '#D97706' },
  error: { main: '#DC2626' },
  info: { main: '#2563EB' },
  divider: '#E5E7EB',
  background: {
    default: '#FFFFFF',
    paper: '#FFFFFF',
  },
  text: {
    primary: '#181818',
    secondary: '#6B7280',
    disabled: 'rgba(24,24,24,0.4)',
  },
  action: {
    hover: 'rgba(244, 163, 0, 0.04)',
    selected: 'rgba(244, 163, 0, 0.10)',
    disabledOpacity: 0.38,
  },
  neutralBorder: '#E5E7EB',
} as const;
