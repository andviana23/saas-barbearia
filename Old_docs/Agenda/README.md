# Sistema de Agenda - Documentação Técnica

## 📋 Visão Geral

O **Sistema de Agenda** é o módulo final do SaaS Barbearia, projetado para oferecer uma experiência de agendamento premium comparável aos líderes de mercado (Trinks, OneBeleza) com foco em **UX otimizada**, **performance** e **integração perfeita** com o Design System existente.

## 🎯 Objetivos Estratégicos

### **Experiência do Cliente**
- Interface intuitiva similar ao Google Calendar
- Agendamento em tempo real sem conflitos
- Visualização clara de disponibilidade
- Confirmação automática via WhatsApp/Email
- **Sem SMS automático** (diferencial vs concorrentes)

### **Gestão para Profissionais**
- Dashboard unificado de agendamentos
- Controle de horários e bloqueios
- Relatórios de performance
- Integração com sistema de pagamentos
- Notificações inteligentes

### **Arquitetura Técnica**
- **Última aplicação** a ser desenvolvida
- Aproveita toda infraestrutura existente
- Design System Trato DS v2.1 consolidado
- Performance otimizada com React Query
- Responsividade mobile-first

## 🏗️ Arquitetura do Sistema

### **Stack Tecnológica**

```typescript
// Core Dependencies
"@mui/material": "^6.5.0"           // Design System base
"react-big-calendar": "^1.13.0"     // Calendário principal  
"date-fns": "^3.x.x"                // Manipulação de datas
"@tanstack/react-query": "^5.x.x"   // Estado e cache
"zod": "^3.x.x"                     // Validação de schemas

// Suporte
"react-datepicker": "^6.x.x"        // Seletores customizados
"react-hook-form": "^7.x.x"         // Formulários
"@hookform/resolvers": "^3.x.x"     // Integração Zod
```

### **Estrutura de Componentes**

```
src/components/agenda/
├── calendar/
│   ├── CalendarView.tsx           # Interface principal
│   ├── CalendarToolbar.tsx        # Navegação e filtros
│   ├── EventRenderer.tsx          # Renderização de eventos
│   └── CalendarStyles.scss        # Estilos customizados
├── events/
│   ├── EventModal.tsx             # Modal criação/edição
│   ├── EventDrawer.tsx            # Detalhes do evento
│   ├── EventForm.tsx              # Formulário de agendamento
│   └── EventStatusChip.tsx        # Status visual
├── scheduling/
│   ├── TimeSlotPicker.tsx         # Seletor de horários
│   ├── ServiceSelector.tsx        # Seleção de serviços
│   ├── ProfessionalSelector.tsx   # Seleção de profissional
│   └── AvailabilityGrid.tsx       # Grade de disponibilidade
└── mobile/
    ├── MobileCalendar.tsx         # Versão mobile otimizada
    ├── MobileEventCard.tsx        # Card de evento mobile
    └── MobileToolbar.tsx          # Toolbar mobile
```

### **Fluxo de Dados**

```typescript
// Estado global da agenda
interface AgendaState {
  // Calendário
  currentView: 'month' | 'week' | 'day';
  selectedDate: Date;
  dateRange: { start: Date; end: Date };
  
  // Eventos
  events: AgendamentoEvent[];
  selectedEvent: AgendamentoEvent | null;
  
  // Filtros
  filters: {
    profissional: string[];
    servico: string[];
    status: AgendamentoStatus[];
  };
  
  // UI
  loading: boolean;
  modalOpen: boolean;
  drawerOpen: boolean;
}

// Evento de agendamento
interface AgendamentoEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  
  // Dados do negócio
  cliente: Cliente;
  profissional: Profissional;
  servicos: Servico[];
  status: AgendamentoStatus;
  valor: number;
  
  // Metadados
  observacoes?: string;
  created_at: Date;
  updated_at: Date;
}
```

## 🔄 Integração com Sistema Existente

### **Aproveitamento da Infraestrutura**

