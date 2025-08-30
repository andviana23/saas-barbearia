import type { Metadata } from 'next';
import { Box, Typography, Grid, Card, CardContent, CardActionArea } from '@mui/material';
import { CreditCard, BarChart3, Package, Building } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Tipos | Trato',
  description: 'Configuração de tipos para parametrização do sistema',
};

const tiposConfig = [
  {
    title: 'Tipos de Pagamento',
    description: 'Configurar formas de pagamento aceitas',
    href: '/tipos/pagamento',
    icon: CreditCard,
    color: 'primary.main',
  },
  {
    title: 'Bandeiras de Cartão',
    description: 'Gerenciar bandeiras de cartão disponíveis',
    href: '/tipos/bandeira',
    icon: CreditCard,
    color: 'secondary.main',
  },
  {
    title: 'Categorias de Despesas',
    description: 'Classificar tipos de despesas do negócio',
    href: '/tipos/despesas',
    icon: BarChart3,
    color: 'error.main',
  },
  {
    title: 'Categorias de Receitas',
    description: 'Classificar tipos de receitas do negócio',
    href: '/tipos/receitas',
    icon: BarChart3,
    color: 'success.main',
  },
  {
    title: 'Categorias Gerais',
    description: 'Categorias para produtos e serviços',
    href: '/tipos/categoria',
    icon: Package,
    color: 'info.main',
  },
  {
    title: 'Tipos de Conta',
    description: 'Configurar tipos de contas financeiras',
    href: '/tipos/conta',
    icon: Building,
    color: 'warning.main',
  },
];

export default function TiposPage() {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Configuração de Tipos
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Configure os diferentes tipos de entidades utilizados no sistema para parametrização de
        pagamentos, categorias e classificações.
      </Typography>

      <Grid container spacing={3}>
        {tiposConfig.map((tipo) => {
          const IconComponent = tipo.icon;
          return (
            <Grid item xs={12} sm={6} md={4} key={tipo.href}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardActionArea component={Link} href={tipo.href} sx={{ height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Box sx={{ mb: 2 }}>
                      <IconComponent size={48} style={{ color: 'currentColor' }} />
                    </Box>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {tipo.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {tipo.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
