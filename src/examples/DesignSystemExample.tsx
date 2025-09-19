import React, { useState } from 'react';
import {
  // Layout
  DSContainer,
  DSStack,
  DSGrid,

  // Navegação
  DSPageBreadcrumbs,

  // Formulários
  DSTextField,
  DSSelect,
  DSTextArea,
  DSCheckbox,
  DSRadioGroup,
  DSAutocomplete,
  DSSwitch,
  DSButton,

  // Tipografia
  DSHeading,
  DSDisplay,
  DSLabel,
  DSHelper,
  DSError,

  // Ícones
  DSIcon,
  DSStatusIcon,
  DSActionIcon,

  // Loading
  DSLoading,
  DSSkeleton,

  // Estados vazios
  DSEmptySearch,

  // Tema
  DSThemeToggle,
  useThemeColors,

  // Feedback
  useFeedback,
  DSProgressFeedback,

  // Validação
  DSFormValidation,
  useFormValidation,

  // Hooks
  useLoading,
  useSpacing
} from '@/components/ui';

import { Card, CardContent, Divider, Box } from '@mui/material';

const statusOptions = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'pending', label: 'Pendente' }
];

const serviceOptions = [
  { value: 'corte', label: 'Corte de cabelo' },
  { value: 'barba', label: 'Barba' },
  { value: 'combo', label: 'Corte + Barba' },
  { value: 'sobrancelha', label: 'Sobrancelha' }
];

const clientesMock = [
  { id: 1, nome: 'João Silva', telefone: '(11) 99999-9999' },
  { id: 2, nome: 'Maria Santos', telefone: '(11) 88888-8888' },
  { id: 3, nome: 'Pedro Oliveira', telefone: '(11) 77777-7777' }
];

