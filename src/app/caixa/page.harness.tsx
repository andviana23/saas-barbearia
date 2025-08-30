// Harness simplificado caixa para E2E_MODE=1
export default function CaixaHarness() {
  return (
    <div data-testid="caixa-content" style={{ padding: 24 }}>
      <div
        data-testid="resumo-financeiro"
        style={{ marginBottom: 16, background: '#f9fafb', padding: 16, borderRadius: 8 }}
      >
        <h3>Resumo Financeiro</h3>
        <div>Receita do Dia: R$ 450,00</div>
        <div>Despesas: R$ 50,00</div>
        <div>Saldo: R$ 400,00</div>
      </div>
      <button
        data-testid="novo-lancamento-button"
        style={{
          padding: '8px 16px',
          background: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: 4,
        }}
      >
        Novo Lançamento
      </button>
    </div>
  );
}
