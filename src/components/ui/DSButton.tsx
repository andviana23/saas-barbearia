'use client'
import { Button, ButtonProps } from '@mui/material'

export default function DSButton(props: ButtonProps) {
  return <Button {...props} aria-live="polite" />
}
