import { Box, Container, Typography } from '@mui/material'
import MovimentacoesEstoqueContent from './components/MovimentacoesEstoqueContent'

export default function MovimentacoesEstoquePage() {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Movimentações de Estoque
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Histórico completo de entradas, saídas e ajustes de estoque
        </Typography>
      </Box>

      <MovimentacoesEstoqueContent />
    </Container>
  )
}

export const metadata = {
  title: 'Movimentações de Estoque | Trato',
  description: 'Histórico de movimentações de estoque',
}
