import { Box, Container, Typography } from '@mui/material';

export default function RelatoriosFinanceirosPage() {
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom>
          Relatórios Financeiros
        </Typography>

        {/* TODO: Implementar FaturamentoChart component */}
        <Typography variant="body1" color="text.secondary">
          Relatórios financeiros
        </Typography>
      </Box>
    </Container>
  );
}

export const metadata = {
  title: 'Relatórios Financeiros | Trato',
  description: 'Relatórios financeiros e análises',
};
