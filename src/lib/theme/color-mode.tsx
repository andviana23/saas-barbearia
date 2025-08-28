'use client';

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { makeTheme } from './index';

type ColorMode = 'light' | 'dark';

interface ColorModeContextType {
  colorMode: ColorMode;
  toggleColorMode: () => void;
  setColorMode: (mode: ColorMode) => void;
}

const ColorModeContext = createContext<ColorModeContextType | undefined>(undefined);

export function useColorMode() {
  const context = useContext(ColorModeContext);
  if (!context) {
    throw new Error('useColorMode must be used within a ColorModeProvider');
  }
  return context;
}

interface ColorModeProviderProps {
  children: ReactNode;
}

/**
 * Regras:
 * - Default: dark
 * - Lê `localStorage[color-mode]`
 * - Se não houver, usa `prefers-color-scheme`
 * - Aplica `data-theme` no <html> (útil p/ CSS globais)
 * - Aplica CssBaseline e ThemeProvider com makeTheme(mode)
 */
export function ColorModeProvider({ children }: ColorModeProviderProps) {
  const [colorMode, _setColorMode] = useState<ColorMode>('dark');

  // Carrega preferência inicial
  useEffect(() => {
    try {
      const stored = localStorage.getItem('color-mode') as ColorMode | null;
      if (stored === 'light' || stored === 'dark') {
        _setColorMode(stored);
        return;
      }
      const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
      _setColorMode(prefersDark ? 'dark' : 'light');
    } catch {
      // em caso de bloqueio de storage, mantém 'dark'
    }
  }, []);

  // Sincroniza no DOM e no storage
  useEffect(() => {
    // atributo para CSS globais (se precisar)
    document.documentElement.setAttribute('data-theme', colorMode);
    try {
      localStorage.setItem('color-mode', colorMode);
    } catch {
      // ignore
    }
  }, [colorMode]);

  // Reação a mudanças do sistema (se o usuário não tiver escolhido manualmente)
  useEffect(() => {
    const mql = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mql) return;

    const handleChange = () => {
      const stored = localStorage.getItem('color-mode');
      // Só segue o sistema se não houver preferência explícita salva
      if (stored !== 'light' && stored !== 'dark') {
        _setColorMode(mql.matches ? 'dark' : 'light');
      }
    };

    mql.addEventListener?.('change', handleChange);
    return () => mql.removeEventListener?.('change', handleChange);
  }, []);

  const theme = useMemo(() => makeTheme(colorMode), [colorMode]);

  const setColorMode = (mode: ColorMode) => {
    _setColorMode(mode);
    try {
      localStorage.setItem('color-mode', mode);
    } catch {
      // ignore
    }
  };

  const toggleColorMode = () => {
    setColorMode(colorMode === 'light' ? 'dark' : 'light');
  };

  return (
    <ColorModeContext.Provider value={{ colorMode, toggleColorMode, setColorMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
