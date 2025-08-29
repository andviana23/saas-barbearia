import React from 'react';
import { Drawer, List, ListItemButton, ListItemText, Toolbar } from '@mui/material';
import Link from 'next/link';
import { ROUTE_POLICIES } from '@/lib/auth/roleGuards';

const drawerWidth = 220;

// Placeholder: role virá de contexto de auth futuramente
const currentRole: string | null = 'admin';

const Sidebar: React.FC = () => {
  const entries = Object.keys(ROUTE_POLICIES).filter((p) => !p.startsWith('/configuracoes/hidden'));
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <Toolbar />
      <List>
        {entries.map((path) => (
          <ListItemButton key={path} component={Link} href={path} data-role={currentRole}>
            <ListItemText primary={path.replace('/', '') || 'dashboard'} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
