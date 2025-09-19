// Harness simplificado fila para E2E_MODE=1
export default function FilaHarness() {
  return (
    <div data-testid="fila-content" style={{ padding: 24 }}>
      <div
        data-testid="painel-fila"
        style={{
          marginBottom: 16,
          background: 'var(--mui-palette-surfaces-surface2)',
          padding: 16,
          borderRadius: 8,
        }}
      >
        <h3>Fila de Atendimento</h3>
        <div>1. João Silva - Aguardando</div>
        <div>2. Maria Santos - Em atendimento</div>
      </div>
      <button
        data-testid="adicionar-fila-button"
        style={{
          padding: '8px 16px',
          background: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: 4,
        }}
      >
        Adicionar à Fila
      </button>
    </div>
  );
}