export default function DesignSystemExample() {
  const { colors, isLight } = useThemeColors();
  const { showSuccess, showError, showWarning } = useFeedback();
  const { loading, withLoading } = useLoading();
  const { getSpacing } = useSpacing();

  // Estados do formulário
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    status: '',
    servico: '',
    observacoes: '',
    notificacoes: false,
    termos: false,
    cliente: null
  });

  // Estados da página
  const [showLoading, setShowLoading] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);

  // Validação
  const { errors, validateField, validateForm, clearErrors } = useFormValidation({
    nome: { required: true, minLength: 2 },
    telefone: { required: true, phone: true },
    email: { required: true, email: true },
    status: { required: true },
    servico: { required: true },
    termos: { required: true }
  });

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Exemplos', href: '/exemplos' },
    { label: 'Design System', current: true }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      validateField(field, value);
    }
  };

  const handleSubmit = async () => {
    const isValid = validateForm(formData);
    if (!isValid) {
      showError('Por favor, corrija os erros no formulário');
      return;
    }

    await withLoading(async () => {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      showSuccess('Dados salvos com sucesso!');
      clearErrors();
    }, 'Salvando dados...');
  };

  const simulateUpload = () => {
    setShowProgress(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setShowProgress(false);
          showSuccess('Upload concluído!');
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <DSContainer maxWidth="lg">
      <DSStack spacing={4}>
        {/* Header */}
        <DSPageBreadcrumbs
          title="Design System - Exemplo Completo"
          items={breadcrumbItems}
          actions={
            <DSStack direction="row" spacing={2}>
              <DSThemeToggle variant="switch" />
              <DSButton
                variant="outlined"
                startIcon={<DSIcon name="refresh" />}
                onClick={() => window.location.reload()}
              >
                Recarregar
              </DSButton>
            </DSStack>
          }
        />

        {/* Seção de Tipografia */}
        <Card>
          <CardContent>
            <DSHeading level={2} gutterBottom>
              Tipografia
            </DSHeading>

            <DSStack spacing={2}>
              <DSDisplay size="large" color="primary">
                R$ 1.250,00
              </DSDisplay>

              <DSHeading level={3}>
                Título de Seção
              </DSHeading>

              <DSLabel>Label do Campo</DSLabel>
              <DSHelper>Texto de ajuda para o usuário</DSHelper>
              <DSError>Mensagem de erro</DSError>
            </DSStack>
          </CardContent>
        </Card>

        {/* Seção de Ícones */}
        <Card>
          <CardContent>
            <DSHeading level={2} gutterBottom>
              Ícones
            </DSHeading>

            <DSStack direction="row" spacing={3} flexWrap="wrap">
              <DSIcon name="user" size="small" />
              <DSIcon name="calendar" size="medium" />
              <DSIcon name="settings" size="large" />

              <DSStatusIcon status="success" />
              <DSStatusIcon status="warning" />
              <DSStatusIcon status="error" />

              <DSActionIcon
                action="edit"
                onClick={() => showSuccess('Ação de editar!')}
              />
              <DSActionIcon
                action="delete"
                onClick={() => showWarning('Ação de deletar!')}
              />
            </DSStack>
          </CardContent>
        </Card>

        {/* Formulário Completo */}
        <Card>
          <CardContent>
            <DSHeading level={2} gutterBottom>
              Formulário Completo
            </DSHeading>

            <DSStack spacing={3}>
              <DSGrid container spacing={2}>
                <DSGrid item xs={12} md={6}>
                  <DSTextField
                    label="Nome"
                    placeholder="Digite o nome completo"
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    onBlur={(e) => validateField('nome', e.target.value)}
                    error={!!errors.nome}
                    helperText={errors.nome}
                    required
                  />
                </DSGrid>

                <DSGrid item xs={12} md={6}>
                  <DSTextField
                    label="Telefone"
                    mask="phone"
                    value={formData.telefone}
                    onChange={(e) => handleInputChange('telefone', e.target.value)}
                    onBlur={(e) => validateField('telefone', e.target.value)}
                    error={!!errors.telefone}
                    helperText={errors.telefone}
                    required
                  />
                </DSGrid>

                <DSGrid item xs={12} md={6}>
                  <DSTextField
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={(e) => validateField('email', e.target.value)}
                    error={!!errors.email}
                    helperText={errors.email}
                    required
                  />
                </DSGrid>

                <DSGrid item xs={12} md={6}>
                  <DSSelect
                    label="Status"
                    options={statusOptions}
                    value={formData.status}
                    onChange={(value) => handleInputChange('status', value)}
                    error={!!errors.status}
                    helperText={errors.status}
                    required
                  />
                </DSGrid>

                <DSGrid item xs={12}>
                  <DSAutocomplete
                    label="Cliente"
                    options={clientesMock}
                    getOptionLabel={(option) => option.nome}
                    value={formData.cliente}
                    onChange={(value) => handleInputChange('cliente', value)}
                    placeholder="Buscar cliente..."
                  />
                </DSGrid>

                <DSGrid item xs={12}>
                  <DSRadioGroup
                    label="Tipo de Serviço"
                    options={serviceOptions}
                    value={formData.servico}
                    onChange={(value) => handleInputChange('servico', value)}
                    error={!!errors.servico}
                    helperText={errors.servico}
                    required
                  />
                </DSGrid>

                <DSGrid item xs={12}>
                  <DSTextArea
                    label="Observações"
                    placeholder="Digite observações adicionais..."
                    value={formData.observacoes}
                    onChange={(e) => handleInputChange('observacoes', e.target.value)}
                    maxLength={500}
                    showCharacterCount
                    autoResize
                  />
                </DSGrid>

                <DSGrid item xs={12}>
                  <DSStack spacing={2}>
                    <DSSwitch
                      label="Receber notificações"
                      description="Receber notificações por email e SMS"
                      checked={formData.notificacoes}
                      onChange={(checked) => handleInputChange('notificacoes', checked)}
                    />

                    <DSCheckbox
                      label="Aceito os termos e condições"
                      checked={formData.termos}
                      onChange={(checked) => handleInputChange('termos', checked)}
                      error={!!errors.termos}
                      helperText={errors.termos}
                      required
                    />
                  </DSStack>
                </DSGrid>
              </DSGrid>

              <DSFormValidation
                errors={errors}
                variant="list"
              />

              <DSStack direction="row" spacing={2} justifyContent="flex-end">
                <DSButton
                  variant="outlined"
                  onClick={clearErrors}
                >
                  Limpar
                </DSButton>

                <DSButton
                  variant="contained"
                  loading={loading}
                  onClick={handleSubmit}
                  startIcon={<DSIcon name="save" />}
                >
                  Salvar
                </DSButton>
              </DSStack>
            </DSStack>
          </CardContent>
        </Card>

        {/* Estados de Loading */}
        <Card>
          <CardContent>
            <DSHeading level={2} gutterBottom>
              Estados de Loading
            </DSHeading>

            <DSStack spacing={3}>
              <DSStack direction="row" spacing={2} flexWrap="wrap">
                <DSButton
                  variant="outlined"
                  onClick={() => setShowLoading(true)}
                >
                  Mostrar Loading
                </DSButton>

                <DSButton
                  variant="outlined"
                  onClick={() => setShowSkeleton(!showSkeleton)}
                >
                  Toggle Skeleton
                </DSButton>

                <DSButton
                  variant="outlined"
                  onClick={simulateUpload}
                >
                  Simular Upload
                </DSButton>
              </DSStack>

              {showSkeleton && (
                <Box>
                  <DSHeading level={4} gutterBottom>
                    Skeleton Loading:
                  </DSHeading>
                  <DSSkeleton variant="card" />
                </Box>
              )}

              {showProgress && (
                <DSProgressFeedback
                  type="upload"
                  progress={uploadProgress}
                  fileName="documento.pdf"
                  status={uploadProgress < 100 ? "processing" : "completed"}
                  onCancel={() => {
                    setShowProgress(false);
                    setUploadProgress(0);
                  }}
                />
              )}
            </DSStack>
          </CardContent>
        </Card>

        {/* Estados Vazios */}
        <Card>
          <CardContent>
            <DSHeading level={2} gutterBottom>
              Estados Vazios
            </DSHeading>

            <DSStack spacing={3}>
              <DSButton
                variant="outlined"
                onClick={() => setShowEmpty(!showEmpty)}
              >
                Toggle Empty State
              </DSButton>

              {showEmpty && (
                <DSEmptySearch
                  searchTerm="termo de busca"
                  onClearSearch={() => showSuccess('Busca limpa!')}
                  onCreateNew={() => showSuccess('Criar novo item!')}
                />
              )}
            </DSStack>
          </CardContent>
        </Card>

        {/* Feedback e Notificações */}
        <Card>
          <CardContent>
            <DSHeading level={2} gutterBottom>
              Feedback e Notificações
            </DSHeading>

            <DSStack direction="row" spacing={2} flexWrap="wrap">
              <DSButton
                variant="outlined"
                color="success"
                onClick={() => showSuccess('Operação realizada com sucesso!')}
              >
                Sucesso
              </DSButton>

              <DSButton
                variant="outlined"
                color="warning"
                onClick={() => showWarning('Atenção: verifique os dados!')}
              >
                Aviso
              </DSButton>

              <DSButton
                variant="outlined"
                color="error"
                onClick={() => showError('Erro: não foi possível completar a operação!')}
              >
                Erro
              </DSButton>
            </DSStack>
          </CardContent>
        </Card>

        {/* Informações do Tema */}
        <Card>
          <CardContent>
            <DSHeading level={2} gutterBottom>
              Informações do Tema
            </DSHeading>

            <DSStack spacing={2}>
              <DSDisplay size="medium">
                Tema atual: {isLight ? 'Claro' : 'Escuro'}
              </DSDisplay>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: colors.primary[50],
                  border: `1px solid ${colors.primary[200]}`
                }}
              >
                <DSLabel>Cor primária aplicada</DSLabel>
              </Box>
            </DSStack>
          </CardContent>
        </Card>
      </DSStack>

      {/* Loading Overlay */}
      {showLoading && (
        <DSLoading
          message="Carregando exemplo..."
          onClose={() => setShowLoading(false)}
        />
      )}
    </DSContainer>
  );
}