import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
} from '@mui/material'
import { forwardRef } from 'react'

export interface ButtonProps extends MuiButtonProps {
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ loading = false, disabled, children, ...props }, ref) => {
    return (
      <MuiButton
        ref={ref}
        disabled={disabled || loading}
        {...props}
        sx={{
          textTransform: 'none',
          borderRadius: 2,
          fontWeight: 500,
          ...props.sx,
        }}
      >
        {loading ? 'Carregando...' : children}
      </MuiButton>
    )
  }
)

Button.displayName = 'Button'

export default Button
