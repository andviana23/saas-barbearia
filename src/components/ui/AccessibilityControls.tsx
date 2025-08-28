'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  FormGroup,
  ButtonGroup,
  Button,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Accessibility as AccessibilityIcon,
  Contrast as HighContrastIcon,
  VisibilityOff as VisibilityOffIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
} from '@mui/icons-material';
import { useAccessibilityContext } from '@/lib/a11y';

export default function AccessibilityControls() {
  const { config, toggleHighContrast, toggleReducedMotion, setFontSize } =
    useAccessibilityContext();

  return (
    <Card sx={{ maxWidth: 400, mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AccessibilityIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" component="h2">
            Configurações de Acessibilidade
          </Typography>
        </Box>

        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={config.enableHighContrast}
                onChange={toggleHighContrast}
                aria-label="Ativar alto contraste"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <HighContrastIcon sx={{ mr: 1, fontSize: 20 }} />
                Alto Contraste
              </Box>
            }
          />

          <FormControlLabel
            control={
              <Switch
                checked={config.enableReducedMotion}
                onChange={toggleReducedMotion}
                aria-label="Reduzir movimento"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <VisibilityOffIcon sx={{ mr: 1, fontSize: 20 }} />
                Reduzir Movimento
              </Box>
            }
          />
        </FormGroup>

        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Tamanho da Fonte
          </Typography>
          <ButtonGroup size="small" aria-label="Tamanho da fonte">
            <Button
              variant={config.fontSize === 'small' ? 'contained' : 'outlined'}
              onClick={() => setFontSize('small')}
              startIcon={<ZoomOutIcon />}
              aria-label="Fonte pequena"
            >
              A-
            </Button>
            <Button
              variant={config.fontSize === 'medium' ? 'contained' : 'outlined'}
              onClick={() => setFontSize('medium')}
              aria-label="Fonte média"
            >
              A
            </Button>
            <Button
              variant={config.fontSize === 'large' ? 'contained' : 'outlined'}
              onClick={() => setFontSize('large')}
              startIcon={<ZoomInIcon />}
              aria-label="Fonte grande"
            >
              A+
            </Button>
          </ButtonGroup>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Estas configurações melhoram a acessibilidade do sistema.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
