'use client';

import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

interface DSTextAreaProps extends Omit<TextFieldProps, 'multiline' | 'rows'> {
  rows?: number;
  minRows?: number;
  maxRows?: number;
  autoResize?: boolean;
  characterLimit?: number;
  showCharacterCount?: boolean;
}

export default function DSTextArea({
  rows = 4,
  minRows,
  maxRows,
  autoResize = false,
  characterLimit,
  showCharacterCount = false,
  value,
  helperText,
  sx,
  ...props
}: DSTextAreaProps) {
  const currentLength = typeof value === 'string' ? value.length : 0;
  
  const characterCountText = characterLimit 
    ? `${currentLength}/${characterLimit}`
    : `${currentLength} caracteres`;

  const finalHelperText = showCharacterCount || characterLimit
    ? `${helperText || ''} ${helperText ? '• ' : ''}${characterCountText}`.trim()
    : helperText;

  const isOverLimit = characterLimit && currentLength > characterLimit;

  return (
    <TextField
      multiline
      rows={autoResize ? undefined : rows}
      minRows={autoResize ? minRows || 2 : undefined}
      maxRows={autoResize ? maxRows || 6 : undefined}
      variant="outlined"
      size="small"
      fullWidth
      value={value}
      helperText={finalHelperText}
      error={props.error || isOverLimit}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: (t) => t.shape.borderRadius,
          '& textarea': {
            resize: autoResize ? 'none' : 'vertical',
            fontFamily: 'inherit',
            fontSize: '0.875rem',
            lineHeight: 1.5,
          },
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
      inputProps={{
        maxLength: characterLimit,
        ...props.inputProps,
      }}
      {...props}
    />
  );
}