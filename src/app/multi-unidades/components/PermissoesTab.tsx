'use client';

import { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Security,
  Person,
  Business,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import {
  usePermissoesHierarquicas,
  useAcessosMultiUnidade,
  useCreatePermissaoHierarquica,
  useUpdatePermissaoHierarquica,
  useCreateAcessoMultiUnidade,
  useUpdateAcessoMultiUnidade,
} from '@/hooks/use-multi-unidades';
import {
  PermissaoHierarquica,
  AcessoMultiUnidade,
  UserRole,
  AcessoMultiUnidadeDetalhado,
  PaginatedResponse,
} from '@/types/multi-unidades';

export default function PermissoesTab() {
  const [openPermissaoDialog, setOpenPermissaoDialog] = useState(false);
  const [openAcessoDialog, setOpenAcessoDialog] = useState(false);
  const [editingPermissao, setEditingPermissao] = useState<PermissaoHierarquica | null>(null);
  const [editingAcesso, setEditingAcesso] = useState<AcessoMultiUnidadeDetalhado | null>(null);

  // Hooks para buscar dados
  const { data: permissoes, isLoading: permissoesLoading } = usePermissoesHierarquicas();
  const { data: acessosData, isLoading: acessosLoading } = useAcessosMultiUnidade();
  const acessos = acessosData?.data as AcessoMultiUnidadeDetalhado[];

  // Hooks para mutações
  const createPermissao = useCreatePermissaoHierarquica();
  const updatePermissao = useUpdatePermissaoHierarquica();
  const createAcesso = useCreateAcessoMultiUnidade();
  const updateAcesso = useUpdateAcessoMultiUnidade();

  const handleOpenPermissaoDialog = (permissao?: PermissaoHierarquica) => {
    if (permissao) {
      setEditingPermissao(permissao);
    } else {
      setEditingPermissao(null);
    }
    setOpenPermissaoDialog(true);
  };

  const handleClosePermissaoDialog = () => {
    setOpenPermissaoDialog(false);
    setEditingPermissao(null);
  };

  const handleOpenAcessoDialog = (acesso?: AcessoMultiUnidadeDetalhado) => {
    if (acesso) {
      setEditingAcesso(acesso);
    } else {
      setEditingAcesso(null);
    }
    setOpenAcessoDialog(true);
  };

  const handleCloseAcessoDialog = () => {
    setOpenAcessoDialog(false);
    setEditingAcesso(null);
  };

  const handleSavePermissao = (data: any) => {
    if (editingPermissao) {
      updatePermissao.mutate({ id: editingPermissao.id, data });
    } else {
      createPermissao.mutate(data);
    }
    handleClosePermissaoDialog();
  };

  const handleSaveAcesso = (data: any) => {
    if (editingAcesso) {
      updateAcesso.mutate({ id: editingAcesso.id, data });
    } else {
      createAcesso.mutate(data);
    }
    handleCloseAcessoDialog();
  };

  return (
    <Box>
      {/* Permissões Hierárquicas */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="h6">Permissões Hierárquicas</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenPermissaoDialog()}
            >
              Nova Permissão
            </Button>
          </Box>

          {permissoesLoading ? (
            <Typography>Carregando permissões...</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Papel</TableCell>
                    <TableCell>Nível</TableCell>
                    <TableCell>Descrição</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {permissoes?.data?.map((permissao) => (
                    <TableRow key={permissao.id}>
                      <TableCell>
                        <Chip
                          label={permissao.papel}
                          color={permissao.papel === 'owner' ? 'error' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{permissao.nivel_hierarquico}</TableCell>
                      <TableCell>{permissao.descricao}</TableCell>
                      <TableCell>
                        <Chip
                          label={permissao.ativo ? 'Ativo' : 'Inativo'}
                          color={permissao.ativo ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenPermissaoDialog(permissao)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Acessos Multi-unidade */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="h6">Acessos Multi-unidade</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenAcessoDialog()}
            >
              Novo Acesso
            </Button>
          </Box>

          {acessosLoading ? (
            <Typography>Carregando acessos...</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Usuário</TableCell>
                    <TableCell>Unidade</TableCell>
                    <TableCell>Papel na Unidade</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {acessos?.map((acesso) => (
                    <TableRow key={acesso.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">{acesso.profile?.nome}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {acesso.profile?.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">{acesso.unidade?.nome}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {acesso.unidade?.endereco}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={acesso.papel_unidade}
                          size="small"
                          color={acesso.papel_unidade === 'admin' ? 'error' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={acesso.ativo ? 'Ativo' : 'Inativo'}
                          color={acesso.ativo ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => handleOpenAcessoDialog(acesso)}>
                            <Edit />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Matriz de Permissões */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Matriz de Permissões
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Visão geral das permissões por papel hierárquico
          </Typography>

          <Grid container spacing={2}>
            {['owner', 'admin', 'gerente', 'profissional', 'operador', 'recepcao'].map((papel) => (
              <Grid item xs={12} md={6} lg={4} key={papel}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      {papel.charAt(0).toUpperCase() + papel.slice(1)}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <FormControlLabel
                        control={<Switch defaultChecked={papel === 'owner'} disabled />}
                        label="Acesso Total"
                      />
                      <FormControlLabel
                        control={
                          <Switch defaultChecked={['owner', 'admin'].includes(papel)} disabled />
                        }
                        label="Gestão de Usuários"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            defaultChecked={['owner', 'admin', 'gerente'].includes(papel)}
                            disabled
                          />
                        }
                        label="Relatórios Consolidados"
                      />
                      <FormControlLabel
                        control={
                          <Switch defaultChecked={['owner', 'admin'].includes(papel)} disabled />
                        }
                        label="Configurações"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Dialog para Permissão */}
      <Dialog
        open={openPermissaoDialog}
        onClose={handleClosePermissaoDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editingPermissao ? 'Editar Permissão' : 'Nova Permissão'}</DialogTitle>
        <DialogContent>
          <PermissaoForm
            permissao={editingPermissao}
            onSave={handleSavePermissao}
            onCancel={handleClosePermissaoDialog}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog para Acesso */}
      <Dialog open={openAcessoDialog} onClose={handleCloseAcessoDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingAcesso ? 'Editar Acesso' : 'Novo Acesso'}</DialogTitle>
        <DialogContent>
          <AcessoForm
            acesso={editingAcesso}
            onSave={handleSaveAcesso}
            onCancel={handleCloseAcessoDialog}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}

// Formulário para Permissão
function PermissaoForm({
  permissao,
  onSave,
  onCancel,
}: {
  permissao: PermissaoHierarquica | null;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    papel: permissao?.papel || 'admin',
    nivel_hierarquico: permissao?.nivel_hierarquico || 1,
    descricao: permissao?.descricao || '',
    ativo: permissao?.ativo ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Papel</InputLabel>
            <Select
              value={formData.papel}
              label="Papel"
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  papel: e.target.value as UserRole,
                }))
              }
            >
              <MenuItem value="owner">Owner</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="gerente">Gerente</MenuItem>
              <MenuItem value="profissional">Profissional</MenuItem>
              <MenuItem value="operador">Operador</MenuItem>
              <MenuItem value="recepcao">Recepção</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Nível Hierárquico"
            type="number"
            value={formData.nivel_hierarquico}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                nivel_hierarquico: parseInt(e.target.value),
              }))
            }
            inputProps={{ min: 1, max: 10 }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Descrição"
            multiline
            rows={3}
            value={formData.descricao}
            onChange={(e) => setFormData((prev) => ({ ...prev, descricao: e.target.value }))}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.ativo}
                onChange={(e) => setFormData((prev) => ({ ...prev, ativo: e.target.checked }))}
              />
            }
            label="Ativo"
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button onClick={onCancel}>Cancelar</Button>
        <Button type="submit" variant="contained">
          Salvar
        </Button>
      </Box>
    </Box>
  );
}

// Formulário para Acesso
function AcessoForm({
  acesso,
  onSave,
  onCancel,
}: {
  acesso: AcessoMultiUnidadeDetalhado | null;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    profile_id: acesso?.profile_id || '',
    unidade_id: acesso?.unidade_id || '',
    papel_unidade: acesso?.papel_unidade || 'profissional',
    ativo: acesso?.ativo ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="ID do Profile"
            value={formData.profile_id}
            onChange={(e) => setFormData((prev) => ({ ...prev, profile_id: e.target.value }))}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="ID da Unidade"
            value={formData.unidade_id}
            onChange={(e) => setFormData((prev) => ({ ...prev, unidade_id: e.target.value }))}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Papel na Unidade</InputLabel>
            <Select
              value={formData.papel_unidade}
              label="Papel na Unidade"
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  papel_unidade: e.target.value as UserRole,
                }))
              }
            >
              <MenuItem value="owner">Owner</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="gerente">Gerente</MenuItem>
              <MenuItem value="profissional">Profissional</MenuItem>
              <MenuItem value="operador">Operador</MenuItem>
              <MenuItem value="recepcao">Recepção</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.ativo}
                onChange={(e) => setFormData((prev) => ({ ...prev, ativo: e.target.checked }))}
              />
            }
            label="Ativo"
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button onClick={onCancel}>Cancelar</Button>
        <Button type="submit" variant="contained">
          Salvar
        </Button>
      </Box>
    </Box>
  );
}
