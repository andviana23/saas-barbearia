'use client';

import { Button, ButtonProps } from '@mui/material';

export default function DSButton(props: ButtonProps) {
  return (
    <Button
      variant="contained"
      color="primary"
      size="medium"
      sx={{
        borderRadius: '8px',
        fontWeight: 600,
        textTransform: 'none',
        boxShadow: 'none',
        '&:hover': {
          boxShadow: '0 4px 8px rgba(79, 140, 255, 0.2)',
        },
        ...props.sx,
      }}
      {...props}
    />
  );
}
