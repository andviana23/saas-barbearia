'use client';
import { Stack } from '@mui/material';
export default function FormRow({ children }: { children: React.ReactNode }) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} gap={2} alignItems="flex-start">
      {children}
    </Stack>
  );
}
