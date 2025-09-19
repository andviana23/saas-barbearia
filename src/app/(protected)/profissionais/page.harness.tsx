// Harness simplificado profissionais para E2E_MODE=1
export default function ProfissionaisHarness() {
  return (
    <div data-testid="profissionais-content" style={{ padding: 24 }}>
      <div
        data-testid="profissionais-list"
        style={{
          marginBottom: 16,
          background: 'var(--mui-palette-surfaces-surface2)',
          padding: 16,
          borderRadius: 8,
        }}
      >
        <h3>Lista de Profissionais</h3>
        <div>Carlos Silva - Barbeiro</div>
        <div>Ana Costa - Cabelereira</div>
      </div>
      <button
        data-testid="novo-profissional-button"
        style={{
          padding: '8px 16px',
          background: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: 4,
        }}
      >
        Novo Profissional
      </button>
    </div>
  );
}
