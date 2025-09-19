// Design System v2 — Barrel Export
// Centraliza exports dos componentes DS (MUI wrappers padronizados)

// —— DS Components ——
export { default as DSButton } from './DSButton';
export { default as DSTextField } from './DSTextField';
export { default as DSSelect } from './DSSelect';
export { default as DSConfirmDialog } from './DSConfirmDialog';
export { default as DSDeleteDialog } from './DSDeleteDialog';
export { default as DSCheckbox } from './DSCheckbox';
export { default as DSRadioGroup } from './DSRadioGroup';
export { default as DSTextArea } from './DSTextArea';
export { default as DSAutocomplete } from './DSAutocomplete';
export { default as DSSwitch } from './DSSwitch';
export { default as DSFormValidation, useFormValidation } from './DSFormValidation';
export { default as DSTypography, DSHeading, DSDisplay, DSLabel, DSHelper, DSError } from './DSTypography';
export { default as DSSpacing, DSStack, DSGrid, DSContainer, useSpacing } from './DSSpacing';
export { default as DSIcon, DSStatusIcon, DSActionIcon, DSNavigationIcon, useIcons } from './DSIcon';
export { 
  DSLoading, 
  DSSkeleton, 
  DSPageLoading, 
  DSButtonLoading, 
  DSTableLoading, 
  DSCardLoading, 
  DSListLoading,
  useLoading 
} from './DSLoading';
export { 
  DSThemeProvider, 
  DSThemeToggle, 
  useTheme as useDSTheme, 
  useThemeColors 
} from './DSTheme';
export { 
  DSBreadcrumbs, 
  DSPageBreadcrumbs, 
  useBreadcrumbs 
} from './DSBreadcrumbs';
export { 
  DSEmptyState,
  DSEmptySearch,
  DSEmptyFilter,
  DSEmptyError,
  DSEmptyOffline,
  DSEmptyAgendamentos,
  DSEmptyClientes,
  DSEmptyFinanceiro,
  DSEmptyNotificacoes
} from './DSEmptyState';
export { 
  DSNotificationProvider,
  DSProgressFeedback,
  DSAnimatedBox,
  useDSNotifications,
  useFeedback
} from './DSFeedback';

// Example component (for development/testing)
export { default as DesignSystemExample } from '../../examples/DesignSystemExample';
export { default as DSDateTime } from './DSDateTime';
export { default as DSTable } from './DSTable';
export { default as DSDialog } from './DSDialog';
export { default as DSModal } from './DSModal';
export { default as DSCard } from './DSCard';
export { default as PageHeader } from './PageHeader';
export { default as ThemeToggle } from './ThemeToggle';

// (Opcional) Exportar tipos — ative se os arquivos exportarem os types
export type { DSDialogProps } from './DSDialog';

// —— DS Charts ——
export { DSLineArea, DSBars, DSPieChart } from './DSChartWrapper';

// —— UI Utilities ——
export { default as Card } from './Card';
export { default as EmptyState } from './EmptyState';
export { default as FormRow } from './FormRow';
export { default as AccessibilityControls } from './AccessibilityControls';

// —— System Components ——
export { ErrorBoundary } from './ErrorBoundary';
export { NotificationProvider, useNotifications } from './NotificationSystem';
export { ClientOnly } from './ClientOnly';
export { NoSSR } from './NoSSR';

// —— UX Global Components (Fase 5) ——
export { default as LoadingScreen } from './LoadingScreen';
export { default as SkeletonLoader } from './SkeletonLoader';
export { default as ErrorView } from './ErrorView';
export { default as ForbiddenView } from './ForbiddenView';
export { default as RetryButton } from './RetryButton';
