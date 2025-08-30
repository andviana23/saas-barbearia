'use client';

import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Breadcrumbs,
  Link,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Brightness4,
  Brightness7,
  ChevronRight,
  Business,
} from '@mui/icons-material';
import { useCurrentUnit } from '@/hooks/use-current-unit';
import { useRouter, usePathname } from 'next/navigation';
import { findRouteByPath } from '@/routes';

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
  const pathname = usePathname();
  const router = useRouter();

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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Business sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
              {loading ? (
                <Chip
                  label="Carregando..."
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
              ) : currentUnit ? (
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                  }}
                >
                  {currentUnit.nome}
                </Typography>
              ) : (
                <Chip
                  label="Sem unidade"
                  size="small"
                  color="warning"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
              )}
            </Box>
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
                    <Link
                      key={crumb.path}
                      href={crumb.path}
                      onClick={(e) => {
                        e.preventDefault();
                        router.push(crumb.path);
                      }}
                      sx={{
                        color: theme.palette.text.secondary,
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        '&:hover': {
                          color: theme.palette.primary.main,
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      {crumb.label}
                    </Link>
                  );
                })}
              </Breadcrumbs>
            </Box>
          )}
        </Box>

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
                <Link
                  key={crumb.path}
                  href={crumb.path}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(crumb.path);
                  }}
                  sx={{
                    color: theme.palette.text.secondary,
                    textDecoration: 'none',
                    fontSize: '0.75rem',
                    '&:hover': {
                      color: theme.palette.primary.main,
                      textDecoration: 'underline',
                    },
                  }}
                >
                  {crumb.label}
                </Link>
              );
            })}
          </Breadcrumbs>
        </Box>
      )}
    </AppBar>
  );
};

export default TratoHeader;
