'use client';

import { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Button,
  Tabs,
  Tab,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Search, FilterList, Star, LocationOn, AccessTime, AttachMoney } from '@mui/icons-material';
import {
  useCatalogoPublico,
  useMarketplaceStats,
  useMarketplaceFilters,
} from '@/hooks/use-marketplace';
import { MarketplaceFilters, MarketplacePagination, CatalogoPublico } from '@/types/marketplace';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`marketplace-tabpanel-${index}`}
      aria-labelledby={`marketplace-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function MarketplaceContent() {
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<MarketplaceFilters>({});
  const [pagination, setPagination] = useState<MarketplacePagination>({
    page: 1,
    limit: 12,
    sort_by: 'nome_publico',
    sort_order: 'asc',
  });

  // Hooks para buscar dados
  const { data: catalogo, isLoading, isError } = useCatalogoPublico(filters, pagination);
  const { data: stats } = useMarketplaceStats();
  const { categorias, faixaPrecos } = useMarketplaceFilters();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (key: keyof MarketplaceFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePaginationChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleSortChange = (sortBy: MarketplacePagination['sort_by']) => {
    setPagination((prev) => ({
      ...prev,
      sort_by: sortBy,
      sort_order: prev.sort_by === sortBy && prev.sort_order === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Filtrar resultados baseado na busca
  const filteredResults =
    (catalogo?.data?.data as any[])?.filter((servico: any) => {
      if (!searchQuery) return true;

      const searchTerm = searchQuery.toLowerCase();
      return (
        servico.nome_publico.toLowerCase().includes(searchTerm) ||
        servico.descricao_publica?.toLowerCase().includes(searchTerm) ||
        servico.categoria_publica?.toLowerCase().includes(searchTerm) ||
        servico.unidade_nome.toLowerCase().includes(searchTerm) ||
        servico.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm))
      );
    }) || [];

  if (isError) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        Erro ao carregar o marketplace. Tente novamente mais tarde.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Estatísticas do Marketplace */}
      {stats?.data && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" component="div" color="primary">
                  {stats.data.total_servicos}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Serviços Disponíveis
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" component="div" color="primary">
                  {stats.data.total_unidades}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Unidades Ativas
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" component="div" color="primary">
                  {stats.data.servicos_destaque}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Serviços em Destaque
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" component="div" color="primary">
                  {categorias.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Categorias
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Barra de Busca */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Buscar serviços, categorias ou unidades..."
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          {/* Filtros Rápidos */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label="Todos"
              onClick={() => setFilters({})}
              color={Object.keys(filters).length === 0 ? 'primary' : 'default'}
              variant={Object.keys(filters).length === 0 ? 'filled' : 'outlined'}
            />
            <Chip
              label="Destaque"
              onClick={() => handleFilterChange('destaque', !filters.destaque)}
              color={filters.destaque ? 'primary' : 'default'}
              variant={filters.destaque ? 'filled' : 'outlined'}
            />
            {categorias.slice(0, 5).map((categoria) => (
              <Chip
                key={categoria}
                label={categoria}
                onClick={() => handleFilterChange('categoria', categoria)}
                color={filters.categoria === categoria ? 'primary' : 'default'}
                variant={filters.categoria === categoria ? 'filled' : 'outlined'}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Abas */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Catálogo" />
          <Tab label="Filtros Avançados" />
          <Tab label="Unidades" />
        </Tabs>
      </Box>

      {/* Painel do Catálogo */}
      <TabPanel value={tabValue} index={0}>
        {/* Controles de Ordenação */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {filteredResults.length} serviços encontrados
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small">
              <InputLabel>Ordenar por</InputLabel>
              <Select
                value={pagination.sort_by}
                label="Ordenar por"
                onChange={(e) =>
                  handleSortChange(e.target.value as MarketplacePagination['sort_by'])
                }
              >
                <MenuItem value="nome_publico">Nome</MenuItem>
                <MenuItem value="preco_publico">Preço</MenuItem>
                <MenuItem value="duracao_min">Duração</MenuItem>
                <MenuItem value="created_at">Mais Recentes</MenuItem>
              </Select>
            </FormControl>

            <Button variant="outlined" startIcon={<FilterList />} onClick={() => setTabValue(1)}>
              Filtros
            </Button>
          </Box>
        </Box>

        {/* Grid de Serviços */}
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={3}>
              {filteredResults.map((servico) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={servico.id}>
                  <ServicoCard servico={servico} />
                </Grid>
              ))}
            </Grid>

            {/* Paginação */}
            {catalogo?.data?.pagination && catalogo.data.pagination.total_pages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={catalogo.data.pagination.total_pages}
                  page={pagination.page}
                  onChange={handlePaginationChange}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </TabPanel>

      {/* Painel de Filtros Avançados */}
      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Categoria</InputLabel>
                  <Select
                    value={filters.categoria || ''}
                    label="Categoria"
                    onChange={(e) => handleFilterChange('categoria', e.target.value || undefined)}
                  >
                    <MenuItem value="">Todas</MenuItem>
                    {categorias.map((categoria) => (
                      <MenuItem key={categoria} value={categoria}>
                        {categoria}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography gutterBottom>Faixa de Preço</Typography>
                <Box sx={{ px: 2 }}>
                  <Slider
                    value={[
                      filters.preco_min || faixaPrecos.min,
                      filters.preco_max || faixaPrecos.max,
                    ]}
                    onChange={(_, newValue) => {
                      const [min, max] = newValue as number[];
                      handleFilterChange('preco_min', min);
                      handleFilterChange('preco_max', max);
                    }}
                    min={faixaPrecos.min}
                    max={faixaPrecos.max}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `R$ ${value.toFixed(2)}`}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography gutterBottom>Duração Máxima (minutos)</Typography>
                <Box sx={{ px: 2 }}>
                  <Slider
                    value={filters.duracao_max || 120}
                    onChange={(_, newValue) => handleFilterChange('duracao_max', newValue)}
                    min={15}
                    max={240}
                    step={15}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value} min`}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Unidade</InputLabel>
                  <Select
                    value={filters.unidade_id || ''}
                    label="Unidade"
                    onChange={(e) => handleFilterChange('unidade_id', e.target.value || undefined)}
                  >
                    <MenuItem value="">Todas</MenuItem>
                    {/* Aqui seriam listadas as unidades disponíveis */}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button variant="contained" onClick={() => setTabValue(0)}>
                Aplicar Filtros
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setFilters({});
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
              >
                Limpar Filtros
              </Button>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Painel de Unidades */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          Unidades Disponíveis
        </Typography>
        <Typography color="text.secondary">
          Lista de todas as unidades que participam do marketplace.
        </Typography>
        {/* Aqui seria implementada a lista de unidades */}
      </TabPanel>
    </Box>
  );
}

