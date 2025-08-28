// src/theme/components.ts
import { Components, Theme } from '@mui/material/styles';

export const components = (theme: Theme): Components => ({
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        backgroundColor: theme.palette.background.default, // #080F18 (dark)
        color: theme.palette.text.primary,
        textRendering: 'optimizeLegibility',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      },
    },
  },

  MuiPaper: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: {
        borderRadius: theme.shape.borderRadius,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper, // #040E18
      },
    },
  },

  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: theme.shape.borderRadius,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper, // #040E18
      },
    },
  },

  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: theme.shape.borderRadius,
        textTransform: 'none',
        fontWeight: 600,
        boxShadow: 'none',
      },
    },
  },

  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: theme.shape.borderRadius,
        backgroundColor: theme.palette.mode === 'dark' ? '#05070A' : undefined,
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.divider,
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.grey[600],
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.primary.main,
        },
        '& input::placeholder': {
          color: theme.palette.grey[400], // #343E51
          opacity: 1,
        },
      },
    },
  },

  MuiListItemButton: {
    styleOverrides: {
      root: {
        borderRadius: theme.shape.borderRadius,
        '&:hover': {
          backgroundColor:
            theme.palette.mode === 'dark' ? theme.palette.grey[500] : theme.palette.action.hover, // #73777E no dark
        },
      },
    },
  },

  MuiMenu: {
    styleOverrides: {
      paper: {
        elevation: 0,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: theme.shape.borderRadius,
      },
    },
  },

  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: theme.shape.borderRadius,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
      },
    },
  },
});
