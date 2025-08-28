import { createTheme, ThemeOptions } from '@mui/material/styles';
import { shadows, paletteDark, paletteLight, radius } from './tokens';

const typography: ThemeOptions['typography'] = {
  fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif', // Conforme DS v2
  h1: { fontSize: '2rem', fontWeight: 600 },
  h2: { fontSize: '1.75rem', fontWeight: 600 },
  h3: { fontSize: '1.5rem', fontWeight: 600 },
  h4: { fontSize: '1.25rem', fontWeight: 500 },
  h5: { fontWeight: 600, fontSize: '1.125rem' },
  h6: { fontWeight: 600, fontSize: '1rem' },
  body1: { fontSize: '1rem', fontWeight: 400 },
  body2: { fontSize: '0.875rem', fontWeight: 400 },
  button: { fontWeight: 600, textTransform: 'none' }, // Conforme DS v2
  caption: { fontSize: '0.75rem' },
};

const components = (isDark: boolean, neutralBorder: string): ThemeOptions['components'] => ({
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        textRendering: 'optimizeLegibility',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        // ✅ Fundo global
        backgroundColor: isDark ? '#080F18' : '#F8FAFC',
      },
    },
  },

  MuiPaper: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: {
        borderRadius: radius.md,
        border: `1px solid ${neutralBorder}`,
        backgroundClip: 'padding-box',
        // Paper já usa background.paper por padrão — sem override de cor aqui
      },
    },
  },

  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: radius.md,
        border: `1px solid ${neutralBorder}`,
        boxShadow: shadows.sm,
        // Card também herda background.paper
      },
    },
  },

  MuiButton: {
    styleOverrides: {
      root: { borderRadius: radius.sm, paddingInline: 14, height: 38 },
      containedPrimary: { boxShadow: shadows.sm },
      outlined: { borderWidth: 1.2 },
    },
  },

  MuiTextField: {
    defaultProps: { size: 'small', fullWidth: true },
  },

  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: radius.sm,
        '& fieldset': { borderColor: neutralBorder },
        '&:hover fieldset': { borderColor: isDark ? '#2F3541' : '#CBD5E1' },
        '&.Mui-focused fieldset': { borderWidth: 1.5 },
        // ✅ Fundo do input no dark
        ...(isDark && { backgroundColor: '#05070A' }),
        // ✅ Placeholder
        '& input::placeholder': {
          color: isDark ? '#343E51' : 'inherit',
          opacity: 1,
        },
      },
      input: {
        paddingBlock: 10,
        '::placeholder': {
          color: isDark ? '#343E51' : 'inherit',
          opacity: 1,
        },
      },
    },
  },

  MuiAppBar: {
    styleOverrides: {
      root: {
        borderBottom: `1px solid ${neutralBorder}`,
        boxShadow: 'none',
      },
    },
  },

  MuiDrawer: {
    styleOverrides: {
      paper: {
        borderRight: `1px solid ${neutralBorder}`,
        width: 248,
      },
    },
  },

  // ✅ Hover do sidebar
  MuiListItemButton: {
    styleOverrides: {
      root: {
        borderRadius: radius.sm,
        '&:hover': {
          backgroundColor: isDark ? '#73777E' : 'rgba(2,6,23,0.04)',
        },
      },
    },
  },

  MuiTableHead: {
    styleOverrides: {
      root: {
        '& .MuiTableCell-head': {
          fontWeight: 700,
          borderBottom: `1px solid ${neutralBorder}`,
        },
      },
    },
  },

  MuiTableCell: {
    styleOverrides: { root: { borderBottom: `1px solid ${neutralBorder}` } },
  },

  MuiChip: {
    styleOverrides: { root: { borderRadius: radius.xs, fontWeight: 600 } },
  },

  MuiDivider: {
    styleOverrides: { root: { borderColor: neutralBorder } },
  },
});

export function makeTheme(mode: 'dark' | 'light' = 'dark') {
  const isDark = mode === 'dark';
  const palette = isDark ? paletteDark : paletteLight;

  return createTheme({
    palette: { mode, ...palette },
    shape: { borderRadius: radius.md },
    typography,
    components: components(isDark, (palette as any).neutralBorder),
  });
}
