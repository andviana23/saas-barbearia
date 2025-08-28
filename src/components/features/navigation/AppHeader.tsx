'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  InputBase,
  Avatar,
  Menu,
  MenuItem,
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Logout,
  Settings,
} from '@mui/icons-material';
import { useAppSidebar } from './AppSidebarContext';
import { useAuth } from '@/hooks/use-auth';
import { ThemeToggle } from '@/components/ui';

const getPageTitle = (pathname: string) => {
  const pathMap: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/analytics': 'Analytics',
    '/clientes': 'Clientes',
    '/agenda': 'Agendamentos',
    '/assinaturas': 'Assinaturas',
    '/financeiro': 'Financeiro',
    '/servicos': 'Produtos/Serviços',
    '/configuracoes': 'Configurações',
    '/ajuda': 'Ajuda',
    '/feedback': 'Feedback',
  };

  return pathMap[pathname] || 'Dashboard';
};

export default function AppHeader() {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { toggleSidebar, isMobile } = useAppSidebar();
  const { user, signOut } = useAuth();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await signOut();
  };

  const pageTitle = getPageTitle(pathname);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: 'background.paper',
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: 'text.primary',
      }}
    >
      <Toolbar sx={{ px: { xs: 1, sm: 2 } }}>
        {/* Botão do Menu (Mobile) */}
        {isMobile && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleSidebar}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Título da Página */}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" component="h1" fontWeight={500}>
            {pageTitle}
          </Typography>
          <Chip
            label="Web app"
            size="small"
            variant="outlined"
            sx={{ ml: 2, fontSize: '0.75rem' }}
          />
        </Box>

        {/* Barra de Busca */}
        {!isTablet && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'action.hover',
              borderRadius: 2,
              px: 2,
              py: 0.5,
              mr: 2,
              minWidth: 300,
            }}
          >
            <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
            <InputBase
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flex: 1, fontSize: '0.875rem' }}
            />
          </Box>
        )}

        {/* Controles do Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Toggle de Tema */}
          <ThemeToggle />

          {/* Notificações */}
          <IconButton color="inherit" size="small">
            <NotificationsIcon />
          </IconButton>

          {/* Avatar do Usuário */}
          <IconButton onClick={handleMenuOpen} sx={{ p: 0.5 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                backgroundColor: 'primary.main',
                fontSize: '0.875rem',
              }}
            >
              {user?.nome?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </Avatar>
          </IconButton>

          {/* Menu do Usuário */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 200,
                boxShadow: theme.shadows[8],
              },
            }}
          >
            <MenuItem onClick={() => router.push('/configuracoes/perfil')}>
              <AccountCircle sx={{ mr: 2, fontSize: 20 }} />
              Perfil
            </MenuItem>
            <MenuItem onClick={() => router.push('/configuracoes')}>
              <Settings sx={{ mr: 2, fontSize: 20 }} />
              Configurações
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 2, fontSize: 20 }} />
              Sair
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
