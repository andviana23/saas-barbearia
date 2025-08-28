'use client';
import * as React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  SelectProps,
} from '@mui/material';

type Option = { label: string; value: string };

interface DSSelectProps extends Omit<SelectProps<string>, 'label' | 'value' | 'onChange'> {
  id: string;
  label: string;
  value: string;
  onChange: (e: SelectChangeEvent<string>) => void;
  options: Option[];
}

export default function DSSelect({
  id,
  label,
  value,
  onChange,
  options,
  sx,
  ...selectProps
}: DSSelectProps) {
  return (
    <FormControl fullWidth size="small" variant="outlined">
      <InputLabel id={`${id}-label`}>{label}</InputLabel>

      <Select
        labelId={`${id}-label`}
        id={id}
        label={label}
        value={value}
        onChange={onChange}
        sx={{
          borderRadius: (t) => t.shape.borderRadius, // deixa radius com o tema
          ...sx,
        }}
        MenuProps={{
          PaperProps: {
            elevation: 0,
            sx: (t) => ({
              bgcolor: 'background.paper', // #040E18
              border: `1px solid ${t.palette.divider}`, // borda sutil
              borderRadius: t.shape.borderRadius,
            }),
          },
        }}
        {...selectProps}
      >
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
