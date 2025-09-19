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
  Building,
  DollarSign,
  AlertTriangle,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronDown,
  Palette,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getTiposCategoriasDespesa,
  deleteTipoCategoriasDespesa,
} from '@/actions/tipos-categoria-despesa-simple';
import TipoCategoriasDespesaModal from '@/components/tipos/TipoCategoriasDespesaModal';

interface Categoria {
  id: string;
  codigo: string;
  nome: string;
  descricao?: string;
  cor?: string;
  icon?: string;
  categoria_pai_id?: string;
  obrigatoria?: boolean;
  centro_custo?: string;
  limite_mensal?: number;
  ativo: boolean;
  subcategorias?: Categoria[];
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

  return (
    <Box>
      <Card
        sx={{
          ml: level * 3,
          mb: 1,
          borderLeft: `4px solid ${categoria.cor || '#1976d2'}`,
          opacity: categoria.ativo ? 1 : 0.6,
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: 2,
            transform: 'translateY(-1px)',
          },
        }}
      >
        <CardContent sx={{ py: 2, px: 3, '&:last-child': { pb: 2 } }}>
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
                {categoria.obrigatoria && (
                  <Tooltip title="Categoria obrigatória">
                    <AlertTriangle size={16} color="#ff9800" />
                  </Tooltip>
                )}
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
                {categoria.centro_custo && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Building size={14} color="#757575" />
                    <Typography variant="caption" color="text.secondary">
                      {categoria.centro_custo}
                    </Typography>
                  </Box>
                )}

                {categoria.limite_mensal && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <DollarSign size={14} color="#757575" />
                    <Typography variant="caption" color="text.secondary">
                      R${' '}
                      {categoria.limite_mensal.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
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
                    <Typography variant="caption" color="text.secondary">
                      {categoria.cor}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Actions Menu */}
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
          </Box>
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

export default function TiposCategoriasDespesaPage() {
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
      const result = await getTiposCategoriasDespesa();
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
      const result = await deleteTipoCategoriasDespesa(categoria.id);

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

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <FolderTree size={24} />
          <Typography variant="h4" component="h1">
            Categorias de Despesas
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Gerencie as categorias de despesas em estrutura hierárquica com configurações de centro de
          custo e limites mensais.
        </Typography>

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
      <TipoCategoriasDespesaModal
        open={modalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        categoria={editingCategoria}
      />
    </Box>
  );
}
