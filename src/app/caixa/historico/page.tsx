import { Container } from '@mui/material'
import type { Metadata } from 'next'
import { HistoricoCaixaClient } from './components/HistoricoCaixaClient'

export const metadata: Metadata = {
  title: 'Histórico do Caixa | Trato',
  description: 'Histórico de movimentações financeiras',
}

export default function HistoricoCaixaPage() {
  return (
    <Container maxWidth="xl">
      <HistoricoCaixaClient />
    </Container>
  )
}
