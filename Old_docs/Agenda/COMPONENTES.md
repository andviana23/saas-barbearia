# Especificação Técnica de Componentes - Sistema de Agenda

## 📋 Visão Geral

Este documento especifica **todos os componentes** do Sistema de Agenda, incluindo props, APIs, exemplos de uso e padrões de implementação baseados no **Trato DS v2.1**.

## 🏗️ Arquitetura de Componentes

### **Hierarquia de Componentes**

```
AgendaModule/
├── CalendarView/              # Container principal
│   ├── CalendarToolbar/       # Navegação e filtros
│   ├── CalendarGrid/          # Grid do calendário
│   └── CalendarSidebar/       # Sidebar com informações
├── EventComponents/           # Componentes de eventos
│   ├── EventRenderer/         # Renderização de eventos
│   ├── EventModal/            # Modal de criação/edição
│   ├── EventDrawer/           # Detalhes do evento
│   └── EventStatusChip/       # Status visual
├── SchedulingComponents/      # Componentes de agendamento
│   ├── TimeSlotPicker/        # Seletor de horários
│   ├── ServiceSelector/       # Seleção de serviços
│   ├── ProfessionalSelector/  # Seleção de profissional
│   └── AvailabilityGrid/      # Grade de disponibilidade
└── MobileComponents/          # Versões mobile
    ├── MobileCalendar/        # Calendário mobile
    ├── MobileEventCard/       # Card de evento mobile
    └── MobileToolbar/         # Toolbar mobile
```

---

## 📅 CalendarView - Componente Principal

### **Interface e Props**

```typescript
interface CalendarViewProps {
  // Configuração básica
  view?: 'month' | 'week' | 'day';
  date?: Date;
  events?: AgendamentoEvent[];
  
  // Configurações de exibição
  showToolbar?: boolean;
  showSidebar?: boolean;
  height?: number | string;
  
  // Filtros
  filters?: CalendarFilters;
  
  // Callbacks
  onSelectEvent?: (event: AgendamentoEvent) => void;
  onSelectSlot?: (slotInfo: SlotInfo) => void;
  onNavigate?: (date: Date, view: string) => void;
  onViewChange?: (view: string) => void;
  
  // Customização
  eventRenderer?: (event: AgendamentoEvent) => React.ReactNode;
  toolbarRenderer?: () => React.ReactNode;
  
  // Estados
  loading?: boolean;
  error?: string;
}

interface CalendarFilters {
  profissionais?: string[];
  servicos?: string[];
  status?: AgendamentoStatus[];
  dateRange?: { start: Date; end: Date };
}

interface SlotInfo {
  start: Date;
  end: Date;
  slots: Date[];
  action: 'select' | 'click' | 'doubleClick';
}
```

### **Exemplo de Uso**

```tsx
import { CalendarView } from '@/components/agenda/calendar/CalendarView';

function AgendaPage() {
  const [view, setView] = useState<'month' | 'week' | 'day'>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filters, setFilters] = useState<CalendarFilters>({});
  
  const { data: events, isLoading } = useAgendamentos({
    date: selectedDate,
    view,
    filters,
  });

  const handleSelectEvent = (event: AgendamentoEvent) => {
    // Abrir modal de detalhes
    setSelectedEvent(event);
    setEventModalOpen(true);
  };

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    // Criar novo agendamento
    setNewEventData({
      start: slotInfo.start,
      end: slotInfo.end,
    });
    setEventModalOpen(true);
  };

  return (
    <CalendarView
      view={view}
      date={selectedDate}
      events={events}
      loading={isLoading}
      filters={filters}
      onSelectEvent={handleSelectEvent}
      onSelectSlot={handleSelectSlot}
      onNavigate={setSelectedDate}
      onViewChange={setView}
      height="calc(100vh - 200px)"
    />
  );
}
```

### **Customização de Tema**

```scss
// calendar-theme.scss
.calendar-view {
  --calendar-bg: var(--mui-palette-background-paper);
  --calendar-border: var(--mui-palette-divider);
  --calendar-text: var(--mui-palette-text-primary);
  --calendar-header-bg: var(--mui-palette-background-default);
  
  .rbc-calendar {
    background-color: var(--calendar-bg);
    border: 1px solid var(--calendar-border);
    border-radius: 2px;
    
    .rbc-header {
      background-color: var(--calendar-header-bg);
      border-bottom: 1px solid var(--calendar-border);
      color: var(--calendar-text);
      font-weight: 600;
      padding: 12px 8px;
    }
    
    .rbc-time-slot {
      border-top: 1px solid var(--calendar-border);
      
      &.rbc-now {
        background-color: rgba(var(--mui-palette-primary-main-rgb), 0.05);
      }
    }
    
    .rbc-today {
      background-color: rgba(var(--mui-palette-primary-main-rgb), 0.08);
    }
  }
}
```

