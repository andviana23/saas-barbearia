# Design System - SaaS Barbearia

## Visão Geral

Este documento descreve o Design System completo do SaaS Barbearia, incluindo componentes, padrões de uso, guidelines e exemplos práticos.

## 📦 Componentes Disponíveis

### Formulários

#### DSTextField
Campo de texto padronizado com suporte a máscaras e validação.

```tsx
import { DSTextField } from '@/components/ui';

// Uso básico
<DSTextField
  label="Nome"
  placeholder="Digite seu nome"
  required
/>

// Com máscara
<DSTextField
  label="Telefone"
  mask="phone"
  required
/>

// Com validação
<DSTextField
  label="Email"
  type="email"
  error={!!errors.email}
  helperText={errors.email?.message}
/>
```

**Máscaras disponíveis:**
- `phone`: (11) 99999-9999
- `cpf`: 999.999.999-99
- `cnpj`: 99.999.999/9999-99
- `cep`: 99999-999
- `currency`: R$ 999,99

#### DSSelect
Componente de seleção padronizado.

```tsx
import { DSSelect } from '@/components/ui';

<DSSelect
  label="Status"
  options={[
    { value: 'active', label: 'Ativo' },
    { value: 'inactive', label: 'Inativo' }
  ]}
  required
/>
```

#### DSCheckbox
Checkbox padronizado com suporte a estados intermediários.

```tsx
import { DSCheckbox } from '@/components/ui';

<DSCheckbox
  label="Aceito os termos"
  required
/>

<DSCheckbox
  label="Selecionar todos"
  indeterminate={someSelected}
  checked={allSelected}
/>
```

#### DSRadioGroup
Grupo de radio buttons padronizado.

```tsx
import { DSRadioGroup } from '@/components/ui';

<DSRadioGroup
  label="Tipo de serviço"
  options={[
    { value: 'corte', label: 'Corte de cabelo' },
    { value: 'barba', label: 'Barba' },
    { value: 'combo', label: 'Corte + Barba' }
  ]}
  required
/>
```

#### DSTextArea
Área de texto com redimensionamento automático.

```tsx
import { DSTextArea } from '@/components/ui';

<DSTextArea
  label="Observações"
  placeholder="Digite suas observações..."
  maxLength={500}
  showCharacterCount
  autoResize
/>
```

#### DSAutocomplete
Campo de autocomplete com busca.

```tsx
import { DSAutocomplete } from '@/components/ui';

<DSAutocomplete
  label="Cliente"
  options={clientes}
  getOptionLabel={(option) => option.nome}
  loading={loading}
  onInputChange={handleSearch}
/>
```

#### DSSwitch
Switch padronizado com rótulos.

```tsx
import { DSSwitch } from '@/components/ui';

<DSSwitch
  label="Notificações"
  description="Receber notificações por email"
  checked={notifications}
  onChange={setNotifications}
/>
```

#### DSButton
Botão padronizado com estados de loading.

```tsx
import { DSButton } from '@/components/ui';

<DSButton
  variant="contained"
  loading={isSubmitting}
  startIcon={<SaveIcon />}
  onClick={handleSave}
>
  Salvar
</DSButton>
```

### Layout e Navegação

#### DSSpacing
Sistema de espaçamento padronizado.

```tsx
import { DSStack, DSGrid, DSContainer } from '@/components/ui';

// Stack para elementos verticais
<DSStack spacing={3}>
  <Component1 />
  <Component2 />
</DSStack>

// Grid responsivo
<DSGrid container spacing={2}>
  <DSGrid item xs={12} md={6}>
    <Card1 />
  </DSGrid>
  <DSGrid item xs={12} md={6}>
    <Card2 />
  </DSGrid>
</DSGrid>

// Container com padding padronizado
<DSContainer maxWidth="lg">
  <Content />
</DSContainer>
```

#### DSBreadcrumbs
Navegação breadcrumb responsiva.

```tsx
import { DSBreadcrumbs, DSPageBreadcrumbs } from '@/components/ui';

// Breadcrumbs simples
<DSBreadcrumbs
  items={[
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Clientes', href: '/clientes' },
    { label: 'João Silva', current: true }
  ]}
  showBackButton
/>

// Breadcrumbs de página completa
<DSPageBreadcrumbs
  title="Novo Cliente"
  items={breadcrumbItems}
  actions={
    <DSButton variant="contained">
      Salvar
    </DSButton>
  }
/>
```

### Tipografia

#### DSTypography
Sistema de tipografia padronizado.

