'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  ThemeProvider, 
  createTheme, 
  Theme,
  PaletteMode,
  IconButton,
  Tooltip,
  Box,
  Switch,
  FormControlLabel,
  Typography,
} from '@mui/material';
import { 
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  SettingsBrightness as AutoModeIcon,
} from '@mui/icons-material';

type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  mode: ThemeMode;
  actualMode: PaletteMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Cores personalizadas do sistema
const customColors = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  secondary: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef',
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
};

// Função para criar tema personalizado
function createCustomTheme(mode: PaletteMode): Theme {
  const isLight = mode === 'light';
  
  return createTheme({
    palette: {
      mode,
      primary: {
        main: customColors.primary[600],
        light: customColors.primary[400],
        dark: customColors.primary[800],
        contrastText: '#ffffff',
      },
      secondary: {
        main: customColors.secondary[600],
        light: customColors.secondary[400],
        dark: customColors.secondary[800],
        contrastText: '#ffffff',
      },
      success: {
        main: customColors.success[600],
        light: customColors.success[400],
        dark: customColors.success[800],
      },
      warning: {
        main: customColors.warning[600],
        light: customColors.warning[400],
        dark: customColors.warning[800],
      },
      error: {
        main: customColors.error[600],
        light: customColors.error[400],
        dark: customColors.error[800],
      },
      background: {
        default: isLight ? '#ffffff' : '#0f172a',
        paper: isLight ? '#ffffff' : '#1e293b',
      },
      text: {
        primary: isLight ? '#1e293b' : '#f1f5f9',
        secondary: isLight ? '#64748b' : '#94a3b8',
      },
      divider: isLight ? '#e2e8f0' : '#334155',
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
        lineHeight: 1.2,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h3: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h4: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: '1.125rem',
        fontWeight: 600,
        lineHeight: 1.5,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 600,
        lineHeight: 1.5,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
      },
      caption: {
        fontSize: '0.75rem',
        lineHeight: 1.4,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: 8,
            padding: '8px 16px',
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            border: `1px solid ${isLight ? '#e2e8f0' : '#334155'}`,
            boxShadow: isLight 
              ? '0 1px 3px rgba(0, 0, 0, 0.1)' 
              : '0 1px 3px rgba(0, 0, 0, 0.3)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });
}

interface DSThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
}

export function DSThemeProvider({ children, defaultMode = 'light' }: DSThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(defaultMode);
  const [actualMode, setActualMode] = useState<PaletteMode>('light');

  // Detectar preferência do sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateActualMode = () => {
      if (mode === 'auto') {
        setActualMode(mediaQuery.matches ? 'dark' : 'light');
      } else {
        setActualMode(mode as PaletteMode);
      }
    };

    updateActualMode();
    
    if (mode === 'auto') {
      mediaQuery.addEventListener('change', updateActualMode);
      return () => mediaQuery.removeEventListener('change', updateActualMode);
    }
  }, [mode]);

  // Carregar preferência salva
  useEffect(() => {
    const savedMode = localStorage.getItem('theme-mode') as ThemeMode;
    if (savedMode && ['light', 'dark', 'auto'].includes(savedMode)) {
      setModeState(savedMode);
    }
  }, []);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem('theme-mode', newMode);
  };

  const toggleMode = () => {
    const modes: ThemeMode[] = ['light', 'dark', 'auto'];
    const currentIndex = modes.indexOf(mode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setMode(modes[nextIndex]);
  };

  const theme = createCustomTheme(actualMode);

  const contextValue: ThemeContextType = {
    mode,
    actualMode,
    setMode,
    toggleMode,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de DSThemeProvider');
  }
  return context;
}

// Componente para alternar tema
export function DSThemeToggle({ variant = 'icon' }: { variant?: 'icon' | 'switch' | 'menu' }) {
  const { mode, toggleMode, setMode } = useTheme();

  if (variant === 'switch') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2">Tema</Typography>
        <FormControlLabel
          control={
            <Switch
              checked={mode === 'dark'}
              onChange={(e) => setMode(e.target.checked ? 'dark' : 'light')}
            />
          }
          label={mode === 'dark' ? 'Escuro' : 'Claro'}
        />
      </Box>
    );
  }

  if (variant === 'menu') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          Tema
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {[
            { value: 'light', label: 'Claro', icon: <LightModeIcon /> },
            { value: 'dark', label: 'Escuro', icon: <DarkModeIcon /> },
            { value: 'auto', label: 'Auto', icon: <AutoModeIcon /> },
          ].map((option) => (
            <Tooltip key={option.value} title={option.label}>
              <IconButton
                onClick={() => setMode(option.value as ThemeMode)}
                color={mode === option.value ? 'primary' : 'default'}
                size="small"
                sx={{
                  border: mode === option.value ? 1 : 0,
                  borderColor: 'primary.main',
                }}
              >
                {option.icon}
              </IconButton>
            </Tooltip>
          ))}
        </Box>
      </Box>
    );
  }

  // Variant 'icon' (default)
  const getIcon = () => {
    switch (mode) {
      case 'dark':
        return <DarkModeIcon />;
      case 'light':
        return <LightModeIcon />;
      case 'auto':
        return <AutoModeIcon />;
      default:
        return <LightModeIcon />;
    }
  };

  const getTooltip = () => {
    switch (mode) {
      case 'dark':
        return 'Mudar para tema claro';
      case 'light':
        return 'Mudar para tema automático';
      case 'auto':
        return 'Mudar para tema escuro';
      default:
        return 'Alternar tema';
    }
  };

  return (
    <Tooltip title={getTooltip()}>
      <IconButton onClick={toggleMode} color="inherit">
        {getIcon()}
      </IconButton>
    </Tooltip>
  );
}

// Hook para acessar cores do tema
export function useThemeColors() {
  const { actualMode } = useTheme();
  
  return {
    mode: actualMode,
    colors: customColors,
    isLight: actualMode === 'light',
    isDark: actualMode === 'dark',
  };
}