---

## 🎯 EventRenderer - Renderização de Eventos

### **Interface e Props**

```typescript
interface EventRendererProps {
  event: AgendamentoEvent;
  view: 'month' | 'week' | 'day';
  selected?: boolean;
  
  // Customização
  showDetails?: boolean;
  compact?: boolean;
  
  // Callbacks
  onClick?: (event: AgendamentoEvent) => void;
  onDoubleClick?: (event: AgendamentoEvent) => void;
  onContextMenu?: (event: AgendamentoEvent, e: React.MouseEvent) => void;
}

interface AgendamentoEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  
  // Dados do negócio
  cliente: {
    id: string;
    nome: string;
    telefone: string;
    avatar?: string;
  };
  profissional: {
    id: string;
    nome: string;
    avatar?: string;
  };
  servicos: Array<{
    id: string;
    nome: string;
    duracao: number;
    valor: number;
  }>;
  status: AgendamentoStatus;
  valor_total: number;
  
  // Metadados
  observacoes?: string;
  created_at: Date;
  updated_at: Date;
}

enum AgendamentoStatus {
  PENDENTE = 'pendente',
  CONFIRMADO = 'confirmado',
  EM_ANDAMENTO = 'em_andamento',
  CONCLUIDO = 'concluido',
  CANCELADO = 'cancelado',
  NAO_COMPARECEU = 'nao_compareceu',
  REAGENDADO = 'reagendado'
}
```

### **Implementação**

```tsx
import { Box, Typography, Chip, Avatar, Tooltip } from '@mui/material';
import { EventRenderer } from '@/components/agenda/events/EventRenderer';

const EventRenderer: React.FC<EventRendererProps> = ({
  event,
  view,
  selected = false,
  showDetails = true,
  compact = false,
  onClick,
  onDoubleClick,
  onContextMenu,
}) => {
  const statusColors = {
    pendente: 'warning',
    confirmado: 'success',
    em_andamento: 'info',
    concluido: 'primary',
    cancelado: 'error',
    nao_compareceu: 'error',
    reagendado: 'info',
  } as const;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = () => {
    const diff = event.end.getTime() - event.start.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h${remainingMinutes > 0 ? ` ${remainingMinutes}m` : ''}`;
    }
    return `${minutes}m`;
  };

  return (
    <Tooltip
      title={
        <Box>
          <Typography variant="subtitle2">{event.cliente.nome}</Typography>
          <Typography variant="body2">
            {formatTime(event.start)} - {formatTime(event.end)} ({formatDuration()})
          </Typography>
          <Typography variant="body2">
            {event.servicos.map(s => s.nome).join(', ')}
          </Typography>
          <Typography variant="body2">
            R$ {event.valor_total.toFixed(2)}
          </Typography>
          {event.observacoes && (
            <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
              {event.observacoes}
            </Typography>
          )}
        </Box>
      }
      arrow
      placement="top"
    >
      <Box
        className={`event-renderer ${selected ? 'selected' : ''}`}
        onClick={() => onClick?.(event)}
        onDoubleClick={() => onDoubleClick?.(event)}
        onContextMenu={(e) => onContextMenu?.(event, e)}
        sx={{
          p: compact ? 0.5 : 1,
          borderRadius: 1,
          cursor: 'pointer',
          backgroundColor: `${statusColors[event.status]}.main`,
          color: 'white',
          border: selected ? 2 : 0,
          borderColor: 'primary.main',
          '&:hover': {
            opacity: 0.9,
            transform: 'scale(1.02)',
          },
          transition: 'all 0.2s ease-in-out',
        }}
      >
        {/* Header com avatar e status */}
        <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
          <Avatar
            src={event.cliente.avatar}
            sx={{ width: 16, height: 16, fontSize: '10px' }}
          >
            {event.cliente.nome.charAt(0)}
          </Avatar>
          <Chip
            label={event.status}
            size="small"
            variant="outlined"
            sx={{
              height: 16,
              fontSize: '8px',
              color: 'white',
              borderColor: 'rgba(255,255,255,0.5)',
            }}
          />
        </Box>

        {/* Título principal */}
        <Typography
          variant="caption"
          fontWeight={600}
          sx={{
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            lineHeight: 1.2,
          }}
        >
          {event.cliente.nome}
        </Typography>

        {/* Detalhes (se não compacto) */}
        {!compact && showDetails && (
          <>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                opacity: 0.9,
                fontSize: '10px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {event.servicos[0]?.nome}
              {event.servicos.length > 1 && ` +${event.servicos.length - 1}`}
            </Typography>

            <Typography
              variant="caption"
              sx={{
                display: 'block',
                opacity: 0.8,
                fontSize: '9px',
                fontFamily: 'monospace',
              }}
            >
              {formatTime(event.start)} - {formatTime(event.end)}
            </Typography>
          </>
        )}
      </Box>
    </Tooltip>
  );
};
```

---

## 🛠️ EventModal - Modal de Criação/Edição

### **Interface e Props**

```typescript
interface EventModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  event?: Partial<AgendamentoEvent>;
  initialData?: {
    start?: Date;
    end?: Date;
    profissional_id?: string;
  };
  
  // Callbacks
  onClose: () => void;
  onSave: (data: AgendamentoFormData) => Promise<void>;
  onDelete?: (eventId: string) => Promise<void>;
  
  // Configurações
  allowDelete?: boolean;
  loading?: boolean;
}

