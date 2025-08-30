'use client';

import React from 'react';

export function LayoutHarness({ children }: { children: React.ReactNode }) {
  // Layout mínimo para testes de smoke em E2E_MODE=1
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      data-testid="app-root"
      style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}
    >
      <header
        data-testid="app-header"
        style={{
          height: 56,
          background: '#111827',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: 16,
        }}
      >
        <button data-testid="mobile-menu-button" style={{ display: isMobile ? 'block' : 'none' }}>
          ☰
        </button>
        <strong>Trato Harness</strong>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 16, alignItems: 'center' }}>
          <select data-testid="unidade-selector" defaultValue="unidade-1" style={{ padding: 4 }}>
            <option value="unidade-1">Unidade 1</option>
            <option value="unidade-2">Unidade 2</option>
          </select>
          <div data-testid="user-menu">user@test</div>
        </div>
      </header>
      <div style={{ flex: 1, display: 'flex' }}>
        <nav
          data-testid="app-sidebar"
          style={{
            width: isMobile ? 0 : 220,
            background: '#1f2937',
            color: '#f3f4f6',
            padding: isMobile ? 0 : 12,
            display: isMobile ? 'none' : 'flex',
            flexDirection: 'column',
            gap: 8,
            overflow: 'hidden',
            position: 'relative',
            zIndex: 1000,
          }}
        >
          <a
            data-testid="nav-dashboard"
            href="/dashboard"
            style={{
              color: '#f3f4f6',
              textDecoration: 'none',
              padding: 8,
              display: 'block',
              position: 'relative',
              zIndex: 1001,
            }}
          >
            Dashboard
          </a>
          <a
            data-testid="nav-clientes"
            href="/clientes"
            style={{
              color: '#f3f4f6',
              textDecoration: 'none',
              padding: 8,
              display: 'block',
              position: 'relative',
              zIndex: 1001,
            }}
          >
            Clientes
          </a>
          <a
            data-testid="nav-agenda"
            href="/agenda"
            style={{
              color: '#f3f4f6',
              textDecoration: 'none',
              padding: 8,
              display: 'block',
              position: 'relative',
              zIndex: 1001,
            }}
          >
            Agenda
          </a>
          <a
            data-testid="nav-servicos"
            href="/servicos"
            style={{
              color: '#f3f4f6',
              textDecoration: 'none',
              padding: 8,
              display: 'block',
              position: 'relative',
              zIndex: 1001,
            }}
          >
            Serviços
          </a>
          <a
            data-testid="nav-profissionais"
            href="/profissionais"
            style={{
              color: '#f3f4f6',
              textDecoration: 'none',
              padding: 8,
              display: 'block',
              position: 'relative',
              zIndex: 1001,
            }}
          >
            Profissionais
          </a>
          <a
            data-testid="nav-fila"
            href="/fila"
            style={{
              color: '#f3f4f6',
              textDecoration: 'none',
              padding: 8,
              display: 'block',
              position: 'relative',
              zIndex: 1001,
            }}
          >
            Fila
          </a>
          <a
            data-testid="nav-caixa"
            href="/caixa"
            style={{
              color: '#f3f4f6',
              textDecoration: 'none',
              padding: 8,
              display: 'block',
              position: 'relative',
              zIndex: 1001,
            }}
          >
            Caixa
          </a>
          <a
            data-testid="nav-relatorios"
            href="/relatorios"
            style={{
              color: '#f3f4f6',
              textDecoration: 'none',
              padding: 8,
              display: 'block',
              position: 'relative',
              zIndex: 1001,
            }}
          >
            Relatórios
          </a>
          <a
            data-testid="nav-configuracoes"
            href="/configuracoes"
            style={{
              color: '#f3f4f6',
              textDecoration: 'none',
              padding: 8,
              display: 'block',
              position: 'relative',
              zIndex: 1001,
            }}
          >
            Configurações
          </a>
        </nav>
        <main style={{ flex: 1, padding: 16, position: 'relative', zIndex: 1 }}>{children}</main>
      </div>
      <footer
        data-testid="app-footer"
        style={{ background: '#111827', color: '#fff', padding: 8, textAlign: 'center' }}
      >
        v-harness
      </footer>
    </div>
  );
}
