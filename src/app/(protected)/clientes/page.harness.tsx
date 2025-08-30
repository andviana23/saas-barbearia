// Harness simplificado clientes para E2E_MODE=1
export default function ClientesHarness() {
  return (
    <div data-testid="clientes-content" style={{ padding: 24 }}>
      <div
        data-testid="clientes-list"
        style={{ marginBottom: 16, background: '#f9fafb', padding: 16, borderRadius: 8 }}
      >
        <h3>Lista de Clientes</h3>
        <div>João Silva - (11) 99999-9999</div>
        <div>Maria Santos - (11) 88888-8888</div>
      </div>
      <button
        data-testid="novo-cliente-button"
        style={{
          padding: '8px 16px',
          background: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: 4,
        }}
      >
        Novo Cliente
      </button>
    </div>
  );
}
