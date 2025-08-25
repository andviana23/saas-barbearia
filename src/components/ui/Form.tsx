import {
  TextField,
  TextFieldProps,
  Box,
  FormControl,
  FormLabel,
  FormHelperText,
  Select,
  SelectProps,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
} from '@mui/material'
import { forwardRef, ReactNode } from 'react'

// Input Text Component
export interface InputProps extends Omit<TextFieldProps, 'variant'> {
  variant?: 'outlined' | 'filled' | 'standard'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ variant = 'outlined', ...props }, ref) => {
    return (
      <TextField
        ref={ref}
        variant={variant}
        fullWidth
        margin="normal"
        {...props}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
          },
          ...props.sx,
        }}
      />
    )
  }
)

Input.displayName = 'Input'

// Select Component
export interface SelectInputProps extends Omit<SelectProps, 'children'> {
  label?: string
  helperText?: string
  options: { value: string | number; label: string }[]
}

export function SelectInput({
  label,
  helperText,
  options,
  error,
  ...props
}: SelectInputProps) {
  return (
    <FormControl fullWidth margin="normal" error={error}>
      {label && <FormLabel>{label}</FormLabel>}
      <Select
        {...props}
        sx={{
          borderRadius: 2,
          ...props.sx,
        }}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  )
}

// Checkbox Component
export interface CheckboxInputProps {
  label: string
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  helperText?: string
  error?: boolean
}

export function CheckboxInput({
  label,
  checked,
  onChange,
  disabled,
  helperText,
  error,
}: CheckboxInputProps) {
  return (
    <FormGroup>
      <FormControlLabel
        control={
          <Checkbox
            checked={checked}
            onChange={(e) => onChange?.(e.target.checked)}
            disabled={disabled}
          />
        }
        label={label}
      />
      {helperText && (
        <FormHelperText error={error} sx={{ ml: 0 }}>
          {helperText}
        </FormHelperText>
      )}
    </FormGroup>
  )
}

// Form Container
export interface FormProps {
  children: ReactNode
  onSubmit?: (e: React.FormEvent) => void
  loading?: boolean
}

export function Form({ children, onSubmit, loading }: FormProps) {
  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        opacity: loading ? 0.7 : 1,
        pointerEvents: loading ? 'none' : 'auto',
      }}
    >
      {children}
    </Box>
  )
}

const FormComponents = { Form, Input, SelectInput, CheckboxInput }

export default FormComponents
