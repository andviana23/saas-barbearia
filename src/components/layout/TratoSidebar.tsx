'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  Chip,
  Tooltip,
} from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { LucideIcon } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthContext } from '@/lib/auth/AuthContext';
import { UserRole, routes as routeMap } from '@/routes';
import { useActiveFeatureFlags } from '@/featureFlags';

// Estrutura interna para montar menu dinâmico
interface MenuNode {
  id: string;
  label: string;
  icon?: LucideIcon; // Mantém o tipo original das rotas
  path?: string;
  roles?: UserRole[];
  featureFlag?: import('@/routes').FeatureFlag;
  badge?: { text: string; variant: 'default' | 'success' | 'warning' | 'error' };
  children?: MenuNode[];
}

function buildMenuTree(): MenuNode[] {
  // Converter rotas em nós
  const entries = Object.entries(routeMap).filter(([, r]) => r.showInNav !== false);
  const nodes: Record<string, MenuNode> = {};
  const roots: MenuNode[] = [];

  for (const [key, r] of entries) {
    nodes[key] = {
      id: key,
      label: r.label,
      icon: r.icon,
      path: r.path,
      roles: r.roles,
      featureFlag: r.featureFlag,
      badge: r.badge,
      children: [],
    };
  }

  for (const [key, r] of entries) {
    if (r.parent && nodes[r.parent]) {
      nodes[r.parent].children!.push(nodes[key]);
    } else if (!r.parent) {
      roots.push(nodes[key]);
    }
  }

  // Ordenar por order original
  const orderMap = Object.fromEntries(entries.map(([k, r]) => [k, r.order]));
  const sortFn = (a: MenuNode, b: MenuNode) => (orderMap[a.id] || 0) - (orderMap[b.id] || 0);
  const sortTree = (list: MenuNode[]) => {
    list.sort(sortFn);
    list.forEach((n) => n.children && sortTree(n.children));
  };
  sortTree(roots);
  return roots;
}

const menuStructure: MenuNode[] = buildMenuTree();

interface TratoSidebarProps {
  open?: boolean;
  onClose?: () => void;
  variant?: 'permanent' | 'temporary';
}

const DRAWER_WIDTH = 280;

const TratoSidebar: React.FC<TratoSidebarProps> = ({
  open = true,
  onClose,
  variant = 'permanent',
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthContext();
  const activeFlags = useActiveFeatureFlags();

  // Estado dinâmico de expansão
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Mapa pai->filhos e filho->pai para encontrar ancestry
  const parentMap = useMemo(() => {
    const map: Record<string, string | undefined> = {};
    Object.entries(routeMap).forEach(([key, r]) => {
      if (r.parent) map[key] = r.parent;
    });
    return map;
  }, []);

  // Expande automaticamente os ancestrais da rota ativa
  useEffect(() => {
    if (!pathname) return;
    // Encontrar rota cujo path é prefix de pathname mais longo (match mais específico)
    const match = Object.entries(routeMap)
      .filter(([, r]) => pathname.startsWith(r.path))
      .sort((a, b) => b[1].path.length - a[1].path.length)[0];
    if (!match) return;
    const [routeKey] = match;
    const toExpand: string[] = [];
    let cursor: string | undefined = parentMap[routeKey];
    while (cursor) {
      toExpand.push(cursor);
      cursor = parentMap[cursor];
    }
    if (toExpand.length) {
      setExpanded((prev) => {
        const next = { ...prev };
        let changed = false;
        toExpand.forEach((k) => {
          if (!next[k]) {
            next[k] = true;
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }
  }, [pathname, parentMap]);

  const handleToggleExpand = (id: string) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleNavigate = (path: string) => {
    router.push(path);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const isActive = (path: string): boolean => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  const canAccessMenuItem = (item: MenuNode): boolean => {
    // Verificar roles
    if (item.roles && user?.role) {
      if (!item.roles.includes(user.role as UserRole)) {
        return false;
      }
    }

    // Verificar feature flags
    if (item.featureFlag) {
      if (!activeFlags.includes(item.featureFlag)) {
        return false;
      }
    }

    return true;
  };

  const renderMenuItem = (item: MenuNode, level: number = 0): React.ReactNode => {
    if (!canAccessMenuItem(item)) {
      return null;
    }

    const hasChildren = item.children && item.children.length > 0;
    const isItemActive = item.path ? isActive(item.path) : false;
    const isExpanded = !!expanded[item.id];

    const paddingLeft = theme.spacing(2 + level * 2);

    if (hasChildren) {
      return (
        <React.Fragment key={item.id}>
          <ListItemButton
            onClick={() => handleToggleExpand(item.id)}
            sx={{
              pl: paddingLeft,
              py: 1,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            {item.icon && (
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: theme.palette.text.secondary,
                }}
              >
                <item.icon />
              </ListItemIcon>
            )}
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                variant: 'body2',
                fontWeight: 500,
                fontSize: '0.875rem',
              }}
            />
            {item.badge && (
              <Chip
                label={item.badge.text}
                size="small"
                color={item.badge.variant}
                sx={{
                  fontSize: '0.6rem',
                  height: 18,
                  mr: 1,
                }}
              />
            )}
            {isExpanded ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children?.map((child) => renderMenuItem(child, level + 1))}
            </List>
          </Collapse>
        </React.Fragment>
      );
    }

    return (
      <Tooltip key={item.id} title={item.badge?.text || ''} placement="right">
        <ListItemButton
          onClick={() => item.path && handleNavigate(item.path)}
          selected={isItemActive}
          sx={{
            pl: paddingLeft,
            py: 1,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
            '&.Mui-selected': {
              backgroundColor: `${theme.palette.primary.main}15`,
              borderRight: `3px solid ${theme.palette.primary.main}`,
              '&:hover': {
                backgroundColor: `${theme.palette.primary.main}25`,
              },
            },
          }}
        >
          {item.icon && (
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: isItemActive ? theme.palette.primary.main : theme.palette.text.secondary,
              }}
            >
              <item.icon />
            </ListItemIcon>
          )}
          <ListItemText
            primary={item.label}
            primaryTypographyProps={{
              variant: 'body2',
              fontWeight: isItemActive ? 600 : 500,
              fontSize: '0.875rem',
              color: isItemActive ? theme.palette.primary.main : theme.palette.text.primary,
            }}
          />
          {item.badge && (
            <Chip
              label={item.badge.text}
              size="small"
              color={item.badge.variant}
              sx={{
                fontSize: '0.6rem',
                height: 18,
              }}
            />
          )}
        </ListItemButton>
      </Tooltip>
    );
  };

  const drawerContent = (
    <Box sx={{ overflow: 'auto', height: '100%' }}>
      {/* Header do Sidebar */}
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          minHeight: { xs: 56, sm: 64 },
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: theme.palette.primary.main,
            fontSize: '1.125rem',
          }}
        >
          Menu
        </Typography>
      </Box>

      {/* Lista de Navegação */}
      <List sx={{ py: 1 }}>{menuStructure.map((item) => renderMenuItem(item))}</List>

      {/* Footer do Sidebar */}
      <Box
        sx={{
          mt: 'auto',
          p: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.secondary,
            fontSize: '0.75rem',
          }}
        >
          Trato Hub v2.0.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
          ...(variant === 'permanent' && {
            position: 'fixed',
            height: '100vh',
            zIndex: theme.zIndex.drawer,
          }),
        },
      }}
      ModalProps={{
        keepMounted: true, // Melhor performance no mobile
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default TratoSidebar;
