'use client';

import { Box, Typography, Button, Alert } from '@mui/material';
import { Plus } from 'lucide-react';

export default function TiposContaPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Tipos de Conta
        </Typography>
        <Button variant="contained" startIcon={<Plus size={20} />}>
          Novo Tipo
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Configure os tipos de conta bancária utilizados no sistema financeiro.
      </Alert>

      <Typography variant="body1" color="text.secondary">
        Exemplos: Conta Corrente, Poupança, Conta Digital, Carteira Digital, Dinheiro, etc.
      </Typography>
    </Box>
  );
}
