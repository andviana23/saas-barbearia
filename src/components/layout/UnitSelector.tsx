'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Chip,
  Menu,
  MenuItem,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { Business, ExpandMore, Check, Warning } from '@mui/icons-material';
import { useCurrentUnit, Unidade } from '@/hooks/use-current-unit';
import { useNotifications } from '@/components/ui/NotificationSystem';

interface AvailableUnit {
  id: string;
  name: string;
  status: string;
}

interface UnitSelectorProps {
  compact?: boolean;
}

export default function UnitSelector({ compact = false }: UnitSelectorProps) {
  const { currentUnit, loading, switchUnit, getUserUnits } = useCurrentUnit();
  const { addNotification } = useNotifications();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [availableUnits, setAvailableUnits] = useState<AvailableUnit[]>([]);
  const [isLoadingUnits, setIsLoadingUnits] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const isMenuOpen = Boolean(anchorEl);

  // Buscar unidades disponíveis quando o menu for aberto
  useEffect(() => {
    if (isMenuOpen) {
      loadAvailableUnits();
    }
  }, [isMenuOpen]);

  const loadAvailableUnits = async () => {
    setIsLoadingUnits(true);
    try {
      const units = await getUserUnits();
      setAvailableUnits(units);
    } catch (error) {
      console.error('Erro ao carregar unidades:', error);
      addNotification({
        title: 'Erro',
        message: 'Erro ao carregar unidades disponíveis',
        type: 'error',
      });
    } finally {
      setIsLoadingUnits(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleUnitSwitch = async (unitId: string) => {
    if (unitId === currentUnit?.id) {
      handleMenuClose();
      return;
    }

    setIsSwitching(true);
    try {
      const result = await switchUnit(unitId);

      if (result.success) {
        addNotification({
          title: 'Sucesso',
          message: 'Unidade alterada com sucesso',
          type: 'success',
        });
        handleMenuClose();
      } else {
        throw result.error;
      }
    } catch (error) {
      console.error('Erro ao trocar unidade:', error);
      addNotification({
        title: 'Erro',
        message: error instanceof Error ? error.message : 'Erro ao trocar unidade',
        type: 'error',
      });
    } finally {
      setIsSwitching(false);
    }
  };

  // Se estiver carregando, mostrar estado de loading
  if (loading) {
    return (
      <Chip label="Carregando..." size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />
    );
  }

  // Se não houver unidade atual
  if (!currentUnit) {
    return (
      <Tooltip title="Nenhuma unidade selecionada">
        <Chip
          label="Sem unidade"
          size="small"
          color="warning"
          variant="outlined"
          icon={<Warning />}
          sx={{ fontSize: '0.75rem' }}
        />
      </Tooltip>
    );
  }

  // Se houver apenas uma unidade, mostrar como texto sem dropdown
  if (availableUnits.length <= 1) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Business sx={{ fontSize: 16, color: 'text.secondary' }} />
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            fontSize: { xs: '0.875rem', sm: '1rem' },
          }}
        >
          {currentUnit.name}
        </Typography>
      </Box>
    );
  }

  // Se houver múltiplas unidades, mostrar dropdown
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Business sx={{ fontSize: 16, color: 'text.secondary' }} />
      <Chip
        label={currentUnit.name}
        size="small"
        color="primary"
        variant="outlined"
        onClick={handleMenuOpen}
        onDelete={handleMenuOpen}
        deleteIcon={<ExpandMore />}
        sx={{
          fontSize: '0.75rem',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: 'action.hover',
          },
        }}
        disabled={isSwitching}
      />

      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          elevation: 2,
          sx: {
            minWidth: 200,
            maxHeight: 300,
            mt: 1,
          },
        }}
      >
        {isLoadingUnits ? (
          <MenuItem disabled>
            <ListItemIcon>
              <CircularProgress size={16} />
            </ListItemIcon>
            <ListItemText>Carregando unidades...</ListItemText>
          </MenuItem>
        ) : availableUnits.length === 0 ? (
          <MenuItem disabled>
            <ListItemText>Nenhuma unidade disponível</ListItemText>
          </MenuItem>
        ) : (
          availableUnits.map((unit) => (
            <MenuItem
              key={unit.id}
              onClick={() => handleUnitSwitch(unit.id)}
              selected={unit.id === currentUnit.id}
              disabled={isSwitching}
            >
              {unit.id === currentUnit.id && (
                <ListItemIcon>
                  <Check fontSize="small" />
                </ListItemIcon>
              )}
              <ListItemText
                primary={unit.name}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: unit.id === currentUnit.id ? 600 : 400,
                }}
                secondaryTypographyProps={{
                  fontSize: '0.75rem',
                }}
              />
            </MenuItem>
          ))
        )}
      </Menu>
    </Box>
  );
}
