'use client';

import { Box, Typography, Button, Alert } from '@mui/material';
import { Plus } from 'lucide-react';

export default function TiposCategoriaPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Categorias Gerais
        </Typography>
        <Button variant="contained" startIcon={<Plus size={20} />}>
          Nova Categoria
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Configure categorias gerais que podem ser utilizadas em diferentes módulos do sistema.
      </Alert>

      <Typography variant="body1" color="text.secondary">
        Categorias customizáveis para classificação geral de itens, serviços e transações.
      </Typography>
    </Box>
  );
}
