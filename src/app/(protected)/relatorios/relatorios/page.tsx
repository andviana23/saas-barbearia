import { Box, Container, Typography } from '@mui/material';
import RelatoriosHarness from './page.harness';

export default function RelatoriosPage() {
  if (process.env.E2E_MODE === '1') {
    return <RelatoriosHarness />;
  }
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
  );
}

export const metadata = {
  title: 'Central de Relatórios | Trato',
  description: 'Central de relatórios e análises',
};
