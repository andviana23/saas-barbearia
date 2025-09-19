// Harness simplificado configuracoes para E2E_MODE=1
export default function ConfiguracoesHarness() {
  return (
    <div data-testid="configuracoes-content" style={{ padding: 24 }}>
      <h1>Configurações</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
        <a
          data-testid="perfil-link"
          href="/configuracoes/perfil"
          style={{
            padding: 16,
            background: 'var(--mui-palette-surfaces-surface2)',
            borderRadius: 8,
            textDecoration: 'none',
            color: 'var(--mui-palette-text-primary)',
            border: '1px solid var(--mui-palette-divider)',
          }}
        >
          👤 Perfil
          <div
            style={{ fontSize: '14px', color: 'var(--mui-palette-text-secondary)', marginTop: 4 }}
          >
            Dados pessoais e preferências
          </div>
        </a>
        <a
          data-testid="unidade-link"
          href="/configuracoes/unidade"
          style={{
            padding: 16,
            background: '#f3f4f6',
            borderRadius: 8,
            textDecoration: 'none',
            color: '#1f2937',
            border: '1px solid #d1d5db',
          }}
        >
          🏪 Unidade
          <div style={{ fontSize: '14px', color: '#6b7280', marginTop: 4 }}>
            Configurações da barbearia
          </div>
        </a>
        <a
          data-testid="sistema-link"
          href="/configuracoes/sistema"
          style={{
            padding: 16,
            background: '#f3f4f6',
            borderRadius: 8,
            textDecoration: 'none',
            color: '#1f2937',
            border: '1px solid #d1d5db',
          }}
        >
          ⚙️ Sistema
          <div style={{ fontSize: '14px', color: '#6b7280', marginTop: 4 }}>
            Configurações avançadas
          </div>
        </a>
      </div>
    </div>
  );
}
