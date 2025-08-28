'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Collapse,
  Typography,
  Chip,
  Avatar,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import {
  Dashboard,
  Analytics,
  People,
  CalendarToday,
  Subscriptions,
  AccountBalance,
  Inventory,
  Settings,
  Help,
  Feedback,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { useAppSidebar } from './AppSidebarContext';
import { useAuth } from '@/hooks/use-auth';

const drawerWidth = 280;

// Estrutura de dados do menu - fonte única de verdade
const navigationItems = [
  { title: 'Dashboard', icon: Dashboard, path: '/dashboard', badge: null, group: 'main' },
  { title: 'Analytics', icon: Analytics, path: '/analytics', badge: null, group: 'main' },
  { title: 'Clientes', icon: People, path: '/clientes', badge: null, group: 'main' },
  { title: 'Agendamentos', icon: CalendarToday, path: '/agenda', badge: null, group: 'main' },
  {
    title: 'Assinaturas',
    icon: Subscriptions,
    path: '/assinaturas',
    badge: null,
    group: 'business',
    submenu: [
      { title: 'Painel Geral', path: '/assinaturas' },
      { title: 'Planos', path: '/assinaturas#planos' },
      { title: 'Assinantes', path: '/assinaturas#assinaturas' },
    ],
  },
  {
    title: 'Financeiro',
    icon: AccountBalance,
    path: '/financeiro',
    badge: null,
    group: 'business',
  },
  {
    title: 'Produtos/Serviços',
    icon: Inventory,
    path: '/servicos',
    badge: null,
    group: 'business',
  },
  {
    title: 'Configurações',
    icon: Settings,
    path: '/configuracoes',
    badge: null,
    group: 'settings',
  },
  { title: 'Ajuda', icon: Help, path: '/ajuda', badge: null, group: 'settings' },
  { title: 'Feedback', icon: Feedback, path: '/feedback', badge: null, group: 'settings' },
];

// Agrupamento lógico dos itens de menu
const menuGroups = {
  main: navigationItems.filter((item) => item.group === 'main'),
  business: navigationItems.filter((item) => item.group === 'business'),
  settings: navigationItems.filter((item) => item.group === 'settings'),
};

export default function AppSidebar() {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { isOpen, isMobile, closeSidebar, setMobile } = useAppSidebar();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const isMobileScreen = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    setMobile(isMobileScreen);
  }, [isMobileScreen, setMobile]);

  const handleNavigation = (path: string) => {
    router.push(path);
    if (isMobile) {
      closeSidebar();
    }
  };

  const toggleSubmenu = (title: string) => {
    setExpandedMenus((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title],
    );
  };

  // Componente para renderizar grupo de itens do menu
  const MenuGroup = ({ items, title }: { items: typeof navigationItems; title?: string }) => (
    <>
      {title && (
        <Typography
          variant="caption"
          sx={{
            px: 3,
            py: 1,
            display: 'block',
            color: 'text.secondary',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 1,
            fontSize: '0.75rem',
          }}
        >
          {title}
        </Typography>
      )}
      {items.map((item) => {
        const isActive = pathname === item.path;
        const hasSubmenu = item.submenu && item.submenu.length > 0;
        const isExpanded = expandedMenus.includes(item.title);
        const Icon = item.icon;

        return (
          <Box key={item.title}>
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() =>
                  hasSubmenu ? toggleSubmenu(item.title) : handleNavigation(item.path)
                }
                sx={{
                  mx: 2,
                  borderRadius: 3, // Bordas mais suaves conforme DS v2
                  minHeight: 48,
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',

                  // Estado normal
                  color: isActive ? 'primary.main' : 'text.primary',
                  backgroundColor: isActive
                    ? alpha(theme.palette.primary.main, 0.12)
                    : 'transparent',

                  // Estados de hover e selected aprimorados
                  '&:hover': {
                    backgroundColor: isActive
                      ? alpha(theme.palette.primary.main, 0.16)
                      : alpha(theme.palette.text.primary, 0.04),
                    transform: 'translateX(2px)',
                  },

                  // Indicador visual de item ativo
                  ...(isActive && {
                    borderLeft: `3px solid ${theme.palette.primary.main}`,
                    borderRadius: '0 12px 12px 0',
                    marginLeft: 2,
                    paddingLeft: 2.5,
                  }),
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? 'primary.main' : 'text.secondary',
                    minWidth: 40,
                    transition: 'color 0.2s ease',
                  }}
                >
                  <Icon fontSize="small" />
                </ListItemIcon>

                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 500,
                    fontFamily: theme.typography.fontFamily,
                  }}
                />

                {item.badge && (
                  <Chip
                    label={item.badge}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: 'secondary.main',
                      color: 'secondary.contrastText',
                      '& .MuiChip-label': {
                        px: 1,
                      },
                    }}
                  />
                )}

                {hasSubmenu && (isExpanded ? <ExpandLess /> : <ExpandMore />)}
              </ListItemButton>
            </ListItem>

            {/* Submenu */}
            {hasSubmenu && (
              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.submenu.map((subItem) => {
                    const isSubActive =
                      pathname === subItem.path ||
                      (subItem.path.includes('#') && pathname === subItem.path.split('#')[0]);

                    return (
                      <ListItem key={subItem.title} disablePadding sx={{ mb: 0.25 }}>
                        <ListItemButton
                          onClick={() => handleNavigation(subItem.path)}
                          sx={{
                            mx: 2,
                            ml: 6, // Indentação do submenu
                            borderRadius: 2,
                            minHeight: 40,
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',

                            color: isSubActive ? 'primary.main' : 'text.secondary',
                            backgroundColor: isSubActive
                              ? alpha(theme.palette.primary.main, 0.08)
                              : 'transparent',

                            '&:hover': {
                              backgroundColor: isSubActive
                                ? alpha(theme.palette.primary.main, 0.12)
                                : alpha(theme.palette.text.primary, 0.04),
                            },
                          }}
                        >
                          <ListItemText
                            primary={subItem.title}
                            primaryTypographyProps={{
                              fontSize: '0.8125rem',
                              fontWeight: isSubActive ? 600 : 400,
                              fontFamily: theme.typography.fontFamily,
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              </Collapse>
            )}
          </Box>
        );
      })}
    </>
  );

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.paper',
      }}
    >
      {/* Cabeçalho aprimorado */}
      <Box
        sx={{
          p: 3,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: 44,
              height: 44,
              fontSize: '1.25rem',
              fontWeight: 700,
              boxShadow: theme.shadows[3],
            }}
          >
            T
          </Avatar>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                lineHeight: 1.2,
                color: 'text.primary',
                fontSize: '1.125rem',
              }}
            >
              Trato
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
                letterSpacing: 0.5,
              }}
            >
              SaaS Barbearias
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navegação Principal com grupos */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        <List component="nav" disablePadding>
          <MenuGroup items={menuGroups.main} />

          <Divider sx={{ my: 2, mx: 3, opacity: 0.6 }} />
          <MenuGroup items={menuGroups.business} title="Negócio" />

          <Divider sx={{ my: 2, mx: 3, opacity: 0.6 }} />
          <MenuGroup items={menuGroups.settings} title="Sistema" />
        </List>
      </Box>

      {/* Seção do Usuário aprimorada */}
      <Box
        sx={{
          p: 2.5,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
          backgroundColor: alpha(theme.palette.background.default, 0.5),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: 'secondary.main',
              width: 40,
              height: 40,
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            {user?.nome?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.nome || 'Usuário'}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
              }}
            >
              {user?.email || 'email@exemplo.com'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          anchor="left"
          open={isOpen}
          onClose={closeSidebar}
          ModalProps={{
            keepMounted: true, // Melhor performance no mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: 'background.paper',
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        /* Desktop Drawer */
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: 'background.paper',
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
}
