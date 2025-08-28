import { PaletteOptions } from '@mui/material/styles';

/**
 * Tokens de marca (hex) — conforme solicitado
 */
const BRAND = {
  pageBg: '#080F18', // Fundo da página
  cardBg: '#040E18', // Cards/Containers/Divs
  inputBg: '#05070A', // Fundo dos inputs
  placeholder: '#343E51', // Placeholder
  button: '#C2C9D6', // Botões
  sidebarHover: '#73777E', // Hover do sidebar
};

/**
 * Paleta Light (mantive neutra e clean; podemos afinar depois)
 */
export const lightPalette: PaletteOptions = {
  mode: 'light',
  primary: {
    main: '#1F4D75',
    light: '#3F6D95',
    dark: '#103552',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#2E5C8A',
    light: '#4A77A4',
    dark: '#1C3D5C',
    contrastText: '#FFFFFF',
  },
  background: {
    default: '#F7F9FB',
    paper: '#FFFFFF',
  },
  // TODO: Tipagem customizada para "surface" - comentado para build passar
  // surface: {
  //   main: '#FFFFFF',
  //   light: '#F7F9FB',
  //   dark: '#E6EDF3',
  // } as any,
  text: {
    primary: '#1E293B',
    secondary: '#64748B',
    disabled: '#94A3B8',
  },
  divider: '#E2E8F0',
  action: {
    active: '#1F4D75',
    hover: 'rgba(15, 23, 42, 0.04)',
    selected: 'rgba(31, 77, 117, 0.12)',
    disabled: '#CBD5E1',
    disabledBackground: '#F1F5F9',
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
    main: '#3B82F6',
    light: '#60A5FA',
    dark: '#2563EB',
    contrastText: '#FFFFFF',
  },
  grey: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
};

/**
 * Paleta Dark — aplicada com seus hex
 */
export const darkPalette: PaletteOptions = {
  mode: 'dark',

  // Botões como "primary" para ganhar consistência nos componentes MUI
  primary: {
    main: BRAND.button, // #C2C9D6 (botões)
    light: '#D3D8E2',
    dark: '#9EA6B3',
    contrastText: BRAND.cardBg, // contraste escuro
  },

  // Secundária discreta (podemos trocar depois)
  secondary: {
    main: '#6B7A8F',
    light: '#8391A3',
    dark: '#515E70',
    contrastText: BRAND.cardBg,
  },

  // Fundo da aplicação
  background: {
    default: BRAND.pageBg, // #080F18
    paper: BRAND.cardBg, // #040E18
  },

  // TODO: Tipagem customizada para "surface" - comentado para build passar
  // surface: {
  //   main: BRAND.cardBg, // cards/containers
  //   light: '#0A1521',
  //   dark: BRAND.pageBg,
  // } as any,

  // Tipografia para bom contraste com fundos escuros
  text: {
    primary: '#E6EBF2', // texto principal claro
    secondary: '#B6C0CD', // texto secundário
    disabled: '#7C8796',
  },

  // Divisórias discretas
  divider: '#14202D',

  // Interações (hover/selected) — mantive genéricas, sidebar hover ajustamos via override
  action: {
    active: BRAND.button,
    hover: 'rgba(115, 119, 126, 0.16)', // com base no sidebarHover
    selected: 'rgba(115, 119, 126, 0.24)',
    disabled: '#5A6572',
    disabledBackground: '#0E1722',
  },

  // Estados
  success: {
    main: '#34D399',
    light: '#6EE7B7',
    dark: '#10B981',
    contrastText: BRAND.cardBg,
  },
  warning: {
    main: '#FBBF24',
    light: '#FCD34D',
    dark: '#F59E0B',
    contrastText: BRAND.cardBg,
  },
  error: {
    main: '#F87171',
    light: '#FCA5A5',
    dark: '#EF4444',
    contrastText: BRAND.cardBg,
  },
  info: {
    main: '#60A5FA',
    light: '#93C5FD',
    dark: '#3B82F6',
    contrastText: BRAND.cardBg,
  },

  /**
   * Grey map alinhado aos seus tons:
   * - 900/800 para bases escuras
   * - 500 para hover do sidebar
   * - 400 para placeholder
   */
  grey: {
    50: '#F8FAFC',
    100: '#E7ECF3',
    200: '#C9D1DC',
    300: '#A5B0BE',
    400: BRAND.placeholder, // #343E51 (placeholder)
    500: BRAND.sidebarHover, // #73777E (hover sidebar)
    600: '#8F96A1',
    700: '#A9B0BA',
    800: BRAND.pageBg, // #080F18
    900: BRAND.cardBg, // #040E18
  },
};
