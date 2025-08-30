'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  LinearProgress,
  Grid,
} from '@mui/material';
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Delete,
  FolderTree,
  Folder,
  FolderOpen,
  Target,
  DollarSign,
  TrendingUp,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronDown,
  Palette,
  BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getTiposCategoriasReceita,
  deleteTipoCategoriaReceita,
} from '@/actions/tipos-categoria-receita';
import TipoCategoriasReceitaModal from '@/components/tipos/TipoCategoriasReceitaModal';

interface Categoria {
  id: string;
  codigo: string;
  nome: string;
  descricao?: string;
  cor?: string;
  icon?: string;
  categoria_pai_id?: string;
  meta_mensal?: number;
  objetivo_percentual?: number;
  tipo_meta?: 'valor' | 'percentual' | 'quantidade';
  ativo: boolean;
  subcategorias?: Categoria[];
  // Mock data para demonstração
  receita_atual?: number;
  progresso_meta?: number;
}

interface TreeNodeProps {
  categoria: Categoria;
  level: number;
  expanded: boolean;
  onToggleExpand: (id: string) => void;
  onEdit: (categoria: Categoria) => void;
  onDelete: (categoria: Categoria) => void;
  showInactive: boolean;
}

function TreeNode({
  categoria,
  level,
  expanded,
  onToggleExpand,
  onEdit,
  onDelete,
  showInactive,
}: TreeNodeProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const hasSubcategorias = categoria.subcategorias && categoria.subcategorias.length > 0;

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    onEdit(categoria);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete(categoria);
    handleMenuClose();
  };

  if (!showInactive && !categoria.ativo) {
    return null;
  }

  // Mock de dados para demonstração
  const receitaAtual = categoria.receita_atual || Math.random() * 5000;
  const metaMensal = categoria.meta_mensal || 3000;
  const progressoMeta = categoria.progresso_meta || (receitaAtual / metaMensal) * 100;

  const getProgressColor = (progresso: number) => {
    if (progresso >= 100) return 'success';
    if (progresso >= 75) return 'warning';
    return 'error';
  };

  const formatValue = (tipo: string, valor: number) => {
    switch (tipo) {
      case 'valor':
        return `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
      case 'percentual':
        return `${valor.toFixed(1)}%`;
      case 'quantidade':
        return valor.toString();
      default:
        return valor.toString();
    }
  };

  return (
    <Box>
      <Card
        sx={{
          ml: level * 3,
          mb: 1,
          borderLeft: `4px solid ${categoria.cor || '#4caf50'}`,
          opacity: categoria.ativo ? 1 : 0.6,
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: 2,
            transform: 'translateY(-1px)',
          },
        }}
      >
        <CardContent sx={{ py: 2, px: 3, '&:last-child': { pb: 2 } }}>
          <Grid container spacing={2}>
            {/* Coluna Principal */}
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {/* Expand/Collapse Button */}
                <IconButton
                  size="small"
                  onClick={() => onToggleExpand(categoria.id)}
                  sx={{ visibility: hasSubcategorias ? 'visible' : 'hidden' }}
                >
                  {hasSubcategorias ? (
                    expanded ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )
                  ) : null}
                </IconButton>

                {/* Folder Icon */}
                <Box sx={{ display: 'flex', alignItems: 'center', color: categoria.cor }}>
                  {hasSubcategorias ? (
                    expanded ? (
                      <FolderOpen size={20} />
                    ) : (
                      <Folder size={20} />
                    )
                  ) : (
                    <Folder size={20} />
                  )}
                </Box>

                {/* Category Info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="subtitle1" fontWeight="medium" noWrap>
                      {categoria.nome}
                    </Typography>
                    <Chip
                      label={categoria.codigo}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.75rem' }}
                    />
                    {!categoria.ativo && (
                      <Tooltip title="Categoria inativa">
                        <EyeOff size={16} color="#757575" />
                      </Tooltip>
                    )}
                  </Box>

                  {categoria.descricao && (
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {categoria.descricao}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                    {categoria.tipo_meta && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {categoria.tipo_meta === 'valor' && <DollarSign size={14} />}
                        {categoria.tipo_meta === 'percentual' && <TrendingUp size={14} />}
                        {categoria.tipo_meta === 'quantidade' && <Target size={14} />}
                        <Typography variant="caption" color="text.secondary">
                          {categoria.tipo_meta}
                        </Typography>
                      </Box>
                    )}

                    {categoria.cor && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Palette size={14} color="#757575" />
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            backgroundColor: categoria.cor,
                            borderRadius: 1,
                            border: '1px solid #e0e0e0',
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Coluna de Metas */}
            <Grid item xs={12} md={3}>
              {categoria.meta_mensal && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Meta Mensal
                    </Typography>
                    <Typography variant="caption" fontWeight="medium">
                      {formatValue(categoria.tipo_meta || 'valor', categoria.meta_mensal)}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(progressoMeta, 100)}
                    color={getProgressColor(progressoMeta)}
                    sx={{ mb: 0.5 }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      Atual: {formatValue(categoria.tipo_meta || 'valor', receitaAtual)}
                    </Typography>
                    <Typography variant="caption" fontWeight="medium">
                      {progressoMeta.toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
              )}
              {categoria.objetivo_percentual && (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Objetivo
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {categoria.objetivo_percentual}%
                  </Typography>
                </Box>
              )}
            </Grid>

            {/* Actions Menu */}
            <Grid item xs={12} md={1} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <IconButton onClick={handleMenuClick} size="small">
                <MoreHorizontal size={16} />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                onClick={(e) => e.stopPropagation()}
              >
                <MenuItem onClick={handleEdit}>
                  <Edit size={16} style={{ marginRight: 8 }} />
                  Editar
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                  <Delete size={16} style={{ marginRight: 8 }} />
                  Excluir
                </MenuItem>
              </Menu>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Subcategorias */}
      {hasSubcategorias && expanded && (
        <Box>
          {categoria.subcategorias!.map((subcategoria) => (
            <TreeNode
              key={subcategoria.id}
              categoria={subcategoria}
              level={level + 1}
              expanded={expanded}
              onToggleExpand={onToggleExpand}
              onEdit={onEdit}
              onDelete={onDelete}
              showInactive={showInactive}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

export default function TiposCategoriasReceitaPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | undefined>();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [showInactive, setShowInactive] = useState(false);

  const loadCategorias = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getTiposCategoriasReceita();
      if (result.success) {
        setCategorias(buildCategoryTree(result.data || []));
      } else {
        setError(result.error || 'Erro ao carregar categorias');
      }
    } catch (error) {
      setError('Erro interno do sistema');
      console.error('Erro ao carregar categorias:', error);
    }

    setLoading(false);
  }, []);

  const buildCategoryTree = (flatCategorias: Categoria[]): Categoria[] => {
    const categoriaMap = new Map<string, Categoria>();
    const roots: Categoria[] = [];

    // First pass: create map with subcategorias arrays
    flatCategorias.forEach((categoria) => {
      categoriaMap.set(categoria.id, { ...categoria, subcategorias: [] });
    });

    // Second pass: build tree structure
    flatCategorias.forEach((categoria) => {
      const categoriaWithChildren = categoriaMap.get(categoria.id)!;

      if (categoria.categoria_pai_id) {
        const parent = categoriaMap.get(categoria.categoria_pai_id);
        if (parent) {
          parent.subcategorias!.push(categoriaWithChildren);
        } else {
          roots.push(categoriaWithChildren);
        }
      } else {
        roots.push(categoriaWithChildren);
      }
    });

    // Sort categories by name
    const sortCategories = (cats: Categoria[]) => {
      cats.sort((a, b) => a.nome.localeCompare(b.nome));
      cats.forEach((cat) => {
        if (cat.subcategorias) {
          sortCategories(cat.subcategorias);
        }
      });
    };

    sortCategories(roots);
    return roots;
  };

  const filterCategorias = (categorias: Categoria[], term: string): Categoria[] => {
    if (!term) return categorias;

    const filtered: Categoria[] = [];

    categorias.forEach((categoria) => {
      const matchesTerm =
        categoria.nome.toLowerCase().includes(term.toLowerCase()) ||
        categoria.codigo.toLowerCase().includes(term.toLowerCase()) ||
        categoria.descricao?.toLowerCase().includes(term.toLowerCase());

      const filteredSubcategorias = categoria.subcategorias
        ? filterCategorias(categoria.subcategorias, term)
        : [];

      if (matchesTerm || filteredSubcategorias.length > 0) {
        filtered.push({
          ...categoria,
          subcategorias: filteredSubcategorias,
        });
      }
    });

    return filtered;
  };

  const handleToggleExpand = (id: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleEdit = (categoria: Categoria) => {
    setEditingCategoria(categoria);
    setModalOpen(true);
  };

  const handleDelete = async (categoria: Categoria) => {
    if (!confirm(`Tem certeza que deseja excluir a categoria "${categoria.nome}"?`)) {
      return;
    }

    try {
      const result = await deleteTipoCategoriaReceita(categoria.id);

      if (result.success) {
        toast.success('Categoria excluída com sucesso!');
        loadCategorias();
      } else {
        toast.error(result.error || 'Erro ao excluir categoria');
      }
    } catch (error) {
      toast.error('Erro interno do sistema');
      console.error('Erro ao excluir categoria:', error);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingCategoria(undefined);
  };

  const handleModalSuccess = () => {
    toast.success(
      editingCategoria ? 'Categoria atualizada com sucesso!' : 'Categoria criada com sucesso!',
    );
    loadCategorias();
  };

  useEffect(() => {
    loadCategorias();
  }, [loadCategorias]);

  const filteredCategorias = filterCategorias(categorias, searchTerm);

  // Calcular estatísticas gerais (mock)
  const totalCategorias = categorias.length;
  const categoriasAtivas = categorias.filter((cat) => cat.ativo).length;
  const metaTotal = categorias.reduce((acc, cat) => acc + (cat.meta_mensal || 0), 0);
  const receitaTotal = categorias.reduce((acc, cat) => acc + (cat.receita_atual || 0), 0);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <FolderTree size={24} />
          <Typography variant="h4" component="h1">
            Categorias de Receitas
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Gerencie categorias de receitas com metas mensais e acompanhamento de performance.
          Configure objetivos por categoria para melhor controle financeiro.
        </Typography>

        {/* Estatísticas Rápidas */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h6" color="primary">
                  {totalCategorias}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Categorias
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h6" color="success.main">
                  {categoriasAtivas}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Categorias Ativas
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h6" color="info.main">
                  R$ {metaTotal.toLocaleString('pt-BR')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Meta Total
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h6" color="warning.main">
                  R$ {receitaTotal.toLocaleString('pt-BR')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Receita Atual
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Controls */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Buscar categorias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} />
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="outlined"
            startIcon={showInactive ? <Eye size={16} /> : <EyeOff size={16} />}
            onClick={() => setShowInactive(!showInactive)}
            size="small"
          >
            {showInactive ? 'Ocultar Inativas' : 'Mostrar Inativas'}
          </Button>

          <Button variant="outlined" startIcon={<BarChart3 size={16} />} size="small" disabled>
            Relatório Distribuição
          </Button>

          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={() => setModalOpen(true)}
          >
            Nova Categoria
          </Button>
        </Box>
      </Box>

      {/* Content */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredCategorias.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <FolderTree size={48} color="#ccc" />
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              {searchTerm ? 'Nenhuma categoria encontrada' : 'Nenhuma categoria cadastrada'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm
                ? 'Tente ajustar os termos de busca'
                : 'Clique em "Nova Categoria" para começar'}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box>
          {filteredCategorias.map((categoria) => (
            <TreeNode
              key={categoria.id}
              categoria={categoria}
              level={0}
              expanded={expandedNodes.has(categoria.id)}
              onToggleExpand={handleToggleExpand}
              onEdit={handleEdit}
              onDelete={handleDelete}
              showInactive={showInactive}
            />
          ))}
        </Box>
      )}

      {/* Modal */}
      <TipoCategoriasReceitaModal
        open={modalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        categoria={editingCategoria}
      />
    </Box>
  );
}
