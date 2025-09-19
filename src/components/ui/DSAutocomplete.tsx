'use client';

import React from 'react';
import {
  Autocomplete,
  TextField,
  AutocompleteProps,
  TextFieldProps,
  Chip,
  Box,
  Typography,
} from '@mui/material';

export interface AutocompleteOption {
  label: string;
  value: string | number;
  disabled?: boolean;
  group?: string;
  description?: string;
}

interface DSAutocompleteProps<T extends AutocompleteOption>
  extends Omit<
    AutocompleteProps<T, boolean, boolean, boolean>,
    'renderInput' | 'options'
  > {
  label: string;
  options: T[];
  error?: boolean;
  helperText?: string;
  required?: boolean;
  placeholder?: string;
  textFieldProps?: Omit<TextFieldProps, 'label' | 'error' | 'helperText'>;
  showDescription?: boolean;
  emptyText?: string;
  loadingText?: string;
}

export default function DSAutocomplete<T extends AutocompleteOption>({
  label,
  options,
  error = false,
  helperText,
  required = false,
  placeholder,
  textFieldProps,
  showDescription = false,
  emptyText = 'Nenhuma opção encontrada',
  loadingText = 'Carregando...',
  sx,
  ...autocompleteProps
}: DSAutocompleteProps<T>) {
  return (
    <Autocomplete
      options={options}
      getOptionLabel={(option) => option.label}
      getOptionDisabled={(option) => option.disabled || false}
      groupBy={(option) => option.group || ''}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      noOptionsText={emptyText}
      loadingText={loadingText}
      size="small"
      renderInput={(params) => (
        <TextField
          {...params}
          label={
            <span>
              {label}
              {required && (
                <span style={{ color: 'error.main', marginLeft: 4 }}>*</span>
              )}
            </span>
          }
          error={error}
          helperText={helperText}
          placeholder={placeholder}
          variant="outlined"
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: (t) => t.shape.borderRadius,
            },
            '& .MuiInputLabel-root': {
              fontWeight: 500,
            },
          }}
          {...textFieldProps}
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {option.label}
            </Typography>
            {showDescription && option.description && (
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', mt: 0.25 }}
              >
                {option.description}
              </Typography>
            )}
          </Box>
        </Box>
      )}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            {...getTagProps({ index })}
            key={option.value}
            label={option.label}
            size="small"
            variant="outlined"
            sx={{
              borderRadius: 1,
              '& .MuiChip-deleteIcon': {
                fontSize: '1rem',
              },
            }}
          />
        ))
      }
      PaperComponent={({ children, ...paperProps }) => (
        <Box
          {...paperProps}
          sx={{
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: (t) => t.shape.borderRadius,
            boxShadow: (t) => t.shadows[4],
            '& .MuiAutocomplete-listbox': {
              padding: 0.5,
              '& .MuiAutocomplete-option': {
                borderRadius: 1,
                margin: '2px 0',
                padding: 1,
                '&[aria-selected="true"]': {
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                },
                '&.Mui-focused': {
                  bgcolor: 'action.hover',
                },
              },
              '& .MuiAutocomplete-groupLabel': {
                bgcolor: 'background.default',
                color: 'text.secondary',
                fontWeight: 600,
                fontSize: '0.75rem',
                padding: '8px 12px',
                position: 'sticky',
                top: 0,
                zIndex: 1,
              },
            },
          }}
        >
          {children}
        </Box>
      )}
      sx={{
        '& .MuiAutocomplete-inputRoot': {
          paddingRight: '39px !important',
        },
        '& .MuiAutocomplete-endAdornment': {
          right: 8,
        },
        ...sx,
      }}
      {...autocompleteProps}
    />
  );
}