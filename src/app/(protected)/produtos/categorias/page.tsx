'use client';

import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Avatar,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Add, Edit, Delete, Category, Inventory, ColorLens, Visibility } from '@mui/icons-material';
import { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';

export default function ProdutosCategoriaPage() {
  const [openModal, setOpenModal] = useState(false);

  // Mock das categorias
  const categorias = [
    {
      id: 1,
      nome: 'Produtos para Cabelo',
      descricao: 'Shampoos, condicionadores, pomadas e produtos de styling',
      cor: '#2196F3',
      produtosCount: 25,
      ativo: true,
      icone: '💇‍♂️',
    },
    {
      id: 2,
      nome: 'Produtos para Barba',
      descricao: 'Óleos, bálsamos, cremes e produtos específicos para barba',
      cor: '#FF9800',
      produtosCount: 18,
      ativo: true,
      icone: '🧔',
    },
    {
      id: 3,
      nome: 'Ferramentas e Equipamentos',
      descricao: 'Máquinas, tesouras, navalhas e acessórios profissionais',
      cor: '#4CAF50',
      produtosCount: 12,
      ativo: true,
      icone: '✂️',
    },
    {
      id: 4,
      nome: 'Produtos de Limpeza',
      descricao: 'Desinfetantes, álcool, produtos de higienização',
      cor: '#9C27B0',
      produtosCount: 8,
      ativo: true,
      icone: '🧽',
    },
    {
      id: 5,
      nome: 'Cosméticos Masculinos',
      descricao: 'Hidratantes, protetores solares, perfumes masculinos',
      cor: '#607D8B',
      produtosCount: 15,
      ativo: true,
      icone: '🧴',
    },
    {
      id: 6,
      nome: 'Descontinuados',
      descricao: 'Produtos que não são mais comercializados',
      cor: '#F44336',
      produtosCount: 3,
      ativo: false,
      icone: '📦',
    },
  ];

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleSalvarCategoria = () => {
    alert('Categoria salva! (Mock - funcionalidade em desenvolvimento)');
    setOpenModal(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header da Página */}
      <PageHeader
        title="Categorias de Produtos"
        subtitle="Organize seus produtos em categorias para melhor gestão"
      />

      {/* Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
                <Category />
              </Avatar>
              <Typography variant="h4" fontWeight="bold">
                {categorias.filter((c) => c.ativo).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Categorias Ativas
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 2 }}>
                <Inventory />
              </Avatar>
              <Typography variant="h4" fontWeight="bold">
                {categorias.reduce((total, cat) => total + cat.produtosCount, 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total de Produtos
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 2 }}>
                <ColorLens />
              </Avatar>
              <Typography variant="h4" fontWeight="bold">
                6
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cores Diferentes
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                fullWidth
                size="large"
                onClick={handleOpenModal}
              >
                Nova Categoria
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Grid de Categorias */}
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        📂 Suas Categorias
      </Typography>

      <Grid container spacing={3}>
        {categorias.map((categoria) => (
          <Grid item xs={12} sm={6} md={4} key={categoria.id}>
            <Card
              sx={{
                borderLeft: 4,
                borderLeftColor: categoria.cor,
                opacity: categoria.ativo ? 1 : 0.7,
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardContent>
                {/* Header do Card */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h3" sx={{ mr: 2 }}>
                      {categoria.icone}
                    </Typography>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {categoria.nome}
                      </Typography>
                      <Chip
                        label={categoria.ativo ? 'Ativa' : 'Inativa'}
                        color={categoria.ativo ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <IconButton size="small" onClick={() => alert('Visualizar produtos')}>
                      <Visibility />
                    </IconButton>
                    <IconButton size="small" onClick={() => alert('Editar categoria')}>
                      <Edit />
                    </IconButton>
                    <IconButton size="small" onClick={() => alert('Excluir categoria')}>
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>

                {/* Descrição */}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {categoria.descricao}
                </Typography>

                {/* Estatísticas */}
                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Box>
                    <Typography variant="h5" fontWeight="bold" color="primary.main">
                      {categoria.produtosCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Produtos
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      bgcolor: categoria.cor,
                      border: 2,
                      borderColor: 'white',
                      boxShadow: 1,
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Modal de Nova Categoria */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Nova Categoria de Produto
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Nome da Categoria" variant="outlined" required />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição"
                variant="outlined"
                multiline
                rows={3}
                placeholder="Descreva o tipo de produtos desta categoria..."
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cor da Categoria"
                variant="outlined"
                type="color"
                defaultValue="#2196F3"
                helperText="Cor para identificação visual"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ícone (Emoji)"
                variant="outlined"
                placeholder="💇‍♂️"
                helperText="Um emoji para representar a categoria"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select defaultValue="ativo" label="Status">
                  <MenuItem value="ativo">Ativa</MenuItem>
                  <MenuItem value="inativo">Inativa</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button variant="contained" onClick={handleSalvarCategoria}>
            Salvar Categoria
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dicas de Organização */}
      <Card sx={{ mt: 4, bgcolor: 'info.light' }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            💡 Dicas para Organizar Categorias
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                🎨 Use Cores Distintas
              </Typography>
              <Typography variant="body2">
                Escolha cores diferentes para cada categoria para facilitar a identificação visual.
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                📝 Descrições Claras
              </Typography>
              <Typography variant="body2">
                Escreva descrições que deixem claro quais produtos pertencem a cada categoria.
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                🏷️ Categorias Específicas
              </Typography>
              <Typography variant="body2">
                Evite categorias muito amplas. Seja específico para facilitar a busca de produtos.
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
}
