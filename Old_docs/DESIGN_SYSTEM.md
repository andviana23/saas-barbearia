# 📘 Design System — Trato v2.0.0

**Base:** Next.js 14 + TypeScript + MUI v6
**Status:** Em evolução (DS v2 ativo)
**Modo padrão:** Dark Mode First

---

## 1. Introdução

O **Design System Trato** é um guia de identidade visual e de componentes de interface criado para assegurar **consistência, acessibilidade e eficiência** no desenvolvimento de produtos digitais.

Ele organiza cores, tipografia, componentes, layouts e diretrizes de usabilidade em um **framework unificado**, inspirado nos princípios de **Atomic Design**.

### Objetivos

- Garantir **consistência visual** em todas as interfaces.
- Promover **eficiência e reutilização** de componentes.
- Facilitar a **evolução e manutenção** do produto.
- Assegurar **acessibilidade e usabilidade** como padrão.

---

## 2. Filosofia de Design

- **Dark Mode First** → O design é otimizado para ambientes escuros, refletindo sofisticação e modernidade.
- **Luxury & Tech** → Visual premium, minimalista, com ênfase em credibilidade e densidade de informação.
- **Mobile-First** → Layouts responsivos, priorizando telas pequenas sem perder clareza no desktop.
- **Densidade otimizada** → Mais informação visível, sem sobrecarregar a interface.

---

## 3. Paleta de Cores

```ts
palette: {
  mode: 'dark',
  primary: { main: '#4f8cff', light: '#7aaaff', dark: '#2c5fd8' },
  secondary: { main: '#6366f1', light: '#818cf8', dark: '#4f46e5' },
  background: { default: '#0B0E13', paper: '#12151D' },
  surfaces: { surface1: '#161A23', surface2: '#1C202B' },
  text: { primary: '#f9fafb', secondary: '#A0A6B5' },
  divider: 'rgba(255,255,255,0.08)',
  success: { main: '#22c55e' },
  error: { main: '#ef4444' },
  warning: { main: '#f59e0b' }
}
```

- **Primary (azul)** → ações principais, links e destaques.
- **Secondary (índigo)** → elementos complementares, gráficos e interações secundárias.
- **Background / Surfaces** → camadas graduais (`default` → `paper` → `surface1` → `surface2`) para hierarquia sem depender de sombras fortes.
- **Divider** (`rgba(255,255,255,0.08)`) → separações sutis.
- **Feedback (success, error, warning)** → cores planas e modernas para estados do sistema.

---

## 4. Tipografia

```ts
typography: {
  fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
  h1: { fontSize: '2rem', fontWeight: 600 },
  h2: { fontSize: '1.75rem', fontWeight: 600 },
  h3: { fontSize: '1.5rem', fontWeight: 600 },
  h4: { fontSize: '1.25rem', fontWeight: 500 },
  body1: { fontSize: '1rem', fontWeight: 400 },
  body2: { fontSize: '0.875rem', fontWeight: 400 },
  button: { fontWeight: 600, textTransform: 'none' }
}
```

