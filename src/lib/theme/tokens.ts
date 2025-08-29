// Radius padronizado (DS v2.1): tudo principal em 12px; mantemos xs para chips/sutilezas
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

// Paleta Dark atualizada (DS v2.1)
export const paletteDark = {
  primary: {
    main: '#4F8CFF', // cor de destaque para ações primárias
    light: '#76A9FF',
    dark: '#2E6ED9',
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
    default: '#0B0E13', // Fundo principal v2.1
    paper: '#12151D', // Base containers
  },
  // Surfaces adicionais para hierarquia (extensão não tipada do MUI)
  // @ts-ignore
  surfaces: {
    1: '#161A23', // surface-1 (cards primários)
    2: '#1C202B', // surface-2 (modais / cabeçalhos de tabela / tooltips)
  },
  text: {
    primary: '#E6EBF2',
    secondary: '#A0A6B5', // atualizado
    disabled: '#6E7785',
  },
  action: {
    hover: 'rgba(255,255,255,0.06)',
    selected: 'rgba(79,140,255,0.16)',
    disabledOpacity: 0.38,
  },
  neutralBorder: 'rgba(255,255,255,0.1)', // border-white/10
  input: {
    background: '#12151D', // Inputs seguem paper para integração visual
    placeholder: '#3A4353',
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
