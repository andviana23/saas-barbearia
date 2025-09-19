import React from 'react';
// Mock simples para evitar cálculos de layout das transições em JSDOM
jest.mock('react-transition-group', () => {
  const Noop = (props: { in?: boolean; children?: React.ReactNode }) =>
    props.in === false ? null : props.children;
  return { Transition: Noop, CSSTransition: Noop };
});
// Mock de componentes MUI pesados para versão simplificada
jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  interface BasicProps {
    children?: React.ReactNode;
  }
  return {
    ...actual,
    Snackbar: ({ children }: BasicProps) => <div data-testid="snackbar">{children}</div>,
    Alert: ({
      children,
      severity,
      icon,
      action,
    }: {
      children?: React.ReactNode;
      severity?: string;
      icon?: React.ReactNode;
      action?: React.ReactNode;
    }) => (
      <div role="alert" data-severity={severity}>
        {icon}
        {children}
        {action}
      </div>
    ),
    AlertTitle: ({ children }: BasicProps) => <strong>{children}</strong>,
    IconButton: ({
      children,
      onClick,
      'aria-label': ariaLabel,
    }: {
      children?: React.ReactNode;
      onClick?: () => void;
      'aria-label'?: string;
    }) => (
      <button onClick={onClick} aria-label={ariaLabel} type="button">
        {children}
      </button>
    ),
    Collapse: ({ in: inProp, children }: { in?: boolean; children?: React.ReactNode }) =>
      inProp === false ? null : <div>{children}</div>,
  };
});
import { render, screen, fireEvent } from '@testing-library/react';
import {
  NotificationProvider,
  useNotifications,
  useQuickNotifications,
} from './NotificationSystem';

function TestHarness() {
  const { addNotification, clearAll } = useNotifications();
  const { showSuccess } = useQuickNotifications();
  return (
    <div>
      <button
        onClick={() =>
          addNotification({ type: 'info', title: 'Info', message: 'Mensagem curta', duration: 0 })
        }
      >
        add
      </button>
      <button
        onClick={() =>
          addNotification({
            type: 'warning',
            title: 'Warn',
            message: 'x'.repeat(120),
            duration: 0,
          })
        }
      >
        long
      </button>
      <button onClick={() => showSuccess('Ok', 'Tudo certo')}>quick</button>
      <button onClick={() => clearAll()}>clear</button>
    </div>
  );
}

describe('NotificationSystem', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  function renderWithProvider() {
    return render(
      <NotificationProvider>
        <TestHarness />
      </NotificationProvider>,
    );
  }

  it('adiciona e limpa notificação simples', () => {
    renderWithProvider();
    fireEvent.click(screen.getByText('add'));
    expect(screen.getByText('Info')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Fechar notificação'));
  });

  it('expande mensagem longa', () => {
    renderWithProvider();
    fireEvent.click(screen.getByText('long'));
    const toggle = screen.getByText('Mostrar mais');
    fireEvent.click(toggle);
    expect(screen.getByText('Mostrar menos')).toBeInTheDocument();
  });

  it('usa hook rápido showSuccess', () => {
    renderWithProvider();
    fireEvent.click(screen.getByText('quick'));
    expect(screen.getByText('Ok')).toBeInTheDocument();
  });
});