- **Títulos:** Fortes e densos, priorizando métricas e informações-chave.
- **Subtítulos:** Textos secundários em cinza neutro.
- **Texto base:** Branco suave (#f9fafb), garantindo contraste e legibilidade.

---

## 5. Componentes Padrão

### **Botões (DSButton)**

- Bordas arredondadas (4px) — padronização global de raio mais sutil
- Variantes: `contained`, `outlined`, `text`
- Hover com realce de borda / leve brilho

### **Campos de Texto (DSTextField)**

- Fundo escuro `#1f2230`
- Borda sutil
- Foco em azul vibrante
- `size="small"` como padrão

### **Cartões (DSCard)**

- Fundo: `surfaces.surface1` (ou `background.paper` no primeiro nível)
- Raio: **2px** (padrão global para cards, modais, botões - atualizado v2.1)
- Borda: `1px solid divider` (reduz dependência de sombras)
- Hover: borda muda para `primary.main` + leve elevação (shadow suave)
- Valor: foco visual neutro; variação (trend) em `success.main` ou `error.main`
- Densidade: evitar preenchimento vertical excessivo (altura mínima funcional)
- Padding: `theme.spacing(3)` (24px) para consistência com AppShell

### **Tabelas (DSTable)**

- Layout compacto, tipografia 12–13px
- Cabeçalho: `text.primary` (peso 600) sobre fundo `surfaces.surface2`
- Linhas alternadas: `surfaces.surface1`
- Hover row: `rgba(79,140,255,0.08)`
- Bordas internas: `divider` discreto
- Alinhamento numérico à direita

### **Gráficos (DSChartWrapper)**

- Suporte: `line`, `area`, `bar` (futuro: `pie`)
- Gradiente padrão: `#4f8cff → #2c5fd8` (0.25 → 0.05 opacidade)
- Tooltip: fundo `surfaces.surface2`, borda `divider`, raio 8px
- Grid: apenas linhas horizontais suaves (<=6% opacidade)
- Points: ocultar automaticamente se série > 60 pontos
- Focus/hover: stroke +1px e leve brilho

### **Cabeçalho de Página (PageHeader)**

- Título destacado
- Subtítulo em `text.secondary`
- Suporte para ações (botões, filtros)

### **Modais (Padrão DSModal)**

Padrão base para todos os modais (inclui o novo "Resumo de Comissão"):

| Aspecto        | Regra                                                                         |
| -------------- | ----------------------------------------------------------------------------- |
| Largura        | `maxWidth="sm"` (ou `xs` para casos simples); nunca full screen em desktop    |
| Canto          | Borda arredondada 4px (`borderRadius: 0.5`)                                   |
| Borda          | 1px sólido `divider` (shadow mínima)                                          |
| Fundo          | `background.paper` sem gradiente                                              |
| Título         | 16px, weight 600, espaçamento inferior curto                                  |
| Subtítulo      | `caption`, `text.secondary`, logo abaixo do título                            |
| Fechar         | `IconButton size="small"` no canto superior direito                           |
| Conteúdo       | Densidade alta; usar `Stack` e `Divider` para blocos                          |
| Ações          | Alinhadas à direita; botão primário `contained`, secundário `outlined` neutro |
| Scroll interno | `DialogContent dividers` separando header/body                                |
| Acessibilidade | `aria-labelledby` ligado ao título; roles semânticos adequados                |

Tokens de Espaçamento Interno:

```
Header: pt 16 / pr 56 (área do botão fechar)
Content: px 20 (desktop), 16 (mobile); py 8–16 por bloco
Footer: py 16, gap 8–12, alinhado à direita
```

Chips informativos (ex: "sem valores"):

```
fontSize 10px; px 6; py 2; borderRadius 4; bgcolor action.hover; color text.secondary; weight 500
```

Dividers de seção (com texto central):

```
fontSize 11px; opacity 0.8; uses <Divider textAlign="center">LABEL</Divider>
```

#### Resumo de Comissão (CommissionResumoModal)

Hierarquia:

1. Header: Título + subtítulo (contexto do período)
2. ENTRADAS: categorias positivas (verde)
3. SAÍDAS: deduções (vermelho)
4. SALDO: linha neutra com label em `text.secondary`
5. Destaques: cartões RECEBIMENTOS (verde) e DESCONTOS (vermelho) com fundo translúcido + borda
6. Ações: Exportar (CSV) + Fechar

Regras de Cor:

```
Entradas: success.main
Saídas: error.main
Recebimentos card: bg rgba(success.main, .25) + border success.main
Descontos card: bg rgba(error.main, .25) + border error.main
Saldo: valor em primary.main se positivo; error.main se negativo
```

Tipografia:

```
Labels: 13–14px / 500
Valores: 13.5–14px / 600–700
Seções (ENTRADAS/SAÍDAS): 11px uppercase 600
```

Exportação CSV: colunas `Tipo,Categoria,Valor` — filename `resumo-comissao.csv`.

Fallback sem dados: renderizar todas as categorias com `R$ 0,00` + chip "sem valores".

Não Fazer:

- Não usar <Table> para este modal.
- Não adicionar detalhes de itens ou clientes aqui.
- Não aplicar sombras profundas.

---

## 6. Padrões de Layout

### **Dashboard**

- Grid 4 colunas (desktop), 1 (mobile)
- Cards de métricas no topo
- Gráfico principal em largura total
- Tabelas compactas ao lado

### **Formulários**

- Inputs densos (`small`)
- Labels discretos
- Botões primários em azul vibrante

### **Navegação**

- Sidebar fixa (desktop)
- Sidebar colapsável (tablet)
- Drawer (mobile)

### **AppShell (Novo Padrão de Layout)**

O AppShell é o novo padrão de layout unificado que substitui o uso de `Container maxWidth="xl"` em todas as páginas protegidas.

#### **Estrutura**

```tsx
// Uso padrão em páginas protegidas
<AppShell>
  <Box sx={{ p: 3 }}>
    {/* Conteúdo da página */}
  </Box>
</AppShell>
```

#### **Tokens de Espaçamento**

| Token | Valor | Uso |
|-------|--------|-----|
| `theme.spacing(3)` | 24px | Padding padrão do conteúdo (AppShell) |
| `theme.spacing(2)` | 16px | Padding interno de cards e modais |
| `theme.spacing(1)` | 8px | Espaçamento entre elementos |
| `theme.spacing(0.5)` | 4px | Micro-espaçamento e raio de borda |

#### **Componentes Migrados**

- **Dashboard**: ✅ Migrado para AppShell
- **Clientes**: ✅ Migrado para AppShell  
- **Agenda**: ✅ Migrado para AppShell
- **Profissionais**: 🔄 Em progresso
- **Produtos**: 🔄 Em progresso
- **Serviços**: 🔄 Em progresso

#### **Diretrizes de Migração**

1. **Remover Container**: Substituir `<Container maxWidth="xl">` por `<Box sx={{ p: 3 }}>`
2. **Raio de borda**: Usar `borderRadius: 1` (4px) para cards internos
3. **Padding consistente**: Usar `theme.spacing(3)` como padrão
4. **Evitar margins**: Preferir padding do container sobre margins dos filhos

---

## 7. Acessibilidade

- Contraste mínimo **4.5:1**
- Dark mode otimizado para leitores de tela
- **ARIA labels** em ícones e botões
- **Focus ring** em azul neon (#4f8cff) para navegação via teclado (outline offset 2px)
- Ícones com `aria-label` quando ação não estiver em texto
- Garantir contraste mínimo 4.5:1 incluindo novas surfaces

---

## 8. Exemplos de Uso

```tsx
// Card de Métrica
<DSCard title="Usuários" value="14k" trend="+25%" trendUp />

// Botão
<DSButton variant="contained" size="medium">Criar Novo</DSButton>

// Tabela
<DSTable columns={[{ id: 'nome', label: 'Nome' }]} data={clientes} loading={isLoading} />

// PageHeader
<PageHeader title="Dashboard" subtitle="Visão geral do negócio" />

// AppShell com conteúdo
<AppShell>
  <Box sx={{ p: 3 }}>
    <PageHeader title="Clientes" subtitle="Gerencie seus clientes" />
    <DSCard>
      {/* Conteúdo do card */}
    </DSCard>
  </Box>
</AppShell>
```

---

## 9. Recomendações de Uso

- Sempre priorizar o **tema escuro**.
- Reutilizar os **componentes do DS** para consistência.
- Respeitar as **hierarquias tipográficas**.
- Usar gradientes de azul em gráficos para manter identidade visual.

---

## 10. Conclusão

O **Trato DS v2** é uma evolução orientada à **modernidade, acessibilidade e densidade informacional**, entregando interfaces consistentes, elegantes e responsivas.

Ele serve como **fundamento visual e técnico** para a expansão do produto, garantindo **eficiência no desenvolvimento** e **coerência na experiência do usuário**.

---

## 11. Ajustes DS v2.1

Changelog interno desta evolução de UI.

### Paleta

-- Novo background: `#0B0E13` / `#12151D`.
-- Novos tokens: `surfaces.surface1` (`#161A23`), `surfaces.surface2` (`#1C202B`).
-- `text.secondary` agora `#A0A6B5`.
-- `divider` suavizado (`rgba(255,255,255,0.08)`).

### Raio / Bordas

- Cards, modais, botões e inputs: **2px** (atualizado de 4px para design mais sutil).
- Cards internos: `borderRadius: 1` (4px) quando dentro de containers.

### AppShell & Layout

- **Novo padrão AppShell** unificado para todas as páginas protegidas
- **Remoção de Container maxWidth** - AppShell gerencia layout automaticamente
- **Padding padrão**: `theme.spacing(3)` (24px) para conteúdo principal
- **Tokens de espaçamento** documentados e padronizados

### Componentes Atualizados

- **Agenda**: Migrada para AppShell com tokens de espaçamento corretos
- **Clientes**: Migrada para AppShell com padding consistente
- **Dashboard**: Migrada para AppShell com layout otimizado
- **Raio de borda** ajustado de 3px para 2px em todos os Papers
- **Cards internos**: borderRadius 1 (4px) para hierarquia visual

### Cartões

- Fundo `surface1` por padrão, hover com realce de borda primária.

### Modais

- Baseados no padrão do CommissionResumoModal.
- Header compacto, subtítulo caption.

### Tabelas

- Alternância de linhas e hover azul translúcido.

### Gráficos

- Gradiente primário atualizado e tooltip em `surface2`.

### Chips

- Translúcidos em `action.hover`, tipografia 10px.

### Acessibilidade

- Focus ring padronizado azul neon.
- Revalidação de contraste nas novas superfícies.

### Modal de Comissão

- Export CSV padronizado: `Tipo,Categoria,Valor`.

387| Mantida filosofia Dark Mode First / Luxury & Tech / Mobile-First.

---

## 12. Sistema de Calendário e Agenda

### **Arquitetura Recomendada**

O sistema de agenda será implementado usando uma abordagem híbrida que combina **MUI Free** com **React Big Calendar** para entregar uma experiência similar ao Google Calendar, Trinks e OneBeleza.

#### **Stack Tecnológica**

```typescript
// Dependências principais
"@mui/material": "^6.5.0"           // Base do Design System
"react-big-calendar": "^1.13.0"     // Calendário principal
"date-fns": "^3.x.x"                // Manipulação de datas (já existente)

// Opcional para funcionalidades específicas
"react-datepicker": "^6.x.x"        // Seletores de data/hora customizados
```

#### **Componentes de Calendário**

| Componente | Responsabilidade | Tecnologia |
|------------|------------------|------------|
| `CalendarView` | Interface principal do calendário | React Big Calendar + MUI Theme |
| `EventRenderer` | Renderização customizada de agendamentos | MUI Components |
| `CalendarToolbar` | Barra de ferramentas (navegação, views) | MUI Buttons + Icons |
| `DateTimePicker` | Seletores de data/hora | MUI X Date Pickers (Free) |
| `EventModal` | Modal de criação/edição | MUI Dialog + Form |
| `EventDrawer` | Detalhes do agendamento | MUI Drawer |

### **Padrões Visuais para Agenda**

#### **Cores de Status**

```typescript
// Status de agendamentos
const agendaColors = {
  confirmado: theme.palette.success.main,     // Verde
  pendente: theme.palette.warning.main,      // Amarelo
  cancelado: theme.palette.error.main,       // Vermelho
  concluido: theme.palette.primary.main,     // Azul
  bloqueado: theme.palette.grey[500],        // Cinza
};
```

#### **Densidade Visual**

```typescript
// Configurações de densidade
const calendarDensity = {
  eventHeight: 24,                    // Altura mínima dos eventos
  timeSlotHeight: 40,                 // Altura dos slots de tempo
  headerHeight: 48,                   // Altura do cabeçalho
  sidebarWidth: 60,                   // Largura da coluna de horários
  eventPadding: theme.spacing(0.5),   // Padding interno dos eventos
  eventBorderRadius: 2,               // Raio de borda dos eventos
};
```

#### **Tipografia de Eventos**

```typescript
// Estilos de texto nos eventos
const eventTypography = {
  title: {
    fontSize: '12px',
    fontWeight: 600,
    lineHeight: 1.2,
    color: 'white',
  },
  subtitle: {
    fontSize: '10px',
    fontWeight: 400,
    opacity: 0.9,
    color: 'white',
  },
  time: {
    fontSize: '10px',
    fontWeight: 500,
    opacity: 0.8,
    color: 'white',
  },
};
```

### **Responsividade do Calendário**

#### **Breakpoints Específicos**

```typescript
// Views por dispositivo
const calendarViews = {
  desktop: ['month', 'week', 'day'],     // Todas as views
  tablet: ['week', 'day'],               // Sem view mensal
  mobile: ['day'],                       // Apenas view diária
};

// Configurações responsivas
const responsiveConfig = {
  xs: { // Mobile
    defaultView: 'day',
    showToolbar: false,        // Toolbar customizada
    eventHeight: 32,           // Eventos maiores
    touchGestures: true,       // Gestos de toque
  },
  md: { // Tablet
    defaultView: 'week',
    showToolbar: true,
    eventHeight: 28,
    sidebarCollapsed: true,
  },
  lg: { // Desktop
    defaultView: 'month',
    showToolbar: true,
    eventHeight: 24,
    sidebarExpanded: true,
  },
};
```

### **Integração com MUI Theme**

#### **Customização do React Big Calendar**

```scss
// Estilos SASS customizados
.rbc-calendar {
  background-color: var(--mui-palette-background-paper);
  color: var(--mui-palette-text-primary);
  border-radius: 2px;
  
  .rbc-header {
    background-color: var(--mui-palette-background-default);
    border-color: var(--mui-palette-divider);
    color: var(--mui-palette-text-secondary);
    font-weight: 600;
    font-size: 14px;
  }
  
  .rbc-event {
    border-radius: 2px;
    border: none;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    
    &.rbc-selected {
      box-shadow: 0 0 0 2px var(--mui-palette-primary-main);
    }
  }
  
  .rbc-time-slot {
    border-color: var(--mui-palette-divider);
  }
  
  .rbc-today {
    background-color: rgba(var(--mui-palette-primary-main-rgb), 0.05);
  }
}
```

### **Acessibilidade no Calendário**

#### **Navegação por Teclado**

```typescript
// Configurações de acessibilidade
const a11yConfig = {
  ariaLabels: {
    calendar: 'Calendário de agendamentos',
    event: (event) => `Agendamento: ${event.title} às ${event.start}`,
    navigation: 'Navegação do calendário',
    toolbar: 'Ferramentas do calendário',
  },
  keyboardShortcuts: {
    'ArrowLeft': 'Dia anterior',
    'ArrowRight': 'Próximo dia', 
    'ArrowUp': 'Semana anterior',
    'ArrowDown': 'Próxima semana',
    'Enter': 'Abrir detalhes do evento',
    'Escape': 'Fechar modal/drawer',
  },
  focusManagement: {
    trapFocus: true,           // Em modais
    restoreFocus: true,        // Após fechar modais
    skipLinks: true,           // Links de navegação rápida
  },
};
```

### **Performance e Otimização**

#### **Lazy Loading e Virtualization**

```typescript
// Estratégias de performance
const performanceConfig = {
  lazyLoading: {
    eventsPerPage: 100,        // Paginação de eventos
    preloadDays: 7,            // Pré-carregar 7 dias
    cacheStrategy: 'lru',      // Cache LRU para eventos
  },
  virtualization: {
    enabled: true,             // Para listas grandes
    itemHeight: 40,            // Altura fixa dos itens
    overscan: 5,               // Itens extras renderizados
  },
  debouncing: {
    searchDelay: 300,          // ms para busca
    resizeDelay: 150,          // ms para redimensionamento
  },
};
```

### **Integração com Sistema Existente**

#### **Compatibilidade com Trato DS v2.1**

- ✅ **AppShell**: Calendário integrado ao layout unificado
- ✅ **Tema Dark**: Cores e superfícies consistentes
- ✅ **Tokens de Espaçamento**: Padding e margins padronizados
- ✅ **Componentes MUI**: Botões, modais e drawers reutilizados
- ✅ **React Query**: Cache e sincronização de dados
- ✅ **Zod Validation**: Validação de formulários de agendamento

#### **Migração Gradual**

```typescript
// Fases de implementação
const migrationPhases = {
  phase1: {
    description: 'Calendário básico com eventos existentes',
    components: ['CalendarView', 'EventRenderer'],
    duration: '1 sprint',
  },
  phase2: {
    description: 'Funcionalidades avançadas (drag&drop, views)',
    components: ['CalendarToolbar', 'EventModal'],
    duration: '1 sprint',
  },
  phase3: {
    description: 'Otimizações e responsividade',
    components: ['MobileCalendar', 'PerformanceOptimizations'],
    duration: '1 sprint',
  },
};
```

### **Conclusão do Sistema de Calendário**

O sistema de agenda será a **aplicação final** do projeto, aproveitando toda a infraestrutura, Design System e padrões já estabelecidos. Esta abordagem garante:

- **Consistência Visual**: Integração perfeita com Trato DS v2.1
- **Performance Otimizada**: Uso eficiente de recursos e cache
- **Experiência Premium**: Interface comparável aos líderes de mercado
- **Manutenibilidade**: Código limpo e bem documentado
- **Acessibilidade**: Conformidade com WCAG 2.1 AA

A implementação seguirá os padrões estabelecidos no projeto, garantindo que o módulo de agenda seja robusto, escalável e alinhado com a visão técnica do sistema.
