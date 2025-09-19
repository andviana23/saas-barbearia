'use client';

import React from 'react';
import {
  Box,
  Typography,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  Info,
} from '@mui/icons-material';

export interface ValidationRule {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  field?: string;
}

interface DSFormValidationProps {
  rules: ValidationRule[];
  title?: string;
  showTitle?: boolean;
  variant?: 'list' | 'alert' | 'inline';
  maxHeight?: number;
}

const getIcon = (type: ValidationRule['type']) => {
  switch (type) {
    case 'error':
      return <Error color="error" fontSize="small" />;
    case 'warning':
      return <Warning color="warning" fontSize="small" />;
    case 'info':
      return <Info color="info" fontSize="small" />;
    case 'success':
      return <CheckCircle color="success" fontSize="small" />;
    default:
      return <Info color="info" fontSize="small" />;
  }
};

const getAlertSeverity = (type: ValidationRule['type']) => {
  switch (type) {
    case 'error':
      return 'error';
    case 'warning':
      return 'warning';
    case 'info':
      return 'info';
    case 'success':
      return 'success';
    default:
      return 'info';
  }
};

export default function DSFormValidation({
  rules,
  title = 'Validação do Formulário',
  showTitle = true,
  variant = 'list',
  maxHeight = 200,
}: DSFormValidationProps) {
  if (!rules || rules.length === 0) {
    return null;
  }

  const errorRules = rules.filter(rule => rule.type === 'error');
  const warningRules = rules.filter(rule => rule.type === 'warning');
  const infoRules = rules.filter(rule => rule.type === 'info');
  const successRules = rules.filter(rule => rule.type === 'success');

  if (variant === 'alert') {
    // Prioriza erros, depois warnings, depois info
    const primaryRules = errorRules.length > 0 ? errorRules : 
                        warningRules.length > 0 ? warningRules : 
                        infoRules.length > 0 ? infoRules : successRules;
    
    if (primaryRules.length === 0) return null;

    const severity = getAlertSeverity(primaryRules[0].type);
    
    return (
      <Alert severity={severity} sx={{ mb: 2 }}>
        {showTitle && <AlertTitle>{title}</AlertTitle>}
        {primaryRules.length === 1 ? (
          primaryRules[0].message
        ) : (
          <List dense sx={{ py: 0 }}>
            {primaryRules.map((rule) => (
              <ListItem key={rule.id} sx={{ py: 0, px: 0 }}>
                <ListItemText 
                  primary={rule.message}
                  primaryTypographyProps={{ fontSize: '0.875rem' }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Alert>
    );
  }

  if (variant === 'inline') {
    return (
      <Box sx={{ mb: 1 }}>
        {rules.map((rule) => (
          <Box 
            key={rule.id}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              mb: 0.5,
              fontSize: '0.75rem',
            }}
          >
            {getIcon(rule.type)}
            <Typography 
              variant="caption" 
              color={`${rule.type}.main`}
              sx={{ fontSize: '0.75rem' }}
            >
              {rule.message}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  }

  // Variant 'list' (padrão)
  return (
    <Box sx={{ mb: 2 }}>
      {showTitle && (
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          {title}
        </Typography>
      )}
      
      <Box 
        sx={{ 
          maxHeight,
          overflowY: 'auto',
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          bgcolor: 'background.paper',
        }}
      >
        <List dense>
          {/* Erros primeiro */}
          {errorRules.map((rule) => (
            <ListItem key={rule.id}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                {getIcon(rule.type)}
              </ListItemIcon>
              <ListItemText 
                primary={rule.message}
                primaryTypographyProps={{ 
                  fontSize: '0.875rem',
                  color: 'error.main',
                }}
              />
            </ListItem>
          ))}
          
          {/* Warnings */}
          {warningRules.map((rule) => (
            <ListItem key={rule.id}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                {getIcon(rule.type)}
              </ListItemIcon>
              <ListItemText 
                primary={rule.message}
                primaryTypographyProps={{ 
                  fontSize: '0.875rem',
                  color: 'warning.main',
                }}
              />
            </ListItem>
          ))}
          
          {/* Info */}
          {infoRules.map((rule) => (
            <ListItem key={rule.id}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                {getIcon(rule.type)}
              </ListItemIcon>
              <ListItemText 
                primary={rule.message}
                primaryTypographyProps={{ 
                  fontSize: '0.875rem',
                  color: 'info.main',
                }}
              />
            </ListItem>
          ))}
          
          {/* Success */}
          {successRules.map((rule) => (
            <ListItem key={rule.id}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                {getIcon(rule.type)}
              </ListItemIcon>
              <ListItemText 
                primary={rule.message}
                primaryTypographyProps={{ 
                  fontSize: '0.875rem',
                  color: 'success.main',
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
}

// Hook para facilitar o uso
export function useFormValidation() {
  const [rules, setRules] = React.useState<ValidationRule[]>([]);

  const addRule = (rule: ValidationRule) => {
    setRules(prev => [...prev.filter(r => r.id !== rule.id), rule]);
  };

  const removeRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
  };

  const clearRules = () => {
    setRules([]);
  };

  const hasErrors = rules.some(rule => rule.type === 'error');
  const hasWarnings = rules.some(rule => rule.type === 'warning');

  return {
    rules,
    addRule,
    removeRule,
    clearRules,
    hasErrors,
    hasWarnings,
    setRules,
  };
}