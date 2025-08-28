'use client';

import { Suspense } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import AppSidebar from '@/components/features/navigation/AppSidebar';
import AppHeader from '@/components/features/navigation/AppHeader';
import { AppSidebarProvider } from '@/components/features/navigation/AppSidebarContext';

const drawerWidth = 280;

export default function AppShell({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <AppSidebarProvider>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar */}
        <AppSidebar />

        {/* Main Content Area */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            // Desktop: add margin left to offset the permanent drawer
            ml: isMobile ? 0 : `${drawerWidth}px`,
            transition: theme.transitions.create(['margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          {/* Header */}
          <AppHeader />

          {/* Main Content */}
          <Box
            component="main"
            sx={{
              flex: 1,
              p: { xs: 2, sm: 3, md: 4 },
              backgroundColor: 'background.default',
              // Compensate for AppBar height
              mt: '64px',
              minHeight: 'calc(100vh - 64px)',
            }}
          >
            <Suspense fallback={<div>Carregando...</div>}>{children}</Suspense>
          </Box>
        </Box>
      </Box>
    </AppSidebarProvider>
  );
}
