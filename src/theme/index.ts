import { createTheme, ThemeOptions } from '@mui/material/styles';
import { lightPalette, darkPalette } from './palettes';
import { typography } from './typography';
import { components } from './components';
import { shadows } from './shadows';

// Tokens de design system
export const designTokens = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 2,
    md: 4, // Novo padrão DS v2.0.0
    lg: 8,
    xl: 12,
    xxl: 16,
  },
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    md: '0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)',
    lg: '0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.10)',
    xl: '0 15px 25px rgba(0,0,0,0.15), 0 5px 10px rgba(0,0,0,0.05)',
  },
};

// Tema Light
export const lightTheme = createTheme({
  palette: lightPalette,
  typography,
  components: components(createTheme()),
  shadows,
  shape: {
    borderRadius: designTokens.borderRadius.md, // 4px como novo padrão DS v2.0.0
  },
  spacing: (factor: number) => `${designTokens.spacing.xs * factor}px`,
});

// Tema Dark
export const darkTheme = createTheme({
  palette: darkPalette,
  typography,
  components: components(createTheme()),
  shadows,
  shape: {
    borderRadius: designTokens.borderRadius.md, // 4px como novo padrão DS v2.0.0
  },
  spacing: (factor: number) => `${designTokens.spacing.xs * factor}px`,
});

// Tema padrão (dark-first como especificado)
export const theme = darkTheme;

// Tipos para o tema
export type AppTheme = typeof lightTheme;
export type AppThemeOptions = ThemeOptions;
