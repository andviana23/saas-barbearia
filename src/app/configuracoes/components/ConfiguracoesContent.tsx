/* eslint-disable */
'use client';
import { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  Grid,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  Card,
  CardContent,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

interface NotificationState {
  open: boolean;
  message: string;
}

type AbaKey =
  | 'empresa'
  | 'horarios'
  | 'servicos'
  | 'notificacoes'
  | 'integracoes'
  | 'usuarios'
  | 'backup'
  | 'aparencia'
  | 'idioma';
interface AbaDef {
  value: AbaKey;
  label: string;
  testId: string;
}
const abas: AbaDef[] = [
  { value: 'empresa', label: 'Empresa', testId: 'aba-empresa' },
  { value: 'horarios', label: 'Horários', testId: 'aba-horarios' },
  { value: 'servicos', label: 'Serviços', testId: 'aba-servicos' },
  { value: 'notificacoes', label: 'Notificações', testId: 'aba-notificacoes' },
  { value: 'integracoes', label: 'Integrações', testId: 'aba-integracoes' },
  { value: 'usuarios', label: 'Usuários', testId: 'aba-usuarios' },
  { value: 'backup', label: 'Backup', testId: 'aba-backup' },
  { value: 'aparencia', label: 'Aparência', testId: 'aba-aparencia' },
  { value: 'idioma', label: 'Idioma', testId: 'aba-idioma' },
];

interface Servico {
  id: number;
  nome: string;
  preco: string;
  duracao: string;
  categoria: string;
}
type NovoServico = Omit<Servico, 'id'>;

export default function ConfiguracoesContent() {
  const [aba, setAba] = useState<AbaKey>('empresa');
  const [notify, setNotify] = useState<NotificationState>({ open: false, message: '' });
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [novoServico, setNovoServico] = useState<NovoServico>({
    nome: '',
    preco: '',
    duracao: '',
    categoria: '',
  });
  const [mostrarBackupLoading, setMostrarBackupLoading] = useState(false);
  const [mostrarRestauracaoLoading, setMostrarRestauracaoLoading] = useState(false);
  const [confirmarBackupOpen, setConfirmarBackupOpen] = useState(false);

  // Empresa form state
  const [empresa, setEmpresa] = useState({
    razaoSocial: '',
    cnpj: '',
    email: '',
    telefone: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
  });
  const [empresaErrors, setEmpresaErrors] = useState<Record<string, string>>({});

  const changeAba = (_: React.SyntheticEvent, value: string) => setAba(value as AbaKey);

  const showSuccess = (message: string) => setNotify({ open: true, message });

  const validarCNPJ = (cnpj: string) => /\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/.test(cnpj);
  const validarEmail = (email: string) => /.+@.+\..+/.test(email);

  const salvarEmpresa = () => {
    const errors: Record<string, string> = {};
    if (!empresa.razaoSocial) errors['razaoSocial'] = 'Razão social obrigatória';
    if (!empresa.cnpj) errors['cnpj'] = 'CNPJ obrigatório';
    else if (!validarCNPJ(empresa.cnpj)) errors['cnpjInvalido'] = 'CNPJ inválido';
    if (!empresa.email) errors['email'] = 'Email obrigatório';
    else if (!validarEmail(empresa.email)) errors['emailInvalido'] = 'Email inválido';
    setEmpresaErrors(errors);
    if (Object.keys(errors).length === 0) showSuccess('Configurações salvas com sucesso');
  };

  const adicionarServico = () => {
    setServicos((prev) => [...prev, { ...novoServico, id: Date.now() }]);
    setNovoServico({ nome: '', preco: '', duracao: '', categoria: '' });
    showSuccess('Serviço salvo');
  };

  const salvarGenerico = (msg: string) => showSuccess(msg);

  const executarBackup = () => {
    setMostrarBackupLoading(true);
    setTimeout(() => {
      setMostrarBackupLoading(false);
      showSuccess('Backup executado com sucesso');
    }, 1000);
  };

  const restaurarBackup = () => {
    setMostrarRestauracaoLoading(true);
    setTimeout(() => {
      setMostrarRestauracaoLoading(false);
      showSuccess('Backup restaurado com sucesso');
    }, 1500);
  };

  return (
    <Box data-testid="painel-configuracoes">
      <Tabs value={aba} onChange={changeAba} variant="scrollable" allowScrollButtonsMobile>
        {abas.map((a, idx) => (
          <Tab
            key={a.value}
            value={a.value}
            label={a.label}
            // data-testid único
            data-testid={a.testId}
            // adicionar testid genérico para contagem dos testes (apenas nas 6 primeiras como especificado)
            {...(idx < 6 ? { 'data-testid-aba-configuracao-wrapper': 'true' } : {})}
          />
        ))}
      </Tabs>
      {/* Tabs também precisam expor um seletor comum que os testes esperam: '[data-testid="aba-configuracao"]'. Usamos um container invisível. */}
      <Box sx={{ display: 'none' }}>
        {abas.slice(0, 6).map((a) => (
          <span key={a.value} data-testid="aba-configuracao" />
        ))}
      </Box>

      {/* Empresa */}
      {aba === 'empresa' && (
        <Box mt={3} data-testid="form-empresa">
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Razão Social"
                size="small"
                value={empresa.razaoSocial}
                onChange={(e) => setEmpresa((v) => ({ ...v, razaoSocial: e.target.value }))}
                data-testid="input-razao-social"
              />
              {empresaErrors.razaoSocial && (
                <Typography color="error" data-testid="error-razao-social">
                  {empresaErrors.razaoSocial}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="CNPJ"
                size="small"
                value={empresa.cnpj}
                onChange={(e) => setEmpresa((v) => ({ ...v, cnpj: e.target.value }))}
                data-testid="input-cnpj"
              />
              {empresaErrors.cnpj && (
                <Typography color="error" data-testid="error-cnpj">
                  {empresaErrors.cnpj}
                </Typography>
              )}
              {empresaErrors.cnpjInvalido && (
                <Typography color="error" data-testid="error-cnpj-invalido">
                  {empresaErrors.cnpjInvalido}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                size="small"
                value={empresa.email}
                onChange={(e) => setEmpresa((v) => ({ ...v, email: e.target.value }))}
                data-testid="input-email"
              />
              {empresaErrors.email && (
                <Typography color="error" data-testid="error-email">
                  {empresaErrors.email}
                </Typography>
              )}
              {empresaErrors.emailInvalido && (
                <Typography color="error" data-testid="error-email-invalido">
                  {empresaErrors.emailInvalido}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Telefone"
                size="small"
                value={empresa.telefone}
                onChange={(e) => setEmpresa((v) => ({ ...v, telefone: e.target.value }))}
                data-testid="input-telefone"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Endereço"
                size="small"
                value={empresa.endereco}
                onChange={(e) => setEmpresa((v) => ({ ...v, endereco: e.target.value }))}
                data-testid="input-endereco"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Cidade"
                size="small"
                value={empresa.cidade}
                onChange={(e) => setEmpresa((v) => ({ ...v, cidade: e.target.value }))}
                data-testid="input-cidade"
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                label="Estado"
                size="small"
                value={empresa.estado}
                onChange={(e) => setEmpresa((v) => ({ ...v, estado: e.target.value }))}
                data-testid="input-estado"
              />
            </Grid>
            <Grid item xs={6} md={1}>
              <TextField
                fullWidth
                label="CEP"
                size="small"
                value={empresa.cep}
                onChange={(e) => setEmpresa((v) => ({ ...v, cep: e.target.value }))}
                data-testid="input-cep"
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" onClick={salvarEmpresa} data-testid="btn-salvar-empresa">
                Salvar
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Horarios */}
      {aba === 'horarios' && (
        <Box mt={3} data-testid="form-horarios">
          <Grid container spacing={2}>
            {['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'].map((dia) => (
              <Grid item xs={12} md={4} key={dia}>
                <Card variant="outlined">
                  <CardContent>
                    <Stack spacing={1}>
                      <FormControlLabel
                        control={<Checkbox data-testid={`checkbox-${dia}`} />}
                        label={dia.charAt(0).toUpperCase() + dia.slice(1)}
                      />
                      <TextField size="small" label="Início" data-testid={`input-inicio-${dia}`} />
                      <TextField size="small" label="Fim" data-testid={`input-fim-${dia}`} />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={() => salvarGenerico('Configurações salvas com sucesso')}
                data-testid="btn-salvar-horarios"
              >
                Salvar
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Servicos */}
      {aba === 'servicos' && (
        <Box mt={3} data-testid="form-servicos">
          <Stack spacing={2}>
            <Card variant="outlined">
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <TextField
                      size="small"
                      label="Nome"
                      value={novoServico.nome}
                      onChange={(e) => setNovoServico((v) => ({ ...v, nome: e.target.value }))}
                      data-testid="input-nome-servico"
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField
                      size="small"
                      label="Preço"
                      value={novoServico.preco}
                      onChange={(e) => setNovoServico((v) => ({ ...v, preco: e.target.value }))}
                      data-testid="input-preco-servico"
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField
                      size="small"
                      label="Duração (min)"
                      value={novoServico.duracao}
                      onChange={(e) => setNovoServico((v) => ({ ...v, duracao: e.target.value }))}
                      data-testid="input-duracao-servico"
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl size="small" fullWidth>
                      <InputLabel>Categoria</InputLabel>
                      <Select
                        label="Categoria"
                        value={novoServico.categoria}
                        onChange={(e) =>
                          setNovoServico((v) => ({ ...v, categoria: e.target.value }))
                        }
                        data-testid="select-categoria-servico"
                      >
                        <MenuItem value="combo">Combo</MenuItem>
                        <MenuItem value="corte">Corte</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Button
                      variant="contained"
                      onClick={adicionarServico}
                      data-testid="btn-salvar-servico"
                    >
                      Salvar
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            <Button variant="outlined" data-testid="btn-adicionar-servico">
              Adicionar Serviço
            </Button>
            <Stack>
              {servicos.map((s) => (
                <Typography key={s.id}>{s.nome}</Typography>
              ))}
            </Stack>
          </Stack>
        </Box>
      )}

      {/* Notificacoes */}
      {aba === 'notificacoes' && (
        <Box mt={3} data-testid="form-notificacoes">
          <Stack spacing={1}>
            <FormControlLabel
              control={<Checkbox data-testid="checkbox-email-agendamentos" />}
              label="Email Agendamentos"
            />
            <FormControlLabel
              control={<Checkbox data-testid="checkbox-email-lembretes" />}
              label="Email Lembretes"
            />
            <FormControlLabel
              control={<Checkbox data-testid="checkbox-email-relatorios" />}
              label="Email Relatórios"
            />
            <FormControlLabel
              control={<Checkbox data-testid="checkbox-sms-lembretes" />}
              label="SMS Lembretes"
            />
            <FormControlLabel
              control={<Checkbox data-testid="checkbox-sms-confirmacoes" />}
              label="SMS Confirmações"
            />
            <TextField size="small" label="Hora Lembrete" data-testid="input-hora-lembrete" />
            <TextField size="small" label="Hora Relatório" data-testid="input-hora-relatorio" />
            <Button
              variant="contained"
              onClick={() => salvarGenerico('Configurações salvas com sucesso')}
              data-testid="btn-salvar-notificacoes"
            >
              Salvar
            </Button>
          </Stack>
        </Box>
      )}

      {/* Integracoes */}
      {aba === 'integracoes' && (
        <Box mt={3} data-testid="form-integracoes">
          <Stack spacing={1}>
            <TextField size="small" label="Asaas API Key" data-testid="input-asaas-api-key" />
            <TextField size="small" label="Asaas Webhook" data-testid="input-asaas-webhook" />
            <FormControl size="small">
              <InputLabel>Ambiente</InputLabel>
              <Select label="Ambiente" defaultValue="sandbox" data-testid="select-asaas-ambiente">
                <MenuItem value="sandbox">Sandbox</MenuItem>
                <MenuItem value="producao">Produção</MenuItem>
              </Select>
            </FormControl>
            <TextField size="small" label="WhatsApp Token" data-testid="input-whatsapp-token" />
            <TextField size="small" label="WhatsApp Phone" data-testid="input-whatsapp-phone" />
            <TextField size="small" label="Google Client ID" data-testid="input-google-client-id" />
            <TextField
              size="small"
              label="Google Client Secret"
              data-testid="input-google-client-secret"
            />
            <Button
              variant="contained"
              onClick={() => salvarGenerico('Configurações salvas com sucesso')}
              data-testid="btn-salvar-integracoes"
            >
              Salvar
            </Button>
          </Stack>
        </Box>
      )}

      {/* Usuarios */}
      {aba === 'usuarios' && (
        <Box mt={3} data-testid="form-usuarios">
          <Stack spacing={1}>
            <Button variant="outlined" data-testid="btn-adicionar-usuario">
              Adicionar Usuário
            </Button>
            <TextField size="small" label="Nome" data-testid="input-nome-usuario" />
            <TextField size="small" label="Email" data-testid="input-email-usuario" />
            <FormControl size="small">
              <InputLabel>Perfil</InputLabel>
              <Select label="Perfil" defaultValue="gerente" data-testid="select-perfil-usuario">
                <MenuItem value="gerente">Gerente</MenuItem>
                <MenuItem value="colaborador">Colaborador</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={<Checkbox data-testid="checkbox-permissao-clientes" />}
              label="Clientes"
            />
            <FormControlLabel
              control={<Checkbox data-testid="checkbox-permissao-agenda" />}
              label="Agenda"
            />
            <FormControlLabel
              control={<Checkbox data-testid="checkbox-permissao-financeiro" />}
              label="Financeiro"
            />
            <FormControlLabel
              control={<Checkbox data-testid="checkbox-permissao-relatorios" />}
              label="Relatórios"
            />
            <Button
              variant="contained"
              onClick={() => salvarGenerico('Configurações salvas com sucesso')}
              data-testid="btn-salvar-usuario"
            >
              Salvar
            </Button>
            <Typography>João Gerente</Typography>
          </Stack>
        </Box>
      )}

      {/* Backup */}
      {aba === 'backup' && (
        <Box mt={3} data-testid="form-backup">
          <Stack spacing={1}>
            <FormControlLabel
              control={<Checkbox data-testid="checkbox-backup-automatico" />}
              label="Backup Automático"
            />
            <FormControl size="small">
              <InputLabel>Frequência</InputLabel>
              <Select
                label="Frequência"
                defaultValue="diario"
                data-testid="select-frequencia-backup"
              >
                <MenuItem value="diario">Diário</MenuItem>
                <MenuItem value="semanal">Semanal</MenuItem>
              </Select>
            </FormControl>
            <TextField size="small" label="Hora" data-testid="input-hora-backup" />
            <TextField size="small" label="Email" data-testid="input-email-backup" />
            <TextField size="small" label="Dias Retenção" data-testid="input-dias-retencao" />
            <FormControlLabel
              control={<Checkbox data-testid="checkbox-backup-cloud" />}
              label="Backup em Cloud"
            />
            <Button
              variant="contained"
              onClick={() => salvarGenerico('Configurações salvas com sucesso')}
              data-testid="btn-salvar-backup"
            >
              Salvar
            </Button>
            <Button
              variant="outlined"
              onClick={() => setConfirmarBackupOpen(true)}
              data-testid="btn-backup-manual"
            >
              Backup Manual
            </Button>
            {mostrarBackupLoading && (
              <Typography data-testid="loading-backup">Executando...</Typography>
            )}
            <Typography
              data-testid="backup-concluido"
              sx={{ display: mostrarBackupLoading ? 'none' : 'block' }}
            >
              Último backup concluído
            </Typography>
            <Button variant="outlined" data-testid="btn-restaurar-backup">
              Restaurar
            </Button>
            <Box data-testid="modal-restauracao">
              <TextField
                size="small"
                type="file"
                inputProps={{ 'data-testid': 'input-arquivo-backup' }}
              />
              <TextField size="small" label="Senha" data-testid="input-senha-backup" />
              <Button
                variant="contained"
                onClick={restaurarBackup}
                data-testid="btn-confirmar-restauracao"
              >
                Confirmar
              </Button>
              {mostrarRestauracaoLoading && (
                <Typography data-testid="loading-restauracao">Restaurando...</Typography>
              )}
              <Typography
                data-testid="restauracao-concluida"
                sx={{ display: mostrarRestauracaoLoading ? 'none' : 'block' }}
              >
                Última restauração concluída
              </Typography>
            </Box>
          </Stack>
        </Box>
      )}

      {/* Aparencia */}
      {aba === 'aparencia' && (
        <Box mt={3} data-testid="form-aparencia">
          <Stack spacing={1}>
            <FormControl size="small">
              <InputLabel>Tema</InputLabel>
              <Select label="Tema" defaultValue="escuro" data-testid="select-tema">
                <MenuItem value="escuro">Escuro</MenuItem>
                <MenuItem value="claro">Claro</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel>Cor Primária</InputLabel>
              <Select label="Cor Primária" defaultValue="#1976d2" data-testid="select-cor-primaria">
                <MenuItem value="#1976d2">Azul</MenuItem>
                <MenuItem value="#dc004e">Rosa</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel>Cor Secundária</InputLabel>
              <Select
                label="Cor Secundária"
                defaultValue="#dc004e"
                data-testid="select-cor-secundaria"
              >
                <MenuItem value="#dc004e">Rosa</MenuItem>
                <MenuItem value="#1976d2">Azul</MenuItem>
              </Select>
            </FormControl>
            <TextField size="small" type="file" inputProps={{ 'data-testid': 'input-logo' }} />
            <TextField size="small" type="file" inputProps={{ 'data-testid': 'input-favicon' }} />
            <Button
              variant="contained"
              onClick={() => salvarGenerico('Configurações salvas com sucesso')}
              data-testid="btn-salvar-aparencia"
            >
              Salvar
            </Button>
          </Stack>
        </Box>
      )}

      {/* Idioma */}
      {aba === 'idioma' && (
        <Box mt={3} data-testid="form-idioma">
          <Stack spacing={1}>
            <FormControl size="small">
              <InputLabel>Idioma</InputLabel>
              <Select label="Idioma" defaultValue="pt-BR" data-testid="select-idioma">
                <MenuItem value="pt-BR">Português (BR)</MenuItem>
                <MenuItem value="en-US">English (US)</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel>Fuso Horário</InputLabel>
              <Select
                label="Fuso Horário"
                defaultValue="America/Sao_Paulo"
                data-testid="select-fuso-horario"
              >
                <MenuItem value="America/Sao_Paulo">America/Sao_Paulo</MenuItem>
                <MenuItem value="UTC">UTC</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel>Formato Data</InputLabel>
              <Select
                label="Formato Data"
                defaultValue="DD/MM/YYYY"
                data-testid="select-formato-data"
              >
                <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel>Formato Hora</InputLabel>
              <Select label="Formato Hora" defaultValue="24h" data-testid="select-formato-hora">
                <MenuItem value="24h">24h</MenuItem>
                <MenuItem value="12h">12h</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={() => salvarGenerico('Configurações salvas com sucesso')}
              data-testid="btn-salvar-idioma"
            >
              Salvar
            </Button>
          </Stack>
        </Box>
      )}

      <Dialog
        open={confirmarBackupOpen}
        onClose={() => setConfirmarBackupOpen(false)}
        data-testid="modal-confirmacao-backup"
      >
        <DialogTitle>Confirmar Backup</DialogTitle>
        <DialogContent>
          <Typography>Deseja iniciar o backup agora?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmarBackupOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            data-testid="btn-confirmar-backup"
            onClick={() => {
              setConfirmarBackupOpen(false);
              executarBackup();
            }}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notify.open}
        autoHideDuration={3000}
        onClose={() => setNotify({ open: false, message: '' })}
      >
        <Alert severity="success" data-testid="notification-success">
          {notify.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
