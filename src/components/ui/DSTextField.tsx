'use client';

import React, { useState } from 'react';
import {
  TextField,
  TextFieldProps,
  InputAdornment,
  IconButton,
  Box,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Clear,
  Search,
  Phone,
  Email,
  AttachMoney,
} from '@mui/icons-material';

interface DSTextFieldProps extends Omit<TextFieldProps, 'variant' | 'size'> {
  variant?: 'outlined' | 'filled' | 'standard';
  size?: 'small' | 'medium';
  clearable?: boolean;
  searchable?: boolean;
  mask?: 'phone' | 'cpf' | 'cnpj' | 'cep' | 'currency';
  characterLimit?: number;
  showCharacterCount?: boolean;
  onClear?: () => void;
}

// Máscaras de formatação
const applyMask = (value: string, mask: string): string => {
  const cleanValue = value.replace(/\D/g, '');
  
  switch (mask) {
    case 'phone':
      if (cleanValue.length <= 10) {
        return cleanValue.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      }
      return cleanValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    
    case 'cpf':
      return cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    
    case 'cnpj':
      return cleanValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    
    case 'cep':
      return cleanValue.replace(/(\d{5})(\d{3})/, '$1-$2');
    
    case 'currency':
      const number = parseFloat(cleanValue) / 100;
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(number);
    
    default:
      return value;
  }
};

const getIconForType = (type?: string, mask?: string) => {
  if (mask === 'phone') return <Phone fontSize="small" />;
  if (mask === 'currency') return <AttachMoney fontSize="small" />;
  if (type === 'email') return <Email fontSize="small" />;
  if (type === 'search') return <Search fontSize="small" />;
  return null;
};

export default function DSTextField({
  variant = 'outlined',
  size = 'small',
  clearable = false,
  searchable = false,
  mask,
  characterLimit,
  showCharacterCount = false,
  onClear,
  type,
  value,
  onChange,
  helperText,
  sx,
  InputProps,
  ...props
}: DSTextFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [internalValue, setInternalValue] = useState(value || '');

  const isPassword = type === 'password';
  const currentLength = typeof internalValue === 'string' ? internalValue.length : 0;
  
  const characterCountText = characterLimit 
    ? `${currentLength}/${characterLimit}`
    : `${currentLength} caracteres`;

  const finalHelperText = showCharacterCount || characterLimit
    ? `${helperText || ''} ${helperText ? '• ' : ''}${characterCountText}`.trim()
    : helperText;

  const isOverLimit = characterLimit && currentLength > characterLimit;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = event.target.value;
    
    // Aplicar máscara se especificada
    if (mask) {
      newValue = applyMask(newValue, mask);
    }
    
    // Verificar limite de caracteres
    if (characterLimit && newValue.length > characterLimit) {
      return;
    }
    
    setInternalValue(newValue);
    
    // Chamar onChange original com o valor formatado
    if (onChange) {
      const syntheticEvent = {
        ...event,
        target: { ...event.target, value: newValue },
      };
      onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const handleClear = () => {
    setInternalValue('');
    if (onClear) {
      onClear();
    }
    if (onChange) {
      const syntheticEvent = {
        target: { value: '' },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Ícones para o campo
  const startIcon = getIconForType(type, mask);
  const showClearButton = clearable && internalValue && !props.disabled;
  const showPasswordToggle = isPassword;

  const endAdornments = [];
  
  if (showClearButton) {
    endAdornments.push(
      <IconButton
        key="clear"
        size="small"
        onClick={handleClear}
        edge="end"
        sx={{ mr: showPasswordToggle ? 0 : 0.5 }}
      >
        <Clear fontSize="small" />
      </IconButton>
    );
  }
  
  if (showPasswordToggle) {
    endAdornments.push(
      <IconButton
        key="password-toggle"
        size="small"
        onClick={togglePasswordVisibility}
        edge="end"
        sx={{ mr: 0.5 }}
      >
        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
      </IconButton>
    );
  }

  return (
    <TextField
      variant={variant}
      size={size}
      fullWidth
      type={isPassword ? (showPassword ? 'text' : 'password') : type}
      value={internalValue}
      onChange={handleChange}
      helperText={finalHelperText}
      error={props.error || isOverLimit}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: (t) => t.shape.borderRadius,
        },
        '& .MuiInputLabel-root': {
          fontWeight: 500,
        },
        '& .MuiFormHelperText-root': {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          ...(isOverLimit && {
            color: 'error.main',
          }),
        },
        ...sx,
      }}
      InputProps={{
        startAdornment: startIcon ? (
          <InputAdornment position="start">
            <Box sx={{ color: 'text.secondary' }}>
              {startIcon}
            </Box>
          </InputAdornment>
        ) : undefined,
        endAdornment: endAdornments.length > 0 ? (
          <InputAdornment position="end">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {endAdornments}
            </Box>
          </InputAdornment>
        ) : undefined,
        ...InputProps,
      }}
      {...props}
    />
  );
}
