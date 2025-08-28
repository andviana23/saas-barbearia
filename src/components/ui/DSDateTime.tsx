'use client';
import * as React from 'react';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { Dayjs } from 'dayjs';

interface DSDateTimeProps {
  label: string;
  value: Dayjs | null;
  onChange: (date: Dayjs | null) => void;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  minDateTime?: Dayjs;
  maxDateTime?: Dayjs;
}

export default function DSDateTime({
  label,
  value,
  onChange,
  error,
  helperText,
  disabled,
  minDateTime,
  maxDateTime,
}: DSDateTimeProps) {
  return (
    <DateTimePicker
      label={label}
      value={value}
      onChange={(value) => onChange(value as Dayjs | null)}
      disabled={disabled}
      minDateTime={minDateTime}
      maxDateTime={maxDateTime}
      format="DD/MM/YYYY HH:mm"
      ampm={false}
      slotProps={{
        textField: {
          fullWidth: true,
          size: 'small',
          error,
          helperText,
          margin: 'normal',
        },
      }}
    />
  );
}
