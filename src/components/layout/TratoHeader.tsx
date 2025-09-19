'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Breadcrumbs,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Brightness4,
  Brightness7,
  ChevronRight,
  Business,
  Person,
  Settings,
  Logout,
  AccountCircle,
} from '@mui/icons-material';
import { useCurrentUnit } from '@/hooks/use-current-unit';
import { useRouter, usePathname } from 'next/navigation';
import { findRouteByPath } from '@/routes';
import { useAuthContext } from '@/lib/auth/AuthContext';
import UnitSelector from './UnitSelector';

interface TratoHeaderProps {
  onMenuToggle?: () => void;
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
}

const TratoHeader: React.FC<TratoHeaderProps> = ({
  onMenuToggle,
  isDarkMode = true,
  onThemeToggle,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { currentUnit, loading } = useCurrentUnit();
  const { user, signOut } = useAuthContext();
  const pathname = usePathname();
  const router = useRouter();
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

  // Gerar breadcrumbs baseado na rota atual
  const generateBreadcrumbs = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Dashboard', path: '/' }];

    if (pathSegments.length === 0) return breadcrumbs;

    // Tentar encontrar a rota exata
    const currentRoute = findRouteByPath(pathname);
    if (currentRoute) {
      breadcrumbs.push({
        label: currentRoute.label,
        path: pathname,
      });
      return breadcrumbs;
    }

    // Fallback: construir breadcrumbs baseado nos segmentos
    let currentPath = '';
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`;
      const route = findRouteByPath(currentPath);

      breadcrumbs.push({
        label: route?.label || segment.charAt(0).toUpperCase() + segment.slice(1),
        path: currentPath,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleProfileClick = () => {
    handleUserMenuClose();
    router.push('/perfil');
  };

  const handleSettingsClick = () => {
    handleUserMenuClose();
    router.push('/configuracoes');
  };

  const handleLogout = async () => {
    handleUserMenuClose();
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Função para gerar as iniciais do nome do usuário
  const getUserInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        boxShadow: 'none',
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
        {/* Menu Toggle (Mobile) */}
        {isMobile && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={onMenuToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Sistema / Unidade Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            {/* Nome do Sistema */}
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 700,
                color: theme.palette.primary.main,
                fontSize: { xs: '1rem', sm: '1.25rem' },
              }}
            >
              Trato Hub
            </Typography>

            {/* Separator */}
            <ChevronRight sx={{ color: theme.palette.text.secondary, fontSize: 16 }} />

            {/* Nome da Unidade */}
            <UnitSelector />
          </Stack>

          {/* Breadcrumbs (Desktop only) */}
          {!isMobile && breadcrumbs.length > 1 && (
            <Box sx={{ ml: 4 }}>
              <Breadcrumbs
                separator={<ChevronRight fontSize="small" />}
                sx={{
                  '& .MuiBreadcrumbs-separator': {
                    color: theme.palette.text.secondary,
                    mx: 0.5,
                  },
                }}
              >
                {breadcrumbs.map((crumb, index) => {
                  const isLast = index === breadcrumbs.length - 1;

                  if (isLast) {
                    return (
                      <Typography
                        key={crumb.path}
                        variant="body2"
                        sx={{
                          color: theme.palette.text.primary,
                          fontWeight: 500,
                          fontSize: '0.875rem',
                        }}
                      >
                        {crumb.label}
                      </Typography>
                    );
                  }

                  return (
                    <Typography
                      key={crumb.path}
                      component="a"
                      href={crumb.path}
                      onClick={(e) => {
                        e.preventDefault();
                        router.push(crumb.path);
                      }}
                      sx={{
                        color: theme.palette.text.secondary,
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        '&:hover': {
                          color: theme.palette.primary.main,
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      {crumb.label}
                    </Typography>
                  );
                })}
              </Breadcrumbs>
            </Box>
          )}
        </Box>

        {/* Menu de usuário */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={handleUserMenuOpen} sx={{ p: 0 }} aria-label="menu do usuário">
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: theme.palette.primary.main,
                fontSize: '0.875rem',
              }}
            >
              {getUserInitials(user?.nome)}
            </Avatar>
          </IconButton>

          {/* Theme Toggle */}
          <IconButton
            onClick={onThemeToggle}
            color="inherit"
            aria-label={isDarkMode ? 'Ativar tema claro' : 'Ativar tema escuro'}
            sx={{
              ml: 1,
              color: theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            {isDarkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Box>

        {/* Menu dropdown do usuário */}
        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={handleUserMenuClose}
          onClick={handleUserMenuClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleProfileClick}>
            <ListItemIcon>
              <Person fontSize="small" />
            </ListItemIcon>
            <ListItemText>
              <Typography variant="body2">Meu Perfil</Typography>
            </ListItemText>
          </MenuItem>
          <MenuItem onClick={handleSettingsClick}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            <ListItemText>
              <Typography variant="body2">Configurações</Typography>
            </ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            <ListItemText>
              <Typography variant="body2">Sair</Typography>
            </ListItemText>
          </MenuItem>
        </Menu>
      </Toolbar>

      {/* Mobile Breadcrumbs */}
      {isMobile && breadcrumbs.length > 1 && (
        <Box
          sx={{
            px: 2,
            pb: 1,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Breadcrumbs
            separator={<ChevronRight fontSize="small" />}
            sx={{
              '& .MuiBreadcrumbs-separator': {
                color: theme.palette.text.secondary,
                mx: 0.5,
              },
            }}
          >
            {breadcrumbs.slice(-2).map((crumb, index, array) => {
              const isLast = index === array.length - 1;

              if (isLast) {
                return (
                  <Typography
                    key={crumb.path}
                    variant="caption"
                    sx={{
                      color: theme.palette.text.primary,
                      fontWeight: 500,
                    }}
                  >
                    {crumb.label}
                  </Typography>
                );
              }

              return (
                <Typography
                  key={crumb.path}
                  component="a"
                  href={crumb.path}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(crumb.path);
                  }}
                  sx={{
                    color: theme.palette.text.secondary,
                    textDecoration: 'none',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    '&:hover': {
                      color: theme.palette.primary.main,
                      textDecoration: 'underline',
                    },
                  }}
                >
                  {crumb.label}
                </Typography>
              );
            })}
          </Breadcrumbs>
        </Box>
      )}
    </AppBar>
  );
};

export default TratoHeader;
