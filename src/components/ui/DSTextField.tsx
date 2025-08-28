'use client';

import { TextField, TextFieldProps } from '@mui/material';

export default function DSTextField({ sx, ...props }: TextFieldProps) {
  return (
    <TextField
      variant="outlined"
      size="small"
      fullWidth
      // Deixe o tema controlar: bg do input, placeholder, bordas, radius
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: (t) => t.shape.borderRadius, // usa radius do tema
        },
        '& .MuiInputLabel-root': {
          fontWeight: 500,
        },
        ...sx,
      }}
      {...props}
    />
  );
}
