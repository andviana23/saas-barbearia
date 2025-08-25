import { Box, Container, Typography } from '@mui/material'

export default function ConfiguracoesUnidadePage() {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom>
          Configuração da Unidade
        </Typography>

        {/* TODO: Implementar ConfigUnidadeForm component */}
        <Typography variant="body1" color="text.secondary">
          Configurações da barbearia
        </Typography>
      </Box>
    </Container>
  )
}

export const metadata = {
  title: 'Configuração da Unidade | Trato',
  description: 'Configurações da unidade/barbearia',
}
