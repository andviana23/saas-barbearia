import { Container } from '@mui/material'
import type { Metadata } from 'next'
import { FechamentoCaixaClient } from './components/FechamentoCaixaClient'

export const metadata: Metadata = {
  title: 'Fechamento de Caixa | Trato',
  description: 'Fechamento de caixa diário',
}

export default function FechamentoCaixaPage() {
  return (
    <Container maxWidth="lg">
      <FechamentoCaixaClient />
    </Container>
  )
}
