# 📚 GUIA DE USO - COMPONENTES UI & DESIGN SYSTEM

**Sistema:** SaaS Barbearia - Design System Completo  
**Baseado em:** Material-UI v6 + Componentes Padronizados

---

## 📋 ÍNDICE

1. [Componentes Disponíveis](#componentes-disponíveis)
2. [Design System Completo](#design-system-completo)
3. [Sistema SX - Estilização](#sistema-sx---estilização)
4. [Grid Responsivo](#grid-responsivo)
5. [Breakpoints](#breakpoints)
6. [Boas Práticas](#boas-práticas)
7. [Exemplos de Uso](#exemplos-de-uso)

---

## 🎯 Design System Completo

### Novos Componentes Padronizados

```typescript
import {
  // Formulários
  DSTextField,
  DSSelect,
  DSCheckbox,
  DSRadioGroup,
  DSTextArea,
  DSAutocomplete,
  DSSwitch,
  DSButton,
  
  // Layout
  DSContainer,
  DSStack,
  DSGrid,
  
  // Navegação
  DSBreadcrumbs,
  DSPageBreadcrumbs,
  
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
  DSPageLoading,
  
  // Estados Vazios
  DSEmptyState,
  DSEmptyAgendamentos,
  DSEmptyClientes,
  
  // Tema
  DSThemeProvider,
  DSThemeToggle,
  
  // Feedback
  DSNotificationProvider,
  DSProgressFeedback,
  
  // Validação
  DSFormValidation,
  
  // Hooks
  useFeedback,
  useFormValidation,
  useLoading,
  useThemeColors,
  useSpacing,
  useIcons,
  
  // Exemplo Completo
  DesignSystemExample
} from '@/components/ui';
```

### 📖 Documentação Completa
- **Documentação detalhada:** `docs/DESIGN_SYSTEM.md`
- **Exemplo prático:** `src/examples/DesignSystemExample.tsx`

---

## 🎨 Componentes Disponíveis

### Importação Centralizada

```typescript
import {
  Button,
  Card,
  Table,
  Modal,
  ConfirmModal,
  EmptyState,
  Form,
  Input,
  SelectInput,
  CheckboxInput,
  DSConfirmDialog,
  DSDeleteDialog,
} from '@/components/ui';
```

### 🔔 Componentes de Confirmação

#### DSConfirmDialog - Confirmações Gerais

```typescript
import { DSConfirmDialog } from '@/components/ui';

<DSConfirmDialog
  open={open}
  onClose={() => setOpen(false)}
  onConfirm={handleConfirm}
  title="Confirmar Ação"
  message="Tem certeza que deseja continuar?"
  variant="warning" // 'warning' | 'error' | 'info' | 'delete'
  confirmText="Sim, continuar"
  cancelText="Cancelar"
  loading={isLoading}
  details="Informações adicionais sobre a ação"
/>
```

#### DSDeleteDialog - Confirmação de Exclusão

```typescript
import { DSDeleteDialog } from '@/components/ui';

<DSDeleteDialog
  open={open}
  onClose={() => setOpen(false)}
  onConfirm={handleDelete}
  title="Excluir Cliente"
  itemName="João Silva"
  itemType="Cliente"
  requireNameConfirmation={true}
  consequences={[
    'Todos os agendamentos serão cancelados',
    'Histórico será mantido para relatórios'
  ]}
  loading={isDeleting}
/>
```

#### Hook useConfirmDialog

```typescript
import { useConfirmDialog } from '@/hooks/useConfirmDialog';

const { showConfirmDialog, showDeleteDialog } = useConfirmDialog();

// Confirmação simples
showConfirmDialog({
  title: 'Confirmar',
  message: 'Deseja continuar?',
  onConfirm: () => performAction(),
});

// Confirmação de exclusão
showDeleteDialog({
  title: 'Excluir Item',
  itemName: 'Nome do Item',
  itemType: 'Tipo',
  onConfirm: () => deleteItem(),
});
```

#### Provider Global

```typescript
// app/layout.tsx
import { DSConfirmationProvider } from '@/components/ui/DSConfirmationProvider';

<DSConfirmationProvider>
  {children}
</DSConfirmationProvider>

// Em qualquer componente
import { useConfirmation } from '@/components/ui/DSConfirmationProvider';

const { showConfirmDialog, showDeleteDialog } = useConfirmation();
```

### 🔴 Button

```typescript
<Button
  variant="contained"
  loading={isLoading}
  sx={{ borderRadius: 3 }}
>
  Salvar
</Button>
```

### 🔵 Card

```typescript
<Card
  title="Título do Card"
  subtitle="Subtítulo opcional"
  loading={isLoading}
  actions={<Button>Ação</Button>}
>
  Conteúdo do card
</Card>
```

### 🟢 Table

```typescript
<Table
  columns={[
    { id: 'name', label: 'Nome', minWidth: 170 },
    { id: 'email', label: 'Email', minWidth: 200 },
  ]}
  data={clients}
  loading={isLoading}
  onRowClick={(row) => console.log(row)}
/>
```

### 🟣 Modal

```typescript
<Modal
  open={open}
  onClose={() => setOpen(false)}
  title="Título do Modal"
  maxWidth="md"
  actions={
    <>
      <Button variant="outlined">Cancelar</Button>
      <Button variant="contained">Confirmar</Button>
    </>
  }
>
  Conteúdo do modal
</Modal>
```

### ⚪ EmptyState

```typescript
<EmptyState
  icon="inbox"
  title="Nenhum cliente encontrado"
  description="Crie seu primeiro cliente para começar"
  action={{
    label: "Criar Cliente",
    onClick: () => setModalOpen(true)
  }}
/>
```

---

## 🎯 Sistema SX - Estilização

### Conceitos Fundamentais

O **sx prop** é a forma moderna de estilizar componentes MUI v6:

```typescript
// ✅ CORRETO - Use sx prop
<Box sx={{
  p: 2,           // padding: 16px (theme.spacing(2))
  m: 1,           // margin: 8px
  bgcolor: 'primary.main',
  borderRadius: 2,
  display: 'flex',
  alignItems: 'center'
}}>
  Conteúdo
</Box>

// ❌ INCORRETO - Não use style inline
<div style={{ padding: '16px', backgroundColor: '#1976d2' }}>
  Conteúdo
</div>
```

### Valores do Theme

```typescript
// Spacing (multiplicado por 8px)
sx={{ p: 1 }}     // padding: 8px
sx={{ p: 2 }}     // padding: 16px
sx={{ p: 3 }}     // padding: 24px

// Colors
sx={{ color: 'primary.main' }}      // Cor primária
sx={{ bgcolor: 'secondary.light' }} // Background secundário claro
sx={{ color: 'text.secondary' }}    // Texto secundário

// Typography
sx={{
  fontSize: 'h4.fontSize',   // Tamanho do h4
  fontWeight: 'fontWeightBold',
  lineHeight: 1.5
}}
```

### Responsividade com SX

```typescript
// Valores responsivos
<Box sx={{
  display: { xs: 'block', md: 'flex' },    // block no mobile, flex no desktop
  p: { xs: 1, sm: 2, md: 3 },              // padding responsivo
  width: { xs: '100%', md: '50%' },         // largura responsiva
}}>
  Conteúdo responsivo
</Box>
```

---

## 📱 Grid Responsivo

### Sistema de Grid MUI

```typescript
import { Grid, Box } from '@mui/material'

// Container principal
<Grid container spacing={3}>
  <Grid item xs={12} sm={6} md={4}>
    <Card>Item 1</Card>
  </Grid>
  <Grid item xs={12} sm={6} md={4}>
    <Card>Item 2</Card>
  </Grid>
  <Grid item xs={12} sm={6} md={4}>
    <Card>Item 3</Card>
  </Grid>
</Grid>
```

### Breakpoints e Comportamento

| Breakpoint | Tamanho | Comportamento                      |
| ---------- | ------- | ---------------------------------- |
| `xs`       | 0px+    | Mobile portrait                    |
| `sm`       | 600px+  | Mobile landscape / Tablet portrait |
| `md`       | 900px+  | Tablet landscape / Desktop pequeno |
| `lg`       | 1200px+ | Desktop médio                      |
| `xl`       | 1536px+ | Desktop grande                     |

### Exemplos Práticos

```typescript
// Layout de dashboard responsivo
<Grid container spacing={3}>
  {/* Métricas - 4 colunas no desktop, 2 no tablet, 1 no mobile */}
  <Grid item xs={12} sm={6} lg={3}>
    <Card title="Receita Diária">R$ 1.250,00</Card>
  </Grid>
  <Grid item xs={12} sm={6} lg={3}>
    <Card title="Clientes Atendidos">45</Card>
  </Grid>
  <Grid item xs={12} sm={6} lg={3}>
    <Card title="Agendamentos">12</Card>
  </Grid>
  <Grid item xs={12} sm={6} lg={3}>
    <Card title="Fila de Espera">8</Card>
  </Grid>

  {/* Gráfico - largura total */}
  <Grid item xs={12}>
    <Card title="Faturamento Mensal">
      {/* Componente de gráfico */}
    </Card>
  </Grid>

  {/* Tabelas lado a lado no desktop */}
  <Grid item xs={12} lg={6}>
    <Card title="Próximos Agendamentos">
      <Table columns={[]} data={[]} />
    </Card>
  </Grid>
  <Grid item xs={12} lg={6}>
    <Card title="Clientes Recentes">
      <Table columns={[]} data={[]} />
    </Card>
  </Grid>
</Grid>
```

---

## ✅ Boas Práticas

### 1. **Use sx prop sempre**

```typescript
// ✅ CORRETO
<Button sx={{ borderRadius: 3, px: 4 }}>
  Botão
</Button>

// ❌ INCORRETO
<Button style={{ borderRadius: '24px', paddingLeft: '32px' }}>
  Botão
</Button>
```

### 2. **Aproveite valores do theme**

```typescript
// ✅ CORRETO - Usa valores do theme
<Box sx={{
  color: 'primary.main',
  bgcolor: 'background.paper',
  p: 2,
  borderRadius: 1
}}>

// ❌ INCORRETO - Valores hardcoded
<Box sx={{
  color: '#1976d2',
  backgroundColor: '#ffffff',
  padding: '16px',
  borderRadius: '8px'
}}>
```

### 3. **Responsividade mobile-first**

```typescript
// ✅ CORRETO - Mobile first
<Box sx={{
  display: { xs: 'block', md: 'flex' },
  p: { xs: 1, md: 3 }
}}>

// ❌ INCORRETO - Desktop first
<Box sx={{
  display: { lg: 'flex', xs: 'block' }
}}>
```

### 4. **Use componentes do sistema**

```typescript
// ✅ CORRETO - Componentes do sistema
import { Button, Card } from '@/components/ui';

// ❌ INCORRETO - Componentes MUI diretos
import { Button, Card } from '@mui/material';
```

### 5. **Mantenha consistência visual**

```typescript
// ✅ CORRETO - Espaçamentos consistentes
<Box sx={{ p: 2, mb: 2 }}>  // Sempre múltiplos de 8px
<Box sx={{ p: 3, mb: 3 }}>

// ❌ INCORRETO - Valores arbitrários
<Box sx={{ padding: '14px', marginBottom: '18px' }}>
```

---

## 🚀 Exemplos de Uso Completos

### Página de Lista com Filtros

```typescript
export default function ClientsPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h4">Clientes</Typography>
        <Button variant="contained">
          Novo Cliente
        </Button>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <Grid container spacing={2} sx={{ p: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Input label="Buscar por nome" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <SelectInput
              label="Status"
              options={[
                { value: 'ativo', label: 'Ativo' },
                { value: 'inativo', label: 'Inativo' }
              ]}
            />
          </Grid>
        </Grid>
      </Card>

      {/* Tabela */}
      <Card>
        <Table
          columns={columns}
          data={clients}
          loading={isLoading}
        />
      </Card>
    </Container>
  )
}
```

### Formulário Responsivo

```typescript
export default function ClientForm() {
  return (
    <Modal open={open} onClose={onClose} title="Novo Cliente">
      <Form>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Input
              label="Nome completo"
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Input
              label="Email"
              type="email"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Input
              label="Telefone"
              type="tel"
            />
          </Grid>
          <Grid item xs={12}>
            <CheckboxInput
              label="Cliente ativo"
              checked={active}
              onChange={setActive}
            />
          </Grid>
        </Grid>
      </Form>
    </Modal>
  )
}
```

---

**✅ Sistema de Design implementado conforme GUIA_TECNOLOGIAS_INTEGRACOES.md**  
**📱 Responsividade garantida em todos os breakpoints**  
**🎨 Consistência visual através do tema centralizado**
