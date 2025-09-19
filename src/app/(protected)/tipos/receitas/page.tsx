'use client';

import { Box, Typography, Button, Alert } from '@mui/material';
import { Plus } from 'lucide-react';

export default function TiposReceitasPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Categorias de Receitas
        </Typography>
        <Button variant="contained" startIcon={<Plus size={20} />}>
          Nova Categoria
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Configure categorias de receitas para organizar diferentes fontes de entrada financeira.
      </Alert>

      <Typography variant="body1" color="text.secondary">
        Exemplos: Serviços, Produtos, Consultorias, Comissões, Vendas Online, etc.
      </Typography>
    </Box>
  );
}
