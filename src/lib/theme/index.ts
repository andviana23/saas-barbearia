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
        // Fundo global atualizado
        backgroundColor: isDark ? '#0B0E13' : '#F8FAFC',
        // Focus ring acessível (aplicado via data attribute quando necessário)
        '--focus-ring': '#4F8CFF',
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
        backgroundColor: isDark ? '#161A23' : undefined, // surface-1
      },
    },
  },

  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: radius.md,
        border: `1px solid ${neutralBorder}`,
        boxShadow: shadows.sm,
        backgroundColor: isDark ? '#161A23' : undefined, // surface-1
      },
    },
  },

  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: radius.md,
        paddingInline: 16,
        height: 40,
        fontWeight: 600,
        '&:focus-visible': {
          outline: '2px solid var(--focus-ring)',
          outlineOffset: 2,
        },
      },
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
        borderRadius: radius.md,
        '& fieldset': { borderColor: neutralBorder },
        '&:hover fieldset': { borderColor: isDark ? '#4F8CFF' : '#2563EB' },
        '&.Mui-focused fieldset': { borderWidth: 1.5, borderColor: '#4F8CFF' },
        ...(isDark && { backgroundColor: '#12151D' }),
        '& input::placeholder': {
          color: isDark ? '#3A4353' : 'inherit',
          opacity: 1,
        },
      },
      input: {
        paddingBlock: 10,
        '::placeholder': {
          color: isDark ? '#3A4353' : 'inherit',
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
        borderRadius: radius.md,
        '&:hover': {
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(2,6,23,0.04)',
        },
      },
    },
  },

  MuiTableHead: {
    styleOverrides: {
      root: {
        backgroundColor: isDark ? '#1C202B' : undefined, // surface-2
        '& .MuiTableCell-head': {
          fontWeight: 600,
          borderBottom: `1px solid ${neutralBorder}`,
        },
      },
    },
  },

  MuiTableCell: {
    styleOverrides: {
      root: { borderBottom: `1px solid ${neutralBorder}` },
      head: { fontSize: '0.75rem', letterSpacing: 0.5, textTransform: 'uppercase' },
    },
  },

  MuiTableRow: {
    styleOverrides: {
      root: {
        '&:hover': {
          backgroundColor: isDark ? 'rgba(79,140,255,0.08)' : 'rgba(37,99,235,0.06)',
        },
      },
    },
  },

  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: radius.xs,
        fontWeight: 600,
        fontSize: '0.625rem', // ~10px
        letterSpacing: 0.3,
        '&.MuiChip-filledDefault': {
          backgroundColor: isDark ? '#1C202B' : '#F1F5F9',
        },
      },
    },
  },

  MuiDivider: {
    styleOverrides: { root: { borderColor: neutralBorder } },
  },

  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: isDark ? '#1C202B' : '#1E293B',
        border: `1px solid ${neutralBorder}`,
        fontSize: '0.75rem',
        padding: '6px 8px',
        borderRadius: radius.sm,
      },
    },
  },

  MuiDialog: {
    styleOverrides: {
      paper: {
        backgroundColor: isDark ? '#1C202B' : undefined, // surface-2
        borderRadius: radius.md,
        border: `1px solid ${neutralBorder}`,
      },
    },
  },
});

export function makeTheme(mode: 'dark' | 'light' = 'dark') {
  const isDark = mode === 'dark';
  const palette = isDark ? paletteDark : paletteLight;

  const neutralBorder: string = palette.divider || 'rgba(255,255,255,0.08)';
  return createTheme({
    palette: { mode, ...palette },
    shape: { borderRadius: radius.md },
    typography,
    components: components(isDark, neutralBorder),
  });
}
