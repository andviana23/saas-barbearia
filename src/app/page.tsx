import { Stack, Typography, Button, Link as MLink } from '@mui/material'
import Link from 'next/link'

export default function Home() {
  return (
    <Stack
      p={4}
      gap={2}
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
    >
      <Typography variant="h1" textAlign="center">
        Trato – Sistema de Gestão
      </Typography>
      <Typography variant="h3" color="text.secondary" textAlign="center">
        Design System MUI v6
      </Typography>
      <Typography color="text.secondary" textAlign="center">
        Vá ao catálogo vivo para visualizar componentes e padrões de uso.
      </Typography>

      <Stack direction="row" gap={2} mt={2}>
        <Button
          variant="contained"
          component={Link}
          href="/design-system"
          size="large"
        >
          Abrir Catálogo
        </Button>
        <Button
          variant="outlined"
          component={Link}
          href="/dashboard"
          size="large"
        >
          Dashboard
        </Button>
      </Stack>

      <MLink
        component={Link}
        href="/design-system"
        aria-label="Abrir design system"
        sx={{ mt: 2 }}
      >
        /design-system
      </MLink>
    </Stack>
  )
}
