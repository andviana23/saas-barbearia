'use client';

import React, { useState } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { useColorMode } from '@/lib/theme/color-mode';
import TratoHeader from './TratoHeader';
import TratoSidebar from './TratoSidebar';

interface AppLayoutProps {
  title?: string;
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { colorMode, toggleColorMode } = useColorMode();

  const handleDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleThemeToggle = () => toggleColorMode();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Header fixo */}
      <TratoHeader
        onMenuToggle={handleDrawerToggle}
        isDarkMode={colorMode === 'dark'}
        onThemeToggle={handleThemeToggle}
      />

      {/* Sidebar */}
      <TratoSidebar
        open={isMobile ? mobileDrawerOpen : true}
        onClose={() => setMobileDrawerOpen(false)}
        variant={isMobile ? 'temporary' : 'permanent'}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          // Sidebar é fixed, não precisa de padding-left no main
          pt: { xs: '56px', sm: '64px' }, // compensar altura do header
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
        }}
      >
        {/* Container principal sem limitação de largura */}
        <Box
          sx={{
            // Padding lateral mínimo, sem maxWidth que cause centralização extra
            pt: { xs: 0.5, sm: 0.75, md: 0.75 },
            pb: { xs: 0.5, sm: 0.75, md: 0.75 },
            px: { xs: 0.5, sm: 0.5, md: 1 },
            width: '100%',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;
