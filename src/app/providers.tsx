'use client';

import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

import { ColorModeProvider, useColorMode } from '@/lib/theme/color-mode';
import { makeTheme } from '@/lib/theme';
import { ErrorBoundary } from '@/components/ui';
import { NotificationProvider } from '@/components/ui/NotificationSystem';
import { AccessibilityProvider } from '@/lib/a11y';

dayjs.locale('pt-br');

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { colorMode } = useColorMode();
  const theme = makeTheme(colorMode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 300_000, refetchOnWindowFocus: false },
        },
      }),
  );

  return (
    <ErrorBoundary>
      <ColorModeProvider>
        <ThemeWrapper>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
            <QueryClientProvider client={queryClient}>
              <AccessibilityProvider>
                <NotificationProvider>{children}</NotificationProvider>
              </AccessibilityProvider>
            </QueryClientProvider>
          </LocalizationProvider>
        </ThemeWrapper>
      </ColorModeProvider>
    </ErrorBoundary>
  );
}
