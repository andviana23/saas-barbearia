import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Search,
  ExpandMore,
  HelpOutline,
  Settings,
  Person,
  CalendarMonth,
  AttachMoney,
  Inventory,
  Assessment,
  ContactSupport,
} from '@mui/icons-material';
import PageHeader from '@/components/ui/PageHeader';

export default function AjudaPage() {
  // Categorias de ajuda
  const categorias = [
    {
      icon: <Person />,
      title: 'Gestão de Clientes',
      description: 'Como cadastrar, editar e gerenciar clientes',
      color: 'primary',
    },
    {
      icon: <CalendarMonth />,
      title: 'Sistema de Agenda',
      description: 'Agendamentos, horários e calendário',
      color: 'secondary',
    },
    {
      icon: <AttachMoney />,
      title: 'Financeiro e Caixa',
      description: 'Controle financeiro, movimentações e relatórios',
      color: 'success',
    },
    {
      icon: <Inventory />,
      title: 'Controle de Estoque',
      description: 'Produtos, movimentações e alertas',
      color: 'warning',
    },
    {
      icon: <Assessment />,
      title: 'Relatórios e Análises',
      description: 'Gerar e interpretar relatórios',
      color: 'info',
    },
    {
      icon: <Settings />,
      title: 'Configurações',
      description: 'Personalizar sistema e preferências',
      color: 'default',
    },
  ];

  // FAQ - Perguntas Frequentes
  const faqItems = [
    {
      question: 'Como cadastrar um novo cliente?',
      answer:
        'Para cadastrar um novo cliente, acesse a página "Clientes" no menu lateral, clique no botão "Adicionar Cliente" e preencha as informações obrigatórias como nome, telefone e email.',
    },
    {
      question: 'Como criar um novo agendamento?',
      answer:
        'Vá para a página "Agenda", clique em "Novo Agendamento", selecione o cliente, profissional, serviço, data e horário desejados. Confirme as informações e salve.',
    },
    {
      question: 'Como registrar uma movimentação de caixa?',
      answer:
        'Na página "Caixa", clique em "Nova Movimentação", selecione o tipo (entrada ou saída), categoria, valor e descrição. O sistema atualizará automaticamente o saldo.',
    },
    {
      question: 'Como gerar relatórios financeiros?',
      answer:
        'Acesse "Relatórios" no menu, selecione "Financeiro", escolha o período desejado e o tipo de relatório. Você pode visualizar na tela ou exportar em PDF/Excel.',
    },
    {
      question: 'Como configurar tipos de pagamento?',
      answer:
        'Vá em "Cadastros" > "Tipos" > "Pagamento". Clique em "Adicionar" para criar novos tipos como PIX, cartão, dinheiro, etc. Defina se aceita parcelamento.',
    },
    {
      question: 'Como alterar horário de funcionamento?',
      answer:
        'Em "Configurações" > "Unidade", você pode definir os horários de funcionamento por dia da semana, horários de almoço e feriados.',
    },
    {
      question: 'Como gerenciar o estoque de produtos?',
      answer:
        'Na página "Estoque", você pode visualizar produtos, registrar entradas/saídas, definir alertas de estoque baixo e acompanhar movimentações.',
    },
    {
      question: 'Como cancelar um agendamento?',
      answer:
        'Na agenda, clique no agendamento desejado, selecione "Editar" e depois "Cancelar". Você pode adicionar um motivo do cancelamento.',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header da Página */}
      <PageHeader
        title="Central de Ajuda"
        subtitle="Encontre respostas para suas dúvidas e aprenda a usar o sistema"
      />

      {/* Barra de Pesquisa */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Pesquisar por dúvidas, tutoriais ou funcionalidades..."
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            💡 Dica: Use palavras-chave como &ldquo;cliente&rdquo;, &ldquo;agendamento&rdquo;,
            &ldquo;caixa&rdquo;, &ldquo;relatório&rdquo;
          </Typography>
        </CardContent>
      </Card>

      {/* Categorias de Ajuda */}
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        📚 Categorias de Ajuda
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {categorias.map((categoria, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      bgcolor: `${categoria.color}.light`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    {categoria.icon}
                  </Box>
                </Box>

                <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                  {categoria.title}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {categoria.description}
                </Typography>

                <Chip label="Ver Tutoriais" size="small" variant="outlined" sx={{ mt: 2 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* FAQ - Perguntas Frequentes */}
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        🤔 Perguntas Frequentes
      </Typography>

      <Card>
        <CardContent>
          {faqItems.map((item, index) => (
            <Accordion key={index} sx={{ '&:before': { display: 'none' } }}>
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <HelpOutline sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography fontWeight="medium">{item.question}</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {item.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </CardContent>
      </Card>

      {/* Links Úteis */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
            🔗 Links Úteis
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <ContactSupport color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Suporte Técnico"
                    secondary="Fale conosco em caso de problemas técnicos"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Assessment color="secondary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Tutoriais em Vídeo"
                    secondary="Assista tutoriais passo a passo (em breve)"
                  />
                </ListItem>
              </List>
            </Grid>

            <Grid item xs={12} md={6}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Settings color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Guia de Configuração"
                    secondary="Configure o sistema do jeito ideal"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <HelpOutline color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Base de Conhecimento"
                    secondary="Documentação completa do sistema"
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Ainda Precisa de Ajuda? */}
      <Card sx={{ mt: 4, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
        <CardContent sx={{ textAlign: 'center', p: 4 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            🚀 Ainda precisa de ajuda?
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Nossa equipe de suporte está pronta para ajudar você!
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Chip
              label="📧 suporte@tratohub.com"
              variant="outlined"
              sx={{ color: 'primary.contrastText', borderColor: 'primary.contrastText' }}
            />
            <Chip
              label="📱 (11) 9999-9999"
              variant="outlined"
              sx={{ color: 'primary.contrastText', borderColor: 'primary.contrastText' }}
            />
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
