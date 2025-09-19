'use client';

import React from 'react';
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  CheckboxProps,
  FormControlLabelProps,
} from '@mui/material';

interface DSCheckboxProps extends Omit<CheckboxProps, 'size'> {
  label?: string;
  helperText?: string;
  error?: boolean;
  size?: 'small' | 'medium';
  labelPlacement?: FormControlLabelProps['labelPlacement'];
  required?: boolean;
}

export default function DSCheckbox({
  label,
  helperText,
  error = false,
  size = 'small',
  labelPlacement = 'end',
  required = false,
  sx,
  ...checkboxProps
}: DSCheckboxProps) {
  const checkboxElement = (
    <Checkbox
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
        ...sx,
      }}
      {...checkboxProps}
    />
  );

  if (!label) {
    return checkboxElement;
  }

  return (
    <FormControl error={error} component="fieldset" variant="standard">
      <FormControlLabel
        control={checkboxElement}
        label={
          <span>
            {label}
            {required && (
              <span style={{ color: 'error.main', marginLeft: 4 }}>*</span>
            )}
          </span>
        }
        labelPlacement={labelPlacement}
        sx={{
          margin: 0,
          '& .MuiFormControlLabel-label': {
            fontSize: '0.875rem',
            fontWeight: 500,
          },
        }}
      />
      {helperText && (
        <FormHelperText sx={{ marginLeft: 0, marginTop: 0.5 }}>
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
}