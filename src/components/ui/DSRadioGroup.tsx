'use client';

import React from 'react';
import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  RadioGroupProps,
  Box,
} from '@mui/material';

export interface RadioOption {
  label: string;
  value: string;
  disabled?: boolean;
  helperText?: string;
}

interface DSRadioGroupProps extends Omit<RadioGroupProps, 'children'> {
  label?: string;
  options: RadioOption[];
  helperText?: string;
  error?: boolean;
  required?: boolean;
  size?: 'small' | 'medium';
  orientation?: 'horizontal' | 'vertical';
}

export default function DSRadioGroup({
  label,
  options,
  helperText,
  error = false,
  required = false,
  size = 'small',
  orientation = 'vertical',
  sx,
  ...radioGroupProps
}: DSRadioGroupProps) {
  return (
    <FormControl error={error} component="fieldset" variant="standard" fullWidth>
      {label && (
        <FormLabel
          component="legend"
          sx={{
            fontSize: '0.875rem',
            fontWeight: 500,
            color: error ? 'error.main' : 'text.primary',
            '&.Mui-focused': {
              color: error ? 'error.main' : 'primary.main',
            },
          }}
        >
          {label}
          {required && (
            <span style={{ color: 'error.main', marginLeft: 4 }}>*</span>
          )}
        </FormLabel>
      )}
      
      <RadioGroup
        row={orientation === 'horizontal'}
        sx={{
          mt: label ? 1 : 0,
          gap: orientation === 'horizontal' ? 2 : 0.5,
          ...sx,
        }}
        {...radioGroupProps}
      >
        {options.map((option) => (
          <Box key={option.value}>
            <FormControlLabel
              value={option.value}
              control={
                <Radio
                  size={size}
                  sx={{
                    '&.Mui-checked': {
                      color: 'primary.main',
                    },
                    '&.Mui-focusVisible': {
                      outline: '2px solid',
                      outlineColor: 'primary.main',
                      outlineOffset: 2,
                    },
                  }}
                />
              }
              label={option.label}
              disabled={option.disabled}
              sx={{
                margin: 0,
                '& .MuiFormControlLabel-label': {
                  fontSize: '0.875rem',
                  fontWeight: 400,
                },
              }}
            />
            {option.helperText && (
              <FormHelperText
                sx={{
                  marginLeft: 4,
                  marginTop: 0,
                  fontSize: '0.75rem',
                }}
              >
                {option.helperText}
              </FormHelperText>
            )}
          </Box>
        ))}
      </RadioGroup>
      
      {helperText && (
        <FormHelperText sx={{ marginLeft: 0, marginTop: 0.5 }}>
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
}