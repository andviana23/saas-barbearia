'use client';

import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Grid,
  TextField,
  Button,
  Divider,
  Chip,
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  Person,
  Email,
  Phone,
  LocationOn,
  DateRange,
} from '@mui/icons-material';
import PageHeader from '@/components/ui/PageHeader';

export default function PerfilPage() {
  // Mock dos dados do usuário
  const userData = {
    name: 'João Silva',
    email: 'joao.silva@tratohub.com',
    phone: '(11) 99999-9999',
    role: 'Administrador',
    address: 'São Paulo, SP',
    joinDate: '15/01/2024',
    avatar: '',
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header da Página */}
      <PageHeader title="Meu Perfil" subtitle="Gerencie suas informações pessoais e preferências" />

      <Grid container spacing={4}>
        {/* Card Principal do Perfil */}
        <Grid item xs={12} md={4}>
          <Card sx={{ textAlign: 'center' }}>
            <CardContent sx={{ p: 4 }}>
              {/* Avatar */}
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 3,
                  bgcolor: 'primary.main',
                  fontSize: '3rem',
                }}
              >
                <Person sx={{ fontSize: '3rem' }} />
              </Avatar>

              {/* Nome e Cargo */}
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                {userData.name}
              </Typography>

              <Chip label={userData.role} color="primary" variant="outlined" sx={{ mb: 3 }} />

              {/* Informações Básicas */}
              <Box sx={{ textAlign: 'left', space: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Email sx={{ mr: 2, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {userData.email}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Phone sx={{ mr: 2, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {userData.phone}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationOn sx={{ mr: 2, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {userData.address}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <DateRange sx={{ mr: 2, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Membro desde {userData.joinDate}
                  </Typography>
                </Box>
              </Box>

              {/* Botão de Upload da Foto */}
              <Button variant="outlined" fullWidth sx={{ mt: 3 }} startIcon={<Edit />}>
                Alterar Foto
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Formulário de Edição */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Informações Pessoais
              </Typography>

              <Grid container spacing={3}>
                {/* Nome Completo */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nome Completo"
                    defaultValue={userData.name}
                    variant="outlined"
                  />
                </Grid>

                {/* Email */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    defaultValue={userData.email}
                    variant="outlined"
                    type="email"
                  />
                </Grid>

                {/* Telefone */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Telefone"
                    defaultValue={userData.phone}
                    variant="outlined"
                  />
                </Grid>

                {/* Cargo */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Cargo"
                    defaultValue={userData.role}
                    variant="outlined"
                    disabled
                    helperText="Alterado apenas pelo administrador"
                  />
                </Grid>

                {/* Endereço */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Endereço"
                    defaultValue={userData.address}
                    variant="outlined"
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              {/* Seção de Segurança */}
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Segurança
              </Typography>

              <Grid container spacing={3}>
                {/* Senha Atual */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Senha Atual"
                    type="password"
                    variant="outlined"
                    placeholder="Digite sua senha atual"
                  />
                </Grid>

                {/* Nova Senha */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nova Senha"
                    type="password"
                    variant="outlined"
                    placeholder="Digite a nova senha"
                  />
                </Grid>

                {/* Confirmar Nova Senha */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Confirmar Nova Senha"
                    type="password"
                    variant="outlined"
                    placeholder="Confirme a nova senha"
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              {/* Preferências */}
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Preferências
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Fuso Horário"
                    defaultValue="America/Sao_Paulo"
                    variant="outlined"
                    select
                    SelectProps={{
                      native: true,
                    }}
                  >
                    <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                    <option value="America/Rio_Branco">Rio Branco (GMT-5)</option>
                    <option value="America/Manaus">Manaus (GMT-4)</option>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Idioma"
                    defaultValue="pt-BR"
                    variant="outlined"
                    select
                    SelectProps={{
                      native: true,
                    }}
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (US)</option>
                    <option value="es-ES">Español</option>
                  </TextField>
                </Grid>
              </Grid>

              {/* Botões de Ação */}
              <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={() => window.location.reload()}
                >
                  Cancelar
                </Button>

                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={() => alert('Perfil salvo! (Mock - função ainda não implementada)')}
                >
                  Salvar Alterações
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