| Módulo | Reutilização | Benefício |
|--------|--------------|-----------|
| **AppShell** | Layout unificado | Navegação consistente |
| **Tema MUI** | Cores e tipografia | Identidade visual |
| **React Query** | Cache e sincronização | Performance otimizada |
| **Supabase** | Banco de dados | Dados em tempo real |
| **Zod Schemas** | Validação | Tipagem segura |
| **Componentes** | Botões, modais, forms | Desenvolvimento ágil |

### **APIs Existentes Utilizadas**

```typescript
// Endpoints reutilizados
const agendaAPIs = {
  // Já implementados
  clientes: '/api/clientes',
  profissionais: '/api/profissionais', 
  servicos: '/api/servicos',
  
  // Novos para agenda
  agendamentos: '/api/agendamentos',
  disponibilidade: '/api/disponibilidade',
  bloqueios: '/api/bloqueios',
  configuracoes: '/api/agenda/configuracoes',
};
```

## 📱 Responsividade e UX

### **Estratégia Mobile-First**

#### **Breakpoints Específicos**
- **Mobile (xs)**: View diária, gestos de toque, toolbar simplificada
- **Tablet (md)**: View semanal, sidebar colapsável, touch + mouse
- **Desktop (lg+)**: View mensal, todas as funcionalidades, sidebar expandida

#### **Otimizações por Dispositivo**

```typescript
const responsiveFeatures = {
  mobile: {
    defaultView: 'day',
    touchGestures: ['swipe', 'pinch', 'tap'],
    eventHeight: 32,
    toolbarPosition: 'bottom',
    quickActions: ['novo', 'buscar', 'filtros'],
  },
  
  tablet: {
    defaultView: 'week', 
    splitView: true,        // Lista + calendário
    dragAndDrop: true,
    eventHeight: 28,
    sidebarCollapsed: true,
  },
  
  desktop: {
    defaultView: 'month',
    multiSelect: true,
    keyboardShortcuts: true,
    eventHeight: 24,
    sidebarExpanded: true,
    bulkActions: true,
  },
};
```

## 🎨 Design System Integration

### **Componentes Visuais**

#### **Cores de Status**
```scss
// Paleta de status dos agendamentos
$agenda-colors: (
  confirmado: var(--mui-palette-success-main),    // #4caf50
  pendente: var(--mui-palette-warning-main),      // #ff9800  
  cancelado: var(--mui-palette-error-main),       // #f44336
  concluido: var(--mui-palette-primary-main),     // #1976d2
  bloqueado: var(--mui-palette-grey-500),         // #9e9e9e
  reagendado: var(--mui-palette-info-main),       // #2126f1
);
```

#### **Densidade Visual**
```scss
// Configurações de layout
$calendar-density: (
  event-height: 24px,
  time-slot-height: 40px,
  header-height: 48px,
  sidebar-width: 60px,
  event-padding: 4px,
  event-border-radius: 2px,
  event-shadow: 0 1px 3px rgba(0,0,0,0.2),
);
```

### **Tipografia Especializada**

```typescript
// Estilos de texto nos eventos
const eventTypography = {
  title: {
    fontSize: '12px',
    fontWeight: 600,
    lineHeight: 1.2,
    color: 'white',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
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
    fontFamily: 'monospace',
  },
};
```

## 🚀 Performance e Otimização

### **Estratégias de Performance**

#### **Lazy Loading**
```typescript
const performanceConfig = {
  // Paginação inteligente
  eventsPerPage: 100,
  preloadDays: 7,           // Pré-carregar semana
  cacheStrategy: 'lru',     // Cache LRU para eventos
  
  // Virtualization para listas grandes
  virtualization: {
    enabled: true,
    itemHeight: 40,
    overscan: 5,
  },
  
  // Debouncing
  searchDelay: 300,         // ms para busca
  resizeDelay: 150,         // ms para redimensionamento
  filterDelay: 200,         // ms para filtros
};
```

#### **Otimização de Queries**

