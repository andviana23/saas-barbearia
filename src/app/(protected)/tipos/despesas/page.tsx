'use client';

import { Box, Typography, Button, Alert } from '@mui/material';
import { Plus } from 'lucide-react';

export default function TiposDespesasPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Categorias de Despesas
        </Typography>
        <Button variant="contained" startIcon={<Plus size={20} />}>
          Nova Categoria
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Organize suas despesas em categorias para melhor controle financeiro e relatórios
        detalhados.
      </Alert>

      <Typography variant="body1" color="text.secondary">
        Exemplos: Aluguel, Energia, Produtos, Salários, Marketing, Equipamentos, etc.
      </Typography>
    </Box>
  );
}
