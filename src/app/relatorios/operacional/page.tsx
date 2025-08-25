import { Box, Container, Typography } from '@mui/material'

export default function RelatoriosOperacionaisPage() {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom>
          Relatórios Operacionais
        </Typography>

        {/* TODO: Implementar OcupacaoChart component */}
        <Typography variant="body1" color="text.secondary">
          Relatórios operacionais
        </Typography>
      </Box>
    </Container>
  )
}

export const metadata = {
  title: 'Relatórios Operacionais | Trato',
  description: 'Relatórios operacionais e análises',
}