```typescript
// React Query configurações
const queryConfig = {
  staleTime: 5 * 60 * 1000,    // 5 minutos
  cacheTime: 10 * 60 * 1000,   // 10 minutos
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  
  // Queries específicas
  agendamentos: {
    queryKey: ['agendamentos', dateRange, filters],
    refetchInterval: 30000,     // 30s para dados em tempo real
  },
  
  disponibilidade: {
    queryKey: ['disponibilidade', profissional, date],
    staleTime: 2 * 60 * 1000,   // 2 minutos
  },
};
```

## 🔐 Segurança e Validação

### **Schemas de Validação**

```typescript
// Zod schemas para agendamento
const AgendamentoSchema = z.object({
  cliente_id: z.string().uuid(),
  profissional_id: z.string().uuid(),
  servicos: z.array(z.string().uuid()).min(1),
  data_inicio: z.date(),
  data_fim: z.date(),
  observacoes: z.string().max(500).optional(),
  status: z.enum(['pendente', 'confirmado', 'cancelado', 'concluido']),
});

// Validação de conflitos
const ConflictValidationSchema = z.object({
  profissional_id: z.string().uuid(),
  data_inicio: z.date(),
  data_fim: z.date(),
  agendamento_id: z.string().uuid().optional(), // Para edições
});
```

### **Controle de Acesso**

```typescript
// Permissões por tipo de usuário
const agendaPermissions = {
  admin: ['create', 'read', 'update', 'delete', 'bulk_actions'],
  manager: ['create', 'read', 'update', 'cancel'],
  profissional: ['read', 'update_own', 'block_time'],
  cliente: ['read_own', 'create_own', 'cancel_own'],
};
```

## 📊 Métricas e Analytics

### **KPIs do Sistema**

```typescript
// Métricas de performance
const agendaMetrics = {
  // Performance técnica
  loadTime: 'Tempo de carregamento < 2s',
  renderTime: 'Renderização < 100ms',
  memoryUsage: 'Uso de memória < 50MB',
  
  // UX
  clickToBook: 'Agendamento em < 3 cliques',
  mobileUsability: 'Score > 95 no Lighthouse',
  errorRate: 'Taxa de erro < 1%',
  
  // Negócio
  conversionRate: 'Taxa de conversão de agendamentos',
  cancellationRate: 'Taxa de cancelamento',
  rebookingRate: 'Taxa de reagendamento',
};
```

## 🔄 Roadmap de Implementação

### **Fase 1: Fundação (Sprint 1)**
- ✅ Estrutura base de componentes
- ✅ Integração com React Big Calendar
- ✅ Tema MUI customizado
- ✅ CRUD básico de agendamentos

### **Fase 2: Funcionalidades Core (Sprint 2)**
- 🔄 Drag & drop de eventos
- 🔄 Validação de conflitos em tempo real
- 🔄 Modal de criação/edição
- 🔄 Filtros e busca

### **Fase 3: UX Avançada (Sprint 3)**
- ⏳ Responsividade mobile otimizada
- ⏳ Gestos de toque
- ⏳ Notificações push
- ⏳ Atalhos de teclado

### **Fase 4: Performance (Sprint 4)**
- ⏳ Lazy loading e virtualization
- ⏳ Cache otimizado
- ⏳ Bundle splitting
- ⏳ Métricas de performance

## 📚 Próximos Documentos

Esta documentação será complementada pelos seguintes arquivos:

1. **[Fluxos de Agendamento](./FLUXOS.md)** - Jornadas do usuário detalhadas
2. **[Especificação de Componentes](./COMPONENTES.md)** - Props, APIs e exemplos
3. **[Guia de Implementação](./IMPLEMENTACAO.md)** - Passos técnicos detalhados
4. **[Testes e Qualidade](./TESTES.md)** - Estratégias de teste e QA

---

**Última atualização**: Janeiro 2025  
**Versão**: 1.0.0  
**Status**: Em desenvolvimento  
**Responsável**: Equipe de Desenvolvimento