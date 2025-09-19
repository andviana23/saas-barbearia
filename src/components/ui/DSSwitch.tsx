'use client';

import React from 'react';
import {
  Switch,
  FormControl,
  FormControlLabel,
  FormHelperText,
  SwitchProps,
  FormControlLabelProps,
  Box,
  Typography,
} from '@mui/material';

interface DSSwitchProps extends Omit<SwitchProps, 'size'> {
  label?: string;
  helperText?: string;
  error?: boolean;
  size?: 'small' | 'medium';
  labelPlacement?: FormControlLabelProps['labelPlacement'];
  required?: boolean;
  description?: string;
  showStatus?: boolean;
  onLabel?: string;
  offLabel?: string;
}

export default function DSSwitch({
  label,
  helperText,
  error = false,
  size = 'small',
  labelPlacement = 'end',
  required = false,
  description,
  showStatus = false,
  onLabel = 'Ativo',
  offLabel = 'Inativo',
  checked,
  sx,
  ...switchProps
}: DSSwitchProps) {
  const switchElement = (
    <Switch
      size={size}
      checked={checked}
      sx={{
        '& .MuiSwitch-switchBase': {
          '&.Mui-checked': {
            color: 'primary.main',
            '& + .MuiSwitch-track': {
              backgroundColor: 'primary.main',
              opacity: 0.5,
            },
          },
          '&.Mui-focusVisible': {
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: 2,
          },
        },
        '& .MuiSwitch-track': {
          borderRadius: 26 / 2,
          backgroundColor: 'action.disabled',
          opacity: 1,
        },
        ...sx,
      }}
      {...switchProps}
    />
  );

  if (!label && !description && !showStatus) {
    return switchElement;
  }

  return (
    <FormControl error={error} component="fieldset" variant="standard" fullWidth>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
        <FormControlLabel
          control={switchElement}
          label={
            label ? (
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, fontSize: '0.875rem' }}
                  >
                    {label}
                    {required && (
                      <span style={{ color: 'error.main', marginLeft: 4 }}>*</span>
                    )}
                  </Typography>
                  {showStatus && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: checked ? 'success.main' : 'text.secondary',
                        fontWeight: 500,
                        fontSize: '0.75rem',
                      }}
                    >
                      {checked ? onLabel : offLabel}
                    </Typography>
                  )}
                </Box>
                {description && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.75rem',
                      mt: 0.25,
                    }}
                  >
                    {description}
                  </Typography>
                )}
              </Box>
            ) : undefined
          }
          labelPlacement={labelPlacement}
          sx={{
            margin: 0,
            alignItems: 'flex-start',
            '& .MuiFormControlLabel-label': {
              marginLeft: labelPlacement === 'end' ? 1 : 0,
              marginRight: labelPlacement === 'start' ? 1 : 0,
            },
          }}
        />
      </Box>
      
      {helperText && (
        <FormHelperText sx={{ marginLeft: 0, marginTop: 0.5 }}>
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
}