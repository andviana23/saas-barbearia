'use client';

import React, { useState } from 'react';
import { Box, Container, useTheme, useMediaQuery } from '@mui/material';
import { useColorMode } from '@/lib/theme/color-mode';
import TratoHeader from './TratoHeader';
import TratoSidebar from './TratoSidebar';

interface AppShellProps {
  title?: string;
  children: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { colorMode, toggleColorMode } = useColorMode();

  const handleDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleThemeToggle = () => toggleColorMode();

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        bgcolor: theme.palette.background.default,
      }}
    >
      {/* Header fixo no topo */}
      <TratoHeader
        onMenuToggle={handleDrawerToggle}
        isDarkMode={colorMode === 'dark'}
        onThemeToggle={handleThemeToggle}
      />

      {/* Sidebar fixa à esquerda */}
      <TratoSidebar
        open={isMobile ? mobileDrawerOpen : true}
        onClose={() => setMobileDrawerOpen(false)}
        variant={isMobile ? 'temporary' : 'permanent'}
      />

      {/* Container principal com scroll exclusivo */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        {/* Espaço para o header fixo */}
        <Box sx={{ height: { xs: 56, sm: 64 }, flexShrink: 0 }} />

        {/* Conteúdo scrollável */}
        <Box
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            position: 'relative',
          }}
        >
          {/* Container de conteúdo com padding consistente */}
          <Container
            maxWidth="lg"
            sx={{
              mx: 'auto',
              p: { xs: 2, sm: 3, md: 4 },
              pl: { md: 0 }, // Remove padding esquerdo em desktop para aproximar do sidebar
              minHeight: '100%',
            }}
          >
            {children}
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default AppShell;
