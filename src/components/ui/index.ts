// Design System v2 — Barrel Export
// Centraliza exports dos componentes DS (MUI wrappers padronizados)

// —— DS Components ——
export { default as DSButton } from './DSButton';
export { default as DSTextField } from './DSTextField';
export { default as DSSelect } from './DSSelect';
export { default as DSDateTime } from './DSDateTime';
export { default as DSTable } from './DSTable';
export { default as DSDialog } from './DSDialog';
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
export { default as ErrorView } from './ErrorView';
export { default as ForbiddenView } from './ForbiddenView';
