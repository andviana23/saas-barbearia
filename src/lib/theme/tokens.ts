export const radius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
} as const;

export const shadows = {
  none: 'none',
  sm: '0 1px 2px rgba(0,0,0,0.12)',
  md: '0 4px 12px rgba(0,0,0,0.18)',
  lg: '0 8px 24px rgba(0,0,0,0.22)',
} as const;

export const paletteDark = {
  primary: {
    main: '#C2C9D6', // Botões
    light: '#D3D8E2',
    dark: '#9EA6B3',
  },
  secondary: {
    main: '#6B7A8F',
    light: '#8391A3',
    dark: '#515E70',
  },
  success: { main: '#34D399' },
  warning: { main: '#FBBF24' },
  error: { main: '#F87171' },
  info: { main: '#60A5FA' },
  divider: 'rgba(255,255,255,0.08)',
  background: {
    default: '#080F18', // Fundo principal
    paper: '#040E18', // Cards/containers
  },
  text: {
    primary: '#E6EBF2',
    secondary: '#B6C0CD',
    disabled: '#7C8796',
  },
  action: {
    hover: '#73777E', // Hover Sidebar
    selected: 'rgba(115,119,126,0.24)',
    disabledOpacity: 0.38,
  },
  neutralBorder: 'rgba(255,255,255,0.08)',
  input: {
    background: '#05070A', // Fundo dos inputs
    placeholder: '#343E51', // Placeholder
  },
} as const;

export const paletteLight = {
  primary: { main: '#2563EB' },
  success: { main: '#16A34A' },
  warning: { main: '#D97706' },
  error: { main: '#DC2626' },
  info: { main: '#0891B2' },
  divider: '#E5E7EB',
  background: {
    default: '#F8FAFC',
    paper: '#FFFFFF',
  },
  text: {
    primary: '#0F172A',
    secondary: '#475569',
    disabled: 'rgba(15,23,42,0.4)',
  },
  action: {
    hover: 'rgba(2,6,23,0.04)',
    selected: 'rgba(37,99,235,0.10)',
    disabledOpacity: 0.38,
  },
  neutralBorder: '#E2E8F0',
} as const;
