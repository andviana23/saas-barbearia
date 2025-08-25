'use client'
import { TextField, TextFieldProps } from '@mui/material'

export default function DSTextField(props: TextFieldProps) {
  return (
    <TextField
      fullWidth
      inputProps={{
        'aria-label': typeof props.label === 'string' ? props.label : undefined,
      }}
      {...props}
    />
  )
}