```tsx
import { DSHeading, DSDisplay, DSLabel, DSHelper, DSError } from '@/components/ui';

// Títulos
<DSHeading level={1}>Título Principal</DSHeading>
<DSHeading level={2} color="primary">Subtítulo</DSHeading>

// Texto de destaque
<DSDisplay size="large">Valor em destaque</DSDisplay>

// Labels e helpers
<DSLabel required>Nome do campo</DSLabel>
<DSHelper>Texto de ajuda</DSHelper>
<DSError>Mensagem de erro</DSError>
```

### Ícones

#### DSIcon
Sistema de ícones padronizado.

```tsx
import { DSIcon, DSStatusIcon, DSActionIcon, DSNavigationIcon } from '@/components/ui';

// Ícone básico
<DSIcon name="user" size="medium" />

// Ícones específicos
<DSStatusIcon status="success" />
<DSActionIcon action="edit" onClick={handleEdit} />
<DSNavigationIcon direction="next" />
```

### Estados de Loading

#### DSLoading
Componentes de carregamento.

```tsx
import { 
  DSLoading, 
  DSSkeleton, 
  DSPageLoading, 
  DSTableLoading 
} from '@/components/ui';

// Loading overlay
<DSPageLoading message="Carregando dados..." />

// Skeleton para tabelas
<DSTableLoading rows={5} />

// Skeleton para cards
<DSSkeleton variant="card" />

// Loading em botões
<DSButton loading={isSubmitting}>
  Salvar
</DSButton>
```

### Estados Vazios

#### DSEmptyState
Estados vazios informativos.

```tsx
import { 
  DSEmptyAgendamentos,
  DSEmptyClientes,
  DSEmptySearch,
  DSEmptyFilter 
} from '@/components/ui';

// Estados específicos
<DSEmptyAgendamentos 
  onCreateNew={() => router.push('/agendamentos/novo')}
/>

<DSEmptyClientes 
  onCreateNew={() => setShowDialog(true)}
/>

// Estados de busca/filtro
<DSEmptySearch
  searchTerm={searchTerm}
  onClearSearch={() => setSearchTerm('')}
  onCreateNew={() => setShowDialog(true)}
/>
```

### Tema e Cores

#### DSTheme
Sistema de tema dark/light.

```tsx
import { DSThemeProvider, DSThemeToggle, useThemeColors } from '@/components/ui';

// Provider no root da aplicação
<DSThemeProvider defaultMode="light">
  <App />
</DSThemeProvider>

// Toggle de tema
<DSThemeToggle variant="icon" />
<DSThemeToggle variant="switch" />
<DSThemeToggle variant="menu" />

// Hook para acessar cores
function MyComponent() {
  const { colors, isLight, isDark } = useThemeColors();
  
  return (
    <Box sx={{ 
      bgcolor: isLight ? colors.primary[50] : colors.primary[900] 
    }}>
      Content
    </Box>
  );
}
```

### Feedback e Notificações

#### DSFeedback
Sistema de notificações e feedback.

```tsx
import { 
  DSNotificationProvider, 
  useFeedback, 
  DSProgressFeedback 
} from '@/components/ui';

// Provider no root
<DSNotificationProvider>
  <App />
</DSNotificationProvider>

// Hook para notificações
function MyComponent() {
  const { showSuccess, showError, showWarning } = useFeedback();
  
  const handleSave = async () => {
    try {
      await saveData();
      showSuccess('Dados salvos com sucesso!');
    } catch (error) {
      showError('Erro ao salvar dados');
    }
  };
}

// Feedback de progresso
<DSProgressFeedback
  type="upload"
  progress={uploadProgress}
  fileName="documento.pdf"
  status="processing"
  onCancel={handleCancel}
/>
```

### Validação de Formulários

#### DSFormValidation
Sistema de validação padronizado.

```tsx
import { DSFormValidation, useFormValidation } from '@/components/ui';

function MyForm() {
  const { errors, validateField, validateForm } = useFormValidation({
    name: { required: true, minLength: 2 },
    email: { required: true, email: true },
    phone: { required: true, phone: true }
  });

  return (
    <form>
      <DSTextField
        label="Nome"
        error={!!errors.name}
        helperText={errors.name}
        onBlur={(e) => validateField('name', e.target.value)}
      />
      
      <DSFormValidation
        errors={errors}
        variant="list"
      />
    </form>
  );
}
```

## 🎨 Paleta de Cores