interface AgendamentoFormData {
  cliente_id: string;
  profissional_id: string;
  servicos: string[];
  data_inicio: Date;
  data_fim: Date;
  observacoes?: string;
  status: AgendamentoStatus;
}
```

### **Implementação**

```tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Divider,
  Alert,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const agendamentoSchema = z.object({
  cliente_id: z.string().min(1, 'Cliente é obrigatório'),
  profissional_id: z.string().min(1, 'Profissional é obrigatório'),
  servicos: z.array(z.string()).min(1, 'Pelo menos um serviço é obrigatório'),
  data_inicio: z.date(),
  data_fim: z.date(),
  observacoes: z.string().optional(),
  status: z.nativeEnum(AgendamentoStatus),
}).refine((data) => data.data_fim > data.data_inicio, {
  message: 'Data de fim deve ser posterior à data de início',
  path: ['data_fim'],
});

const EventModal: React.FC<EventModalProps> = ({
  open,
  mode,
  event,
  initialData,
  onClose,
  onSave,
  onDelete,
  allowDelete = false,
  loading = false,
}) => {
  const { data: clientes } = useClientes();
  const { data: profissionais } = useProfissionais();
  const { data: servicos } = useServicos();
  
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    reset,
  } = useForm<AgendamentoFormData>({
    resolver: zodResolver(agendamentoSchema),
    defaultValues: {
      cliente_id: event?.cliente?.id || '',
      profissional_id: event?.profissional?.id || initialData?.profissional_id || '',
      servicos: event?.servicos?.map(s => s.id) || [],
      data_inicio: event?.start || initialData?.start || new Date(),
      data_fim: event?.end || initialData?.end || new Date(),
      observacoes: event?.observacoes || '',
      status: event?.status || AgendamentoStatus.PENDENTE,
    },
  });

  const watchedServicos = watch('servicos');
  const watchedProfissional = watch('profissional_id');

  // Calcular duração e valor total
  const { duracao_total, valor_total } = useMemo(() => {
    const servicosSelecionados = servicos?.filter(s => 
      watchedServicos.includes(s.id)
    ) || [];
    
    return {
      duracao_total: servicosSelecionados.reduce((acc, s) => acc + s.duracao, 0),
      valor_total: servicosSelecionados.reduce((acc, s) => acc + s.valor, 0),
    };
  }, [watchedServicos, servicos]);

  // Atualizar data de fim automaticamente
  useEffect(() => {
    if (duracao_total > 0) {
      const dataInicio = watch('data_inicio');
      const dataFim = new Date(dataInicio.getTime() + duracao_total * 60000);
      setValue('data_fim', dataFim);
    }
  }, [duracao_total, watch, setValue]);

  const handleSaveClick = async (data: AgendamentoFormData) => {
    try {
      await onSave(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
    }
  };

  const handleDeleteClick = async () => {
    if (event?.id && onDelete) {
      try {
        await onDelete(event.id);
        onClose();
      } catch (error) {
        console.error('Erro ao deletar agendamento:', error);
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '600px' }
      }}
    >
      <DialogTitle>
        {mode === 'create' ? 'Novo Agendamento' : 'Editar Agendamento'}
      </DialogTitle>

      <DialogContent>
        <Box component="form" sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {/* Cliente */}
            <Grid item xs={12} md={6}>
              <Controller
                name="cliente_id"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    options={clientes || []}
                    getOptionLabel={(option) => 
                      typeof option === 'string' 
                        ? clientes?.find(c => c.id === option)?.nome || ''
                        : option.nome
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Cliente"
                        error={!!errors.cliente_id}
                        helperText={errors.cliente_id?.message}
                        required
                      />
                    )}
                    onChange={(_, value) => field.onChange(value?.id || '')}
                    value={clientes?.find(c => c.id === field.value) || null}
                  />
                )}
              />
            </Grid>

            {/* Profissional */}
            <Grid item xs={12} md={6}>
              <Controller
                name="profissional_id"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.profissional_id}>
                    <InputLabel>Profissional *</InputLabel>
                    <Select {...field} label="Profissional *">
                      {profissionais?.map((prof) => (
                        <MenuItem key={prof.id} value={prof.id}>
                          {prof.nome}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Serviços */}
            <Grid item xs={12}>
              <Controller
                name="servicos"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    multiple
                    options={servicos || []}
                    getOptionLabel={(option) => option.nome}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Serviços"
                        error={!!errors.servicos}
                        helperText={errors.servicos?.message}
                        required
                      />
                    )}
                    onChange={(_, value) => 
                      field.onChange(value.map(v => v.id))
                    }
                    value={servicos?.filter(s => field.value.includes(s.id)) || []}
                  />
                )}
              />
            </Grid>

            {/* Data e Hora */}
            <Grid item xs={12} md={6}>
              <Controller
                name="data_inicio"
                control={control}
                render={({ field }) => (
                  <DateTimePicker
                    {...field}
                    label="Data e Hora de Início"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.data_inicio,
                        helperText: errors.data_inicio?.message,
                      },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="data_fim"
                control={control}
                render={({ field }) => (
                  <DateTimePicker
                    {...field}
                    label="Data e Hora de Fim"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.data_fim,
                        helperText: errors.data_fim?.message,
                      },
                    }}
                  />
                )}
              />
            </Grid>

            {/* Status */}
            <Grid item xs={12} md={6}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select {...field} label="Status">
                      {Object.values(AgendamentoStatus).map((status) => (
                        <MenuItem key={status} value={status}>
                          {status.replace('_', ' ').toUpperCase()}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Observações */}
            <Grid item xs={12}>
              <Controller
                name="observacoes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Observações"
                    multiline
                    rows={3}
                    fullWidth
                    placeholder="Observações adicionais sobre o agendamento..."
                  />
                )}
              />
            </Grid>

            {/* Resumo */}
            {duracao_total > 0 && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    Resumo do Agendamento
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Duração Total:
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {Math.floor(duracao_total / 60)}h {duracao_total % 60}m
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Valor Total:
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        R$ {valor_total.toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        {mode === 'edit' && allowDelete && (
          <Button
            onClick={handleDeleteClick}
            color="error"
            variant="outlined"
            disabled={loading}
          >
            Excluir
          </Button>
        )}
        
        <Box sx={{ flex: 1 }} />
        
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        
        <Button
          onClick={handleSubmit(handleSaveClick)}
          variant="contained"
          disabled={!isValid || loading}
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

---

## 📱 MobileCalendar - Versão Mobile

### **Interface e Props**

```typescript
interface MobileCalendarProps {
  events: AgendamentoEvent[];
  selectedDate: Date;
  
  // Configurações mobile
  enableSwipe?: boolean;
  enablePullToRefresh?: boolean;
  showMiniCalendar?: boolean;
  
  // Callbacks
  onDateChange: (date: Date) => void;
  onEventSelect: (event: AgendamentoEvent) => void;
  onSlotSelect: (slot: { start: Date; end: Date }) => void;
  onRefresh?: () => Promise<void>;
  
  // Estados
  loading?: boolean;
  refreshing?: boolean;
}
```

### **Implementação**

```tsx
import { Box, Typography, Card, Fab, SwipeableDrawer } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useSwipeable } from 'react-swipeable';

const MobileCalendar: React.FC<MobileCalendarProps> = ({
  events,
  selectedDate,
  enableSwipe = true,
  enablePullToRefresh = true,
  showMiniCalendar = false,
  onDateChange,
  onEventSelect,
  onSlotSelect,
  onRefresh,
  loading = false,
  refreshing = false,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendamentoEvent | null>(null);

  // Gerar dias para swipe
  const days = useMemo(() => {
    const result = [];
    for (let i = -7; i <= 7; i++) {
      const date = new Date(selectedDate);
      date.setDate(date.getDate() + i);
      result.push(date);
    }
    return result;
  }, [selectedDate]);

  // Handlers de swipe
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      onDateChange(nextDay);
    },
    onSwipedRight: () => {
      const prevDay = new Date(selectedDate);
      prevDay.setDate(prevDay.getDate() - 1);
      onDateChange(prevDay);
    },
    trackMouse: true,
  });

  // Eventos do dia selecionado
  const dayEvents = useMemo(() => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === selectedDate.toDateString();
    }).sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [events, selectedDate]);

  // Gerar slots de horário
  const timeSlots = useMemo(() => {
    const slots = [];
    const startHour = 8; // 8:00
    const endHour = 20; // 20:00
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotStart = new Date(selectedDate);
        slotStart.setHours(hour, minute, 0, 0);
        
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + 30);
        
        slots.push({ start: slotStart, end: slotEnd });
      }
    }
    
    return slots;
  }, [selectedDate]);

  const handleEventClick = (event: AgendamentoEvent) => {
    setSelectedEvent(event);
    setDrawerOpen(true);
    onEventSelect(event);
  };

  const handleSlotClick = (slot: { start: Date; end: Date }) => {
    // Verificar se slot está ocupado
    const isOccupied = dayEvents.some(event => 
      event.start <= slot.start && event.end > slot.start
    );
    
    if (!isOccupied) {
      onSlotSelect(slot);
    }
  };

  return (
    <Box
      {...(enableSwipe ? swipeHandlers : {})}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header com data */}
      <Box
        sx={{
          p: 2,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          textAlign: 'center',
        }}
      >
        <Typography variant="h6">
          {selectedDate.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          {dayEvents.length} agendamento{dayEvents.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {/* Lista de horários */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 1,
        }}
      >
        {timeSlots.map((slot, index) => {
          const slotEvents = dayEvents.filter(event =>
            event.start <= slot.start && event.end > slot.start
          );
          
          const isOccupied = slotEvents.length > 0;
          
          return (
            <Box
              key={index}
              onClick={() => handleSlotClick(slot)}
              sx={{
                display: 'flex',
                minHeight: 60,
                borderBottom: '1px solid',
                borderColor: 'divider',
                cursor: isOccupied ? 'default' : 'pointer',
                '&:hover': !isOccupied ? {
                  bgcolor: 'action.hover',
                } : {},
              }}
            >
              {/* Coluna de horário */}
              <Box
                sx={{
                  width: 80,
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'background.default',
                  borderRight: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    color: 'text.secondary',
                  }}
                >
                  {slot.start.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Typography>
              </Box>

              {/* Coluna de eventos */}
              <Box sx={{ flex: 1, p: 1 }}>
                {slotEvents.map((event) => (
                  <Card
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventClick(event);
                    }}
                    sx={{
                      p: 1,
                      mb: 0.5,
                      cursor: 'pointer',
                      bgcolor: `${getStatusColor(event.status)}.main`,
                      color: 'white',
                      '&:hover': {
                        opacity: 0.9,
                      },
                    }}
                  >
                    <Typography variant="body2" fontWeight={600}>
                      {event.cliente.nome}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      {event.servicos[0]?.nome}
                      {event.servicos.length > 1 && ` +${event.servicos.length - 1}`}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        fontFamily: 'monospace',
                        opacity: 0.8,
                      }}
                    >
                      {event.start.toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })} - {event.end.toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                  </Card>
                ))}
                
                {!isOccupied && (
                  <Box
                    sx={{
                      height: '100%',
                      minHeight: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'text.disabled',
                      fontSize: '12px',
                    }}
                  >
                    Toque para agendar
                  </Box>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* FAB para novo agendamento */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={() => onSlotSelect({
          start: new Date(selectedDate.getTime()),
          end: new Date(selectedDate.getTime() + 30 * 60000),
        })}
      >
        <AddIcon />
      </Fab>

      {/* Drawer de detalhes do evento */}
      <SwipeableDrawer
        anchor="bottom"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpen={() => setDrawerOpen(true)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: '80vh',
          },
        }}
      >
        {selectedEvent && (
          <EventDrawer
            event={selectedEvent}
            onClose={() => setDrawerOpen(false)}
          />
        )}
      </SwipeableDrawer>
    </Box>
  );
};

// Função auxiliar para cores de status
function getStatusColor(status: AgendamentoStatus) {
  const colors = {
    pendente: 'warning',
    confirmado: 'success',
    em_andamento: 'info',
    concluido: 'primary',
    cancelado: 'error',
    nao_compareceu: 'error',
    reagendado: 'info',
  };
  return colors[status] || 'grey';
}
```

---

## 🎛️ CalendarToolbar - Barra de Ferramentas

### **Interface e Props**

```typescript
interface CalendarToolbarProps {
  // Estado atual
  view: 'month' | 'week' | 'day';
  date: Date;
  
  // Configurações
  availableViews?: Array<'month' | 'week' | 'day'>;
  showFilters?: boolean;
  showSearch?: boolean;
  
  // Filtros
  filters?: CalendarFilters;
  
  // Callbacks
  onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void;
  onViewChange: (view: 'month' | 'week' | 'day') => void;
  onFiltersChange?: (filters: CalendarFilters) => void;
  onSearch?: (query: string) => void;
  
  // Ações
  onNewEvent?: () => void;
  onExport?: () => void;
  onRefresh?: () => void;
}
```

### **Implementação**

```tsx
import {
  Box,
  Button,
  ButtonGroup,
  IconButton,
  TextField,
  Autocomplete,
  Chip,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Today,
  Add,
  FilterList,
  Search,
  FileDownload,
  Refresh,
} from '@mui/icons-material';

const CalendarToolbar: React.FC<CalendarToolbarProps> = ({
  view,
  date,
  availableViews = ['month', 'week', 'day'],
  showFilters = true,
  showSearch = true,
  filters,
  onNavigate,
  onViewChange,
  onFiltersChange,
  onSearch,
  onNewEvent,
  onExport,
  onRefresh,
}) => {
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: profissionais } = useProfissionais();
  const { data: servicos } = useServicos();

  const formatDateLabel = () => {
    switch (view) {
      case 'month':
        return date.toLocaleDateString('pt-BR', {
          month: 'long',
          year: 'numeric',
        });
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        return `${weekStart.getDate()} - ${weekEnd.getDate()} de ${weekStart.toLocaleDateString('pt-BR', {
          month: 'long',
          year: 'numeric',
        })}`;
      case 'day':
        return date.toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      default:
        return '';
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const handleFilterChange = (key: keyof CalendarFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange?.(newFilters);
  };

  const getActiveFiltersCount = () => {
    if (!filters) return 0;
    
    let count = 0;
    if (filters.profissionais?.length) count++;
    if (filters.servicos?.length) count++;
    if (filters.status?.length) count++;
    if (filters.dateRange) count++;
    
    return count;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        flexWrap: 'wrap',
      }}
    >
      {/* Navegação de data */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton onClick={() => onNavigate('PREV')} size="small">
          <ChevronLeft />
        </IconButton>
        
        <Button
          onClick={() => onNavigate('TODAY')}
          startIcon={<Today />}
          variant="outlined"
          size="small"
        >
          Hoje
        </Button>
        
        <IconButton onClick={() => onNavigate('NEXT')} size="small">
          <ChevronRight />
        </IconButton>
      </Box>

      {/* Label da data atual */}
      <Box sx={{ minWidth: 200 }}>
        <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
          {formatDateLabel()}
        </Typography>
      </Box>

      {/* Seletor de view */}
      <ButtonGroup size="small" variant="outlined">
        {availableViews.map((viewOption) => (
          <Button
            key={viewOption}
            variant={view === viewOption ? 'contained' : 'outlined'}
            onClick={() => onViewChange(viewOption)}
          >
            {viewOption === 'month' && 'Mês'}
            {viewOption === 'week' && 'Semana'}
            {viewOption === 'day' && 'Dia'}
          </Button>
        ))}
      </ButtonGroup>

      {/* Busca */}
      {showSearch && (
        <TextField
          size="small"
          placeholder="Buscar agendamentos..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{ minWidth: 200 }}
        />
      )}

      {/* Spacer */}
      <Box sx={{ flex: 1 }} />

      {/* Filtros */}
      {showFilters && (
        <>
          <Button
            startIcon={<FilterList />}
            onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
            variant={getActiveFiltersCount() > 0 ? 'contained' : 'outlined'}
            size="small"
          >
            Filtros
            {getActiveFiltersCount() > 0 && (
              <Chip
                label={getActiveFiltersCount()}
                size="small"
                sx={{ ml: 1, height: 20 }}
              />
            )}
          </Button>

          <Menu
            anchorEl={filterMenuAnchor}
            open={Boolean(filterMenuAnchor)}
            onClose={() => setFilterMenuAnchor(null)}
            PaperProps={{ sx: { minWidth: 300, p: 2 } }}
          >
            {/* Filtro por profissional */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Profissionais
              </Typography>
              <Autocomplete
                multiple
                size="small"
                options={profissionais || []}
                getOptionLabel={(option) => option.nome}
                value={profissionais?.filter(p => 
                  filters?.profissionais?.includes(p.id)
                ) || []}
                onChange={(_, value) => 
                  handleFilterChange('profissionais', value.map(v => v.id))
                }
                renderInput={(params) => (
                  <TextField {...params} placeholder="Selecionar profissionais" />
                )}
              />
            </Box>

            {/* Filtro por serviço */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Serviços
              </Typography>
              <Autocomplete
                multiple
                size="small"
                options={servicos || []}
                getOptionLabel={(option) => option.nome}
                value={servicos?.filter(s => 
                  filters?.servicos?.includes(s.id)
                ) || []}
                onChange={(_, value) => 
                  handleFilterChange('servicos', value.map(v => v.id))
                }
                renderInput={(params) => (
                  <TextField {...params} placeholder="Selecionar serviços" />
                )}
              />
            </Box>

            {/* Filtro por status */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Status
              </Typography>
              <Autocomplete
                multiple
                size="small"
                options={Object.values(AgendamentoStatus)}
                getOptionLabel={(option) => option.replace('_', ' ').toUpperCase()}
                value={filters?.status || []}
                onChange={(_, value) => handleFilterChange('status', value)}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Selecionar status" />
                )}
              />
            </Box>

            <Divider sx={{ my: 1 }} />

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                onClick={() => {
                  onFiltersChange?.({});
                  setFilterMenuAnchor(null);
                }}
              >
                Limpar
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={() => setFilterMenuAnchor(null)}
              >
                Aplicar
              </Button>
            </Box>
          </Menu>
        </>
      )}

      {/* Ações */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        {onRefresh && (
          <IconButton onClick={onRefresh} size="small">
            <Refresh />
          </IconButton>
        )}
        
        {onExport && (
          <IconButton onClick={onExport} size="small">
            <FileDownload />
          </IconButton>
        )}
        
        {onNewEvent && (
          <Button
            startIcon={<Add />}
            onClick={onNewEvent}
            variant="contained"
            size="small"
          >
            Novo
          </Button>
        )}
      </Box>
    </Box>
  );
};
```

---

## 📊 Hooks Customizados

### **useAgendamentos**

```typescript
interface UseAgendamentosParams {
  date?: Date;
  view?: 'month' | 'week' | 'day';
  filters?: CalendarFilters;
  enabled?: boolean;
}

function useAgendamentos(params: UseAgendamentosParams = {}) {
  const { date = new Date(), view = 'week', filters, enabled = true } = params;

  // Calcular range de datas baseado na view
  const dateRange = useMemo(() => {
    const start = new Date(date);
    const end = new Date(date);

    switch (view) {
      case 'month':
        start.setDate(1);
        end.setMonth(end.getMonth() + 1, 0);
        break;
      case 'week':
        start.setDate(date.getDate() - date.getDay());
        end.setDate(start.getDate() + 6);
        break;
      case 'day':
        end.setDate(end.getDate() + 1);
        break;
    }

    return { start, end };
  }, [date, view]);

  return useQuery({
    queryKey: ['agendamentos', dateRange, filters],
    queryFn: () => fetchAgendamentos({ dateRange, filters }),
    enabled,
    staleTime: 30000, // 30 segundos
    refetchInterval: 60000, // 1 minuto
  });
}
```

### **useAgendamentoMutations**

```typescript
function useAgendamentoMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createAgendamento,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      queryClient.invalidateQueries({ queryKey: ['disponibilidade'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateAgendamento,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      queryClient.invalidateQueries({ queryKey: ['disponibilidade'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAgendamento,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      queryClient.invalidateQueries({ queryKey: ['disponibilidade'] });
    },
  });

  return {
    create: createMutation,
    update: updateMutation,
    delete: deleteMutation,
  };
}
```

---

## 🎨 Estilos e Temas

### **Arquivo SCSS Principal**

```scss
// calendar-theme.scss
@import '@mui/material/styles';

.agenda-module {
  // Variáveis CSS customizadas
  --calendar-bg: var(--mui-palette-background-paper);
  --calendar-border: var(--mui-palette-divider);
  --calendar-text: var(--mui-palette-text-primary);
  --calendar-header-bg: var(--mui-palette-background-default);
  --calendar-today-bg: rgba(var(--mui-palette-primary-main-rgb), 0.08);
  --calendar-selected-bg: rgba(var(--mui-palette-primary-main-rgb), 0.12);

  // Customização do React Big Calendar
  .rbc-calendar {
    background-color: var(--calendar-bg);
    border: 1px solid var(--calendar-border);
    border-radius: 2px;
    font-family: var(--mui-typography-fontFamily);

    // Header
    .rbc-header {
      background-color: var(--calendar-header-bg);
      border-bottom: 1px solid var(--calendar-border);
      color: var(--calendar-text);
      font-weight: 600;
      font-size: 14px;
      padding: 12px 8px;
      text-transform: capitalize;
    }

    // Time slots
    .rbc-time-slot {
      border-top: 1px solid var(--calendar-border);
      
      &.rbc-now {
        background-color: var(--calendar-today-bg);
      }
    }

    // Today highlight
    .rbc-today {
      background-color: var(--calendar-today-bg);
    }

    // Events
    .rbc-event {
      border-radius: 2px;
      border: none;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      font-size: 12px;
      padding: 2px 4px;
      
      &.rbc-selected {
        box-shadow: 0 0 0 2px var(--mui-palette-primary-main);
      }

      // Status colors
      &.status-pendente {
        background-color: var(--mui-palette-warning-main);
      }
      
      &.status-confirmado {
        background-color: var(--mui-palette-success-main);
      }
      
      &.status-em-andamento {
        background-color: var(--mui-palette-info-main);
      }
      
      &.status-concluido {
        background-color: var(--mui-palette-primary-main);
      }
      
      &.status-cancelado {
        background-color: var(--mui-palette-error-main);
      }
    }

    // Toolbar
    .rbc-toolbar {
      margin-bottom: 16px;
      
      .rbc-btn-group {
        button {
          background: var(--mui-palette-background-paper);
          border: 1px solid var(--calendar-border);
          color: var(--calendar-text);
          
          &.rbc-active {
            background: var(--mui-palette-primary-main);
            color: var(--mui-palette-primary-contrastText);
          }
        }
      }
    }

    // Month view
    .rbc-month-view {
      .rbc-date-cell {
        padding: 8px;
        
        &.rbc-off-range-bg {
          background-color: var(--mui-palette-action-hover);
        }
      }
    }

    // Week/Day view
    .rbc-time-view {
      .rbc-time-gutter {
        background-color: var(--calendar-header-bg);
        border-right: 1px solid var(--calendar-border);
        
        .rbc-timeslot-group {
          border-bottom: 1px solid var(--calendar-border);
        }
      }

      .rbc-time-content {
        border-left: 1px solid var(--calendar-border);
      }
    }
  }

  // Event renderer customizations
  .event-renderer {
    transition: all 0.2s ease-in-out;
    
    &:hover {
      transform: scale(1.02);
      z-index: 10;
    }
    
    &.selected {
      box-shadow: 0 0 0 2px var(--mui-palette-primary-main);
      z-index: 20;
    }

    .event-title {
      font-weight: 600;
      font-size: 12px;
      line-height: 1.2;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .event-subtitle {
      font-size: 10px;
      opacity: 0.9;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .event-time {
      font-size: 9px;
      font-family: monospace;
      opacity: 0.8;
    }
  }

  // Mobile optimizations
  @media (max-width: 768px) {
    .rbc-calendar {
      .rbc-header {
        font-size: 12px;
        padding: 8px 4px;
      }

      .rbc-event {
        font-size: 11px;
        padding: 1px 2px;
      }
    }

    .event-renderer {
      .event-title {
        font-size: 11px;
      }

      .event-subtitle {
        font-size: 9px;
      }

      .event-time {
        font-size: 8px;
      }
    }
  }

  // Dark mode adjustments
  [data-mui-color-scheme="dark"] & {
    --calendar-bg: var(--mui-palette-background-paper);
    --calendar-border: rgba(255, 255, 255, 0.12);
    --calendar-text: var(--mui-palette-text-primary);
    --calendar-header-bg: var(--mui-palette-background-default);
    
    .rbc-calendar {
      .rbc-event {
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
      }
    }
  }

  // Loading states
  .calendar-loading {
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(var(--mui-palette-background-paper-rgb), 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
  }

  // Animations
  .event-enter {
    opacity: 0;
    transform: scale(0.8);
  }

  .event-enter-active {
    opacity: 1;
    transform: scale(1);
    transition: all 0.3s ease-out;
  }

  .event-exit {
    opacity: 1;
    transform: scale(1);
  }

  .event-exit-active {
    opacity: 0;
    transform: scale(0.8);
    transition: all 0.3s ease-in;
  }
}
```

---

## 📚 Resumo dos Componentes

### **Componentes Principais**
1. **CalendarView** - Container principal com React Big Calendar
2. **EventRenderer** - Renderização customizada de eventos
3. **EventModal** - Modal de criação/edição com formulário completo
4. **CalendarToolbar** - Navegação, filtros e ações
5. **MobileCalendar** - Versão otimizada para mobile

### **Componentes de Suporte**
1. **EventDrawer** - Detalhes do evento em drawer
2. **TimeSlotPicker** - Seletor de horários
3. **ServiceSelector** - Seleção de serviços
4. **ProfessionalSelector** - Seleção de profissional
5. **AvailabilityGrid** - Grade de disponibilidade

### **Hooks Customizados**
1. **useAgendamentos** - Busca e cache de agendamentos
2. **useAgendamentoMutations** - Operações CRUD
3. **useDisponibilidade** - Verificação de disponibilidade
4. **useCalendarState** - Estado global do calendário

### **Padrões de Implementação**
- ✅ **TypeScript rigoroso** com interfaces completas
- ✅ **React Hook Form + Zod** para formulários
- ✅ **React Query** para estado e cache
- ✅ **MUI Theme** integração completa
- ✅ **Responsividade** mobile-first
- ✅ **Acessibilidade** WCAG 2.1 AA
- ✅ **Performance** otimizada com lazy loading

---

**Próximo**: [Guia de Implementação](./IMPLEMENTACAO.md)