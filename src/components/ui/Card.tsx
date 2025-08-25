import {
  Card as MuiCard,
  CardProps as MuiCardProps,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  Box,
} from '@mui/material'
import { ReactNode } from 'react'

export interface CardProps extends Omit<MuiCardProps, 'title'> {
  title?: string
  subtitle?: string
  actions?: ReactNode
  loading?: boolean
}

export default function Card({
  title,
  subtitle,
  actions,
  loading = false,
  children,
  ...props
}: CardProps) {
  return (
    <MuiCard
      {...props}
      sx={{
        borderRadius: 3,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid',
        borderColor: 'divider',
        ...props.sx,
      }}
    >
      {(title || subtitle) && (
        <CardHeader
          title={
            title && (
              <Typography variant="h6" component="h2">
                {title}
              </Typography>
            )
          }
          subheader={subtitle}
          sx={{ pb: title && !subtitle ? 2 : 1 }}
        />
      )}

      <CardContent sx={{ pt: title || subtitle ? 0 : 2 }}>
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 100,
            }}
          >
            <Typography color="text.secondary">Carregando...</Typography>
          </Box>
        ) : (
          children
        )}
      </CardContent>

      {actions && <CardActions sx={{ px: 2, pb: 2 }}>{actions}</CardActions>}
    </MuiCard>
  )
}
