import { Box, Container, Typography } from '@mui/material'

export default function RelatoriosPage() {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom>
          Central de Relatórios
        </Typography>

        {/* TODO: Implementar RelatoriosFilters component */}
        <Typography variant="body1" color="text.secondary">
          Central de relatórios
        </Typography>
      </Box>
    </Container>
  )
}

export const metadata = {
  title: 'Central de Relatórios | Trato',
  description: 'Central de relatórios e análises',
}
