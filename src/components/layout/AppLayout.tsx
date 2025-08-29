import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  title?: string;
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ title, children }) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {title || 'Painel'}
            </Typography>
          </Toolbar>
        </AppBar>
        <Box component="main" sx={{ p: 3, flex: 1 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;