### Cores Primárias
- **Primary**: Azul (#0ea5e9)
- **Secondary**: Roxo (#d946ef)

### Cores de Status
- **Success**: Verde (#22c55e)
- **Warning**: Amarelo (#f59e0b)
- **Error**: Vermelho (#ef4444)
- **Info**: Azul (#0ea5e9)

### Cores Neutras
- **Background Light**: #ffffff
- **Background Dark**: #0f172a
- **Text Primary Light**: #1e293b
- **Text Primary Dark**: #f1f5f9

## 📱 Responsividade

### Breakpoints
- **xs**: 0px
- **sm**: 600px
- **md**: 900px
- **lg**: 1200px
- **xl**: 1536px

### Padrões Mobile
- Usar `variant="mobile"` em breadcrumbs
- Componentes se adaptam automaticamente
- Stack vertical em telas pequenas
- Botões full-width quando necessário

## 🔧 Hooks Utilitários

### useLoading
```tsx
const { loading, startLoading, stopLoading, withLoading } = useLoading();

// Uso com async/await
const handleSubmit = () => withLoading(async () => {
  await submitForm();
}, 'Salvando...');
```

### useSpacing
```tsx
const { getSpacing, responsive } = useSpacing();

const spacing = getSpacing(2); // 16px
const responsiveSpacing = responsive({ xs: 1, md: 2 });
```

### useIcons
```tsx
const { getIcon, getStatusIcon } = useIcons();

const userIcon = getIcon('user');
const successIcon = getStatusIcon('success');
```

## 📋 Boas Práticas

### 1. Consistência
- Sempre use componentes do DS ao invés de MUI diretamente
- Mantenha padrões de nomenclatura
- Use as cores e espaçamentos padronizados

### 2. Acessibilidade
- Todos os componentes incluem labels apropriados
- Suporte a navegação por teclado
- Contraste adequado entre cores
- Textos alternativos em ícones

### 3. Performance
- Componentes otimizados com React.memo
- Lazy loading quando apropriado
- Skeleton loading para melhor UX

### 4. Responsividade
- Mobile-first approach
- Breakpoints consistentes
- Componentes adaptáveis

## 🚀 Exemplos de Uso

### Formulário Completo
```tsx
import {
  DSTextField,
  DSSelect,
  DSTextArea,
  DSButton,
  DSStack,
  DSFormValidation,
  useFeedback
} from '@/components/ui';

function ClienteForm() {
  const { showSuccess, showError } = useFeedback();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await saveCliente(data);
      showSuccess('Cliente salvo com sucesso!');
    } catch (error) {
      showError('Erro ao salvar cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DSStack spacing={3}>
      <DSTextField
        label="Nome"
        required
        placeholder="Nome completo"
      />
      
      <DSTextField
        label="Telefone"
        mask="phone"
        required
      />
      
      <DSSelect
        label="Status"
        options={statusOptions}
        required
      />
      
      <DSTextArea
        label="Observações"
        maxLength={500}
        showCharacterCount
      />
      
      <DSButton
        variant="contained"
        loading={loading}
        onClick={handleSubmit}
        fullWidth
      >
        Salvar Cliente
      </DSButton>
    </DSStack>
  );
}
```

### Página com Breadcrumbs e Estados
```tsx
import {
  DSPageBreadcrumbs,
  DSEmptyClientes,
  DSTableLoading,
  DSButton,
  DSContainer
} from '@/components/ui';

function ClientesPage() {
  const [loading, setLoading] = useState(true);
  const [clientes, setClientes] = useState([]);

  if (loading) {
    return (
      <DSContainer>
        <DSTableLoading rows={5} />
      </DSContainer>
    );
  }

  if (clientes.length === 0) {
    return (
      <DSContainer>
        <DSEmptyClientes 
          onCreateNew={() => router.push('/clientes/novo')}
        />
      </DSContainer>
    );
  }

  return (
    <DSContainer>
      <DSPageBreadcrumbs
        title="Clientes"
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Clientes', current: true }
        ]}
        actions={
          <DSButton
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/clientes/novo')}
          >
            Novo Cliente
          </DSButton>
        }
      />
      
      {/* Lista de clientes */}
    </DSContainer>
  );
}
```

## 🔄 Atualizações e Manutenção

### Versionamento
- Seguir semantic versioning
- Documentar breaking changes
- Manter backward compatibility quando possível

### Contribuição
- Novos componentes devem seguir os padrões estabelecidos
- Incluir testes e documentação
- Revisar impacto em componentes existentes

### Monitoramento
- Acompanhar uso dos componentes
- Coletar feedback dos desenvolvedores
- Otimizar componentes mais utilizados

---

Para dúvidas ou sugestões, consulte a equipe de desenvolvimento ou abra uma issue no repositório.