// Componente para exibir cada serviço
function ServicoCard({ servico }: { servico: CatalogoPublico }) {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      {servico.imagem_url && (
        <Box
          sx={{
            height: 200,
            backgroundImage: `url(${servico.imagem_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        />
      )}

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 1,
          }}
        >
          <Typography variant="h6" component="h3" sx={{ flexGrow: 1, mr: 1 }}>
            {servico.nome_publico}
          </Typography>
          {servico.destaque && <Star color="warning" />}
        </Box>

        {servico.descricao_publica && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {servico.descricao_publica}
          </Typography>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <AttachMoney fontSize="small" color="primary" />
          <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
            {servico.preco_publico.toFixed(2)}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <AccessTime fontSize="small" sx={{ color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
            {servico.duracao_min} min
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocationOn fontSize="small" sx={{ color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
            {servico.unidade_nome}
          </Typography>
        </Box>

        {servico.categoria_publica && (
          <Chip label={servico.categoria_publica} size="small" variant="outlined" sx={{ mb: 2 }} />
        )}

        {servico.tags && servico.tags.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
            {servico.tags.slice(0, 3).map((tag, index) => (
              <Chip key={index} label={tag} size="small" variant="outlined" />
            ))}
          </Box>
        )}

        <Box sx={{ mt: 'auto' }}>
          <Button
            variant="contained"
            fullWidth
            size="small"
            onClick={() => {
              // Aqui seria implementada a navegação para detalhes do serviço
              console.log('Ver detalhes:', servico.id);
            }}
          >
            Ver Detalhes
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
