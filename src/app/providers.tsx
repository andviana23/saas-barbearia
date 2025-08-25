'use client'

import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { theme } from '@/lib/theme'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { NotificationProvider } from '@/components/ui/NotificationSystem'
import { AccessibilityProvider } from '@/lib/a11y'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

// Configurar dayjs
dayjs.locale('pt-br')
dayjs.extend(utc)
dayjs.extend(timezone)

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutos
            gcTime: 1000 * 60 * 10, // 10 minutos (anteriormente cacheTime)
            retry: 3,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
          <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
              <NotificationProvider>
                <AccessibilityProvider>{children}</AccessibilityProvider>
              </NotificationProvider>
            </QueryClientProvider>
          </ErrorBoundary>
        </LocalizationProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  )
